import type { OpportunityProvider } from "@/lib/providers/types";
import type {
  CareerPage,
  Employer,
  RawOpportunity,
  SearchParams,
} from "@/lib/types";

export class WorkdayProvider implements OpportunityProvider {
  readonly name = "Workday";
  readonly platform = "workday" as const;

  async discoverEmployers(_params: SearchParams): Promise<Employer[]> {
    return [];
  }

  async findCareerPage(employer: Employer): Promise<CareerPage | null> {
    return {
      url: `${employer.website}/careers`,
      platform: "workday",
    };
  }

  async fetchOpportunities(
    _employer: Employer,
    _careerPage: CareerPage,
  ): Promise<RawOpportunity[]> {
    // Workday career pages require per-employer integration.
    throw new Error("WorkdayProvider: not yet implemented");
  }
}
