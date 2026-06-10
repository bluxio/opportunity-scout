import { enrichOpportunities, enrichOpportunityQuick } from "@/lib/gemini";
import { saveSearchSession } from "@/lib/db";
import {
  getDiscoveryProvider,
  getProviderForPlatform,
  MockProvider,
} from "@/lib/providers";
import type {
  Employer,
  EmployerResearch,
  RawOpportunity,
  ScoutReport,
  SearchParams,
  SearchSession,
  WorkflowEvent,
  WorkflowStep,
  WorkflowStepId,
} from "@/lib/types";
import { delay } from "@/lib/utils";

export interface AgentWorkflow {
  run(
    params: SearchParams,
    onEvent?: (event: WorkflowEvent) => void,
  ): Promise<SearchSession>;
}

const STEP_DEFINITIONS: { id: WorkflowStepId; label: string }[] = [
  { id: "discover_employers", label: "Discovering local employers" },
  { id: "find_career_pages", label: "Finding career pages" },
  { id: "detect_hiring_signals", label: "Detecting hiring signals" },
  { id: "find_opportunities", label: "Extracting opportunities" },
  { id: "generate_summaries", label: "Summarizing findings" },
  { id: "rank_opportunities", label: "Ranking matches" },
  { id: "store_results", label: "Saving scout report" },
];

const STRONG_MATCH_THRESHOLD = 82;

function createInitialSteps(): WorkflowStep[] {
  return STEP_DEFINITIONS.map((step) => ({
    ...step,
    status: "pending" as const,
  }));
}

function updateStep(
  steps: WorkflowStep[],
  stepId: WorkflowStepId,
  status: WorkflowStep["status"],
  detail?: string,
): WorkflowStep[] {
  return steps.map((step) =>
    step.id === stepId ? { ...step, status, detail } : step,
  );
}

export class OpportunityScoutWorkflow implements AgentWorkflow {
  private mock = new MockProvider();

  async run(
    params: SearchParams,
    onEvent?: (event: WorkflowEvent) => void,
  ): Promise<SearchSession> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    let steps = createInitialSteps();
    const employerResearch: EmployerResearch[] = [];

    const emit = (event: WorkflowEvent) => onEvent?.(event);

    const setStep = async (
      stepId: WorkflowStepId,
      status: WorkflowStep["status"],
      detail?: string,
      pauseMs = 350,
    ) => {
      steps = updateStep(steps, stepId, status, detail);
      emit({
        type: "step_update",
        step: stepId,
        stepStatus: status,
        message: detail,
      });
      if (pauseMs > 0) await delay(pauseMs);
    };

    const emitEmployer = (research: EmployerResearch) => {
      employerResearch.push(research);
      emit({ type: "employer_research", employerResearch: research });
    };

    try {
      const city = params.location.split(",")[0]?.trim() || params.location;
      const discovery = getDiscoveryProvider();

      await setStep("discover_employers", "running");
      const allEmployers = await discovery.discoverEmployers(params);
      await setStep(
        "discover_employers",
        "complete",
        `Mapped ${allEmployers.length} employers near ${city}`,
        500,
      );

      await setStep("find_career_pages", "running");
      const employersWithPages: Employer[] = [];

      for (const employer of allEmployers) {
        const provider = getProviderForPlatform(employer.platform ?? "custom");
        const careerPage = await provider.findCareerPage(employer);
        if (careerPage) {
          employersWithPages.push({
            ...employer,
            careerPageUrl: careerPage.url,
            platform: careerPage.platform,
          });
        }
      }

      await setStep(
        "find_career_pages",
        "complete",
        `Located career pages — Greenhouse, Workday, custom sites, and more`,
        400,
      );

      await setStep("detect_hiring_signals", "running");
      const hiringEmployers: Employer[] = [];
      let noOpenings = 0;
      const rawOpportunities: RawOpportunity[] = [];

      let oppIndex = 0;

      for (const employer of employersWithPages) {
        const careerPage = {
          url: employer.careerPageUrl!,
          platform: employer.platform ?? "custom",
        };

        const opportunities = await this.mock.fetchOpportunities(
          employer,
          careerPage,
        );
        const categoryMatch = params.categories.includes(employer.category);
        const relevant = categoryMatch ? opportunities : [];

        if (relevant.length > 0) {
          hiringEmployers.push(employer);
          rawOpportunities.push(...relevant);

          for (const opp of relevant) {
            const scored = enrichOpportunityQuick(opp, employer, params, oppIndex++);
            emit({ type: "opportunity", opportunity: scored });
            emitEmployer({
              employerId: employer.id,
              employerName: employer.name,
              status: "hiring",
              message: `Found ${opp.title} at ${employer.name}`,
              platform: employer.platform,
              roleCount: relevant.length,
            });
            await delay(320);
          }
        } else {
          noOpenings++;
          emitEmployer({
            employerId: employer.id,
            employerName: employer.name,
            status: "no_openings",
            message: `${employer.name} — no openings`,
            platform: employer.platform,
          });
        }

        await delay(employer.hiringStatus === "hiring" ? 0 : 40);
      }

      await setStep(
        "detect_hiring_signals",
        "complete",
        `${hiringEmployers.length} hiring · ${noOpenings} with no openings`,
        400,
      );

      await setStep("find_opportunities", "running");
      await setStep(
        "find_opportunities",
        "complete",
        `${rawOpportunities.length} roles extracted from career pages`,
        300,
      );

      await setStep("generate_summaries", "running");
      const scored = await enrichOpportunities(
        rawOpportunities,
        hiringEmployers,
        params,
      );
      await setStep(
        "generate_summaries",
        "complete",
        `Identified which employers are worth your attention`,
        300,
      );

      await setStep("rank_opportunities", "running", undefined, 200);
      const strongMatches = scored.filter(
        (o) => o.fitScore >= STRONG_MATCH_THRESHOLD,
      ).length;

      await setStep(
        "rank_opportunities",
        "complete",
        strongMatches > 0
          ? `${strongMatches} roles match your background`
          : "Ranked available roles",
        200,
      );

      const report: ScoutReport = {
        employersResearched: allEmployers.length,
        noOpenings,
        hiring: hiringEmployers.length,
        strongMatches,
        platformsChecked: [
          ...new Set(employersWithPages.map((e) => e.platform ?? "custom")),
        ],
      };

      await setStep("store_results", "running");
      const completedAt = new Date().toISOString();

      const session: SearchSession = {
        id,
        params,
        status: "complete",
        steps,
        opportunities: scored,
        employerResearch,
        report,
        createdAt,
        completedAt,
      };

      await saveSearchSession(session);
      await setStep("store_results", "complete", "Scout report ready", 200);

      const finalSession: SearchSession = { ...session, steps };
      emit({ type: "complete", session: finalSession });
      return finalSession;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Workflow failed";
      const session: SearchSession = {
        id,
        params,
        status: "error",
        steps,
        opportunities: [],
        employerResearch,
        report: {
          employersResearched: 0,
          noOpenings: 0,
          hiring: 0,
          strongMatches: 0,
          platformsChecked: [],
        },
        createdAt,
        error: message,
      };
      emit({ type: "error", message });
      return session;
    }
  }
}
