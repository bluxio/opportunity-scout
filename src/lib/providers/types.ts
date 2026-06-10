import type {
  CareerPage,
  Employer,
  RawOpportunity,
  SearchParams,
} from "@/lib/types";

export interface OpportunityProvider {
  readonly name: string;
  readonly platform: CareerPage["platform"];

  discoverEmployers(params: SearchParams): Promise<Employer[]>;
  findCareerPage(employer: Employer): Promise<CareerPage | null>;
  fetchOpportunities(
    employer: Employer,
    careerPage: CareerPage,
  ): Promise<RawOpportunity[]>;
}
