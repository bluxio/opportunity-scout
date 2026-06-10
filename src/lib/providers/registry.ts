import { CustomCareerPageProvider } from "@/lib/providers/custom-career-page-provider";
import { GreenhouseProvider } from "@/lib/providers/greenhouse-provider";
import { LeverProvider } from "@/lib/providers/lever-provider";
import { MockProvider } from "@/lib/providers/mock-provider";
import type { OpportunityProvider } from "@/lib/providers/types";
import { WorkdayProvider } from "@/lib/providers/workday-provider";
import type { CareerPagePlatform } from "@/lib/types";

const providers: OpportunityProvider[] = [
  new MockProvider(),
  new GreenhouseProvider(),
  new LeverProvider(),
  new WorkdayProvider(),
  new CustomCareerPageProvider(),
];

export function getDiscoveryProvider(): OpportunityProvider {
  return new MockProvider();
}

export function getProviderForPlatform(
  platform: CareerPagePlatform,
): OpportunityProvider {
  const match = providers.find((p) => p.platform === platform);
  return match ?? new MockProvider();
}

export {
  MockProvider,
  GreenhouseProvider,
  LeverProvider,
  WorkdayProvider,
  CustomCareerPageProvider,
};
