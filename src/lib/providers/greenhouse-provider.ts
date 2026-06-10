import type { OpportunityProvider } from "@/lib/providers/types";
import type {
  CareerPage,
  Employer,
  RawOpportunity,
  SearchParams,
} from "@/lib/types";

/**
 * Greenhouse boards expose a public jobs API.
 * Implementation detail — not the product narrative.
 */
export class GreenhouseProvider implements OpportunityProvider {
  readonly name = "Greenhouse";
  readonly platform = "greenhouse" as const;

  async discoverEmployers(_params: SearchParams): Promise<Employer[]> {
    // Greenhouse doesn't discover employers — MockProvider handles discovery.
    return [];
  }

  async findCareerPage(employer: Employer): Promise<CareerPage | null> {
    if (!employer.website) return null;
    return {
      url: `${employer.website}/careers`,
      platform: "greenhouse",
    };
  }

  async fetchOpportunities(
    employer: Employer,
    careerPage: CareerPage,
  ): Promise<RawOpportunity[]> {
    const boardToken = process.env.GREENHOUSE_BOARD_TOKEN;
    if (!boardToken) return [];

    try {
      const res = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`,
        { next: { revalidate: 300 } },
      );
      if (!res.ok) return [];

      const data = (await res.json()) as {
        jobs: { id: number; title: string; absolute_url: string; location: { name: string } }[];
      };

      return data.jobs.map((job) => ({
        employerId: employer.id,
        title: job.title,
        location: job.location?.name ?? employer.address,
        applyUrl: job.absolute_url,
        description: `Greenhouse posting at ${employer.name}`,
      }));
    } catch {
      return [];
    }
  }
}
