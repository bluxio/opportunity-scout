import type { OpportunityProvider } from "@/lib/providers/types";
import {
  MOCK_EMPLOYER_SEEDS,
  seededDistance,
} from "@/lib/providers/mock-data";
import type {
  CareerPage,
  Employer,
  RawOpportunity,
  SearchParams,
} from "@/lib/types";
import { delay } from "@/lib/utils";

export class MockProvider implements OpportunityProvider {
  readonly name = "Mock";
  readonly platform = "custom" as const;

  async discoverEmployers(params: SearchParams): Promise<Employer[]> {
    const city = params.location.split(",")[0]?.trim() || params.location;

    // Discover all local employers in radius — categories filter hiring signals later
    return MOCK_EMPLOYER_SEEDS.map((seed, index) => {
      const id = `${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
      return {
        id,
        name: seed.name,
        website: seed.website,
        category: seed.category,
        address: `${seed.street}, ${city}`,
        distanceMiles: seededDistance(`${params.location}-${seed.name}`, params.radius),
        platform: seed.platform,
        hiringStatus: seed.isHiring ? "hiring" : "no_openings",
      };
    });
  }

  async findCareerPage(employer: Employer): Promise<CareerPage | null> {
    await delay(80);
    const seed = MOCK_EMPLOYER_SEEDS.find((s) => employer.name === s.name);
    if (!seed) return null;

    return {
      url: `${seed.website}${seed.careerPath}`,
      platform: seed.platform,
    };
  }

  async fetchOpportunities(
    employer: Employer,
    careerPage: CareerPage,
  ): Promise<RawOpportunity[]> {
    await delay(120);
    const seed = MOCK_EMPLOYER_SEEDS.find((s) => employer.name === s.name);
    if (!seed?.isHiring || !seed.roles) return [];

    return seed.roles.map((role) => ({
      employerId: employer.id,
      title: role.title,
      location: employer.address,
      applyUrl: `${careerPage.url}?role=${encodeURIComponent(role.title)}`,
      description: `Posted on ${employer.name}'s ${careerPage.platform} careers page.`,
    }));
  }
}
