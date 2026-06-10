import type { OpportunityProvider } from "@/lib/providers/types";
import type {
  CareerPage,
  Employer,
  RawOpportunity,
  SearchParams,
} from "@/lib/types";

export class CustomCareerPageProvider implements OpportunityProvider {
  readonly name = "Custom Career Page";
  readonly platform = "custom" as const;

  async discoverEmployers(_params: SearchParams): Promise<Employer[]> {
    return [];
  }

  async findCareerPage(employer: Employer): Promise<CareerPage | null> {
    const paths = ["/careers", "/jobs", "/join-us", "/employment", "/work-with-us"];
    return {
      url: `${employer.website}${paths[0]}`,
      platform: "custom",
    };
  }

  async fetchOpportunities(
    _employer: Employer,
    _careerPage: CareerPage,
  ): Promise<RawOpportunity[]> {
    // Custom pages need HTML parsing per employer — future integration.
    throw new Error("CustomCareerPageProvider: not yet implemented");
  }
}
