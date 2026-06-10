import type { OpportunityProvider } from "@/lib/providers/types";
import type {
  CareerPage,
  Employer,
  RawOpportunity,
  SearchParams,
} from "@/lib/types";

/**
 * Lever exposes public posting endpoints for many companies.
 * Implementation detail — not the product narrative.
 */
export class LeverProvider implements OpportunityProvider {
  readonly name = "Lever";
  readonly platform = "lever" as const;

  async discoverEmployers(_params: SearchParams): Promise<Employer[]> {
    return [];
  }

  async findCareerPage(employer: Employer): Promise<CareerPage | null> {
    if (!employer.website) return null;
    return {
      url: `${employer.website}/jobs`,
      platform: "lever",
    };
  }

  async fetchOpportunities(
    employer: Employer,
    careerPage: CareerPage,
  ): Promise<RawOpportunity[]> {
    const companySlug = process.env.LEVER_COMPANY_SLUG;
    if (!companySlug) return [];

    try {
      const res = await fetch(
        `https://api.lever.co/v0/postings/${companySlug}?mode=json`,
        { next: { revalidate: 300 } },
      );
      if (!res.ok) return [];

      const postings = (await res.json()) as {
        id: string;
        text: string;
        hostedUrl: string;
        categories: { location?: string };
      }[];

      return postings.map((posting) => ({
        employerId: employer.id,
        title: posting.text,
        location: posting.categories?.location ?? employer.address,
        applyUrl: posting.hostedUrl,
        description: `Lever posting at ${employer.name}`,
      }));
    } catch {
      return [];
    }
  }
}
