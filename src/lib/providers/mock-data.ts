import type {
  CareerPagePlatform,
  OpportunityCategory,
} from "@/lib/types";

export interface MockEmployerSeed {
  name: string;
  website: string;
  category: OpportunityCategory;
  street: string;
  platform: CareerPagePlatform;
  careerPath: string;
  isHiring: boolean;
  roles?: { title: string }[];
}

export const MOCK_EMPLOYER_SEEDS: MockEmployerSeed[] = [
  // Allen-area style names for demo resonance
  { name: "North Italia", website: "https://northitalia.example", category: "restaurant", street: "190 E Stacy Rd", platform: "custom", careerPath: "/careers", isHiring: true, roles: [{ title: "Host" }, { title: "Server" }] },
  { name: "Mexican Sugar", website: "https://mexicansugar.example", category: "restaurant", street: "716 Market St", platform: "custom", careerPath: "/join-us", isHiring: true, roles: [{ title: "Host" }] },
  { name: "Spectrum", website: "https://spectrum.example", category: "retail", street: "820 Central Expy", platform: "workday", careerPath: "/careers", isHiring: true, roles: [{ title: "Sales Associate" }] },
  { name: "Lifetime Fitness", website: "https://lifetime.example", category: "fitness", street: "971 Sam Rayburn Hwy", platform: "paycom", careerPath: "/careers", isHiring: true, roles: [{ title: "Front Desk Associate" }] },
  { name: "Torchy's Tacos", website: "https://torchys.example", category: "restaurant", street: "210 N Greenville Ave", platform: "custom", careerPath: "/careers", isHiring: true, roles: [{ title: "Crew Member" }] },
  { name: "Raising Cane's", website: "https://canes.example", category: "restaurant", street: "404 S Greenville Ave", platform: "custom", careerPath: "/jobs", isHiring: true, roles: [{ title: "Cashier" }, { title: "Shift Leader" }] },

  // Employers researched but not hiring
  { name: "Harvest & Hearth", website: "https://harvesthearth.example", category: "restaurant", street: "142 Main St", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Riverside Hospitality Group", website: "https://riversidehospitality.example", category: "restaurant", street: "3 Harbor Rd", platform: "custom", careerPath: "/work-with-us", isHiring: false },
  { name: "Fresh Bowl Kitchen", website: "https://freshbowl.example", category: "restaurant", street: "28 Grove St", platform: "bamboohr", careerPath: "/hiring", isHiring: false },
  { name: "Cornerstone Retail Co.", website: "https://cornerstoneretail.example", category: "retail", street: "210 Market Ave", platform: "custom", careerPath: "/jobs", isHiring: false },
  { name: "Urban Thread", website: "https://urbanthread.example", category: "retail", street: "67 Style District", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Target", website: "https://target.example", category: "retail", street: "150 W Stacy Rd", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Kohl's", website: "https://kohls.example", category: "retail", street: "940 W Stacy Rd", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Northline Fitness", website: "https://northlinefitness.example", category: "fitness", street: "88 Wellness Blvd", platform: "custom", careerPath: "/join-our-team", isHiring: false },
  { name: "Pulse Athletics", website: "https://pulseathletics.example", category: "fitness", street: "401 Energy Ln", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Orangetheory", website: "https://orangetheory.example", category: "fitness", street: "1201 E Main St", platform: "paycom", careerPath: "/careers", isHiring: false },
  { name: "Summit Community Center", website: "https://summitcommunity.example", category: "customer_service", street: "55 Civic Plaza", platform: "custom", careerPath: "/employment", isHiring: false },
  { name: "Metro Service Partners", website: "https://metroservice.example", category: "customer_service", street: "12 Service Center Dr", platform: "smartrecruiters", careerPath: "/open-roles", isHiring: false },
  { name: "Allen ISD", website: "https://allenisd.example", category: "customer_service", street: "612 E Bethany Dr", platform: "custom", careerPath: "/employment", isHiring: false },
  { name: "Brightpath Labs", website: "https://brightpathlabs.example", category: "technology", street: "17 Innovation Way", platform: "greenhouse", careerPath: "/careers", isHiring: false },
  { name: "Cedar Tech Collective", website: "https://cedartech.example", category: "technology", street: "44 Builder St", platform: "lever", careerPath: "/jobs", isHiring: false },
  { name: "Launchpad Internships", website: "https://launchpadintern.example", category: "internships", street: "9 Campus Row", platform: "custom", careerPath: "/programs", isHiring: false },
  { name: "St. Jude Catholic Church", website: "https://stjudeallen.example", category: "customer_service", street: "1515 N Greenville Ave", platform: "custom", careerPath: "/employment", isHiring: false },
  { name: "Waterbrook Church", website: "https://waterbrook.example", category: "customer_service", street: "3401 E Park Blvd", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Chick-fil-A Allen", website: "https://cfaallen.example", category: "restaurant", street: "945 W Stacy Rd", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Whataburger", website: "https://whataburger.example", category: "restaurant", street: "602 E Main St", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Smoothie King", website: "https://smoothieking.example", category: "restaurant", street: "820 W McDermott Dr", platform: "custom", careerPath: "/jobs", isHiring: false },
  { name: "Petco", website: "https://petco.example", category: "retail", street: "1500 N Greenville Ave", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Best Buy", website: "https://bestbuy.example", category: "retail", street: "945 W Stacy Rd", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Planet Fitness", website: "https://planetfitness.example", category: "fitness", street: "210 N Greenville Ave", platform: "paycom", careerPath: "/careers", isHiring: false },
  { name: "Crunch Fitness", website: "https://crunch.example", category: "fitness", street: "404 S Greenville Ave", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Mathnasium", website: "https://mathnasium.example", category: "customer_service", street: "1201 E Main St", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Kumon Allen", website: "https://kumonallen.example", category: "customer_service", street: "820 W McDermott Dr", platform: "custom", careerPath: "/employment", isHiring: false },
  { name: "Code Ninjas", website: "https://codeninjas.example", category: "technology", street: "404 S Greenville Ave", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Apple Store", website: "https://apple.example", category: "retail", street: "820 Central Expy", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Verizon", website: "https://verizon.example", category: "retail", street: "150 W Stacy Rd", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "AT&T", website: "https://att.example", category: "retail", street: "945 W Stacy Rd", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "H-E-B", website: "https://heb.example", category: "retail", street: "1500 N Greenville Ave", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Kroger", website: "https://kroger.example", category: "retail", street: "1201 E Main St", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Walmart", website: "https://walmart.example", category: "retail", street: "930 W Stacy Rd", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "HomeGoods", website: "https://homegoods.example", category: "retail", street: "820 Central Expy", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Ulta Beauty", website: "https://ulta.example", category: "retail", street: "404 S Greenville Ave", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Sephora", website: "https://sephora.example", category: "retail", street: "210 N Greenville Ave", platform: "workday", careerPath: "/careers", isHiring: false },
  { name: "Starbucks", website: "https://starbucks.example", category: "restaurant", street: "602 E Main St", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Dunkin'", website: "https://dunkin.example", category: "restaurant", street: "820 W McDermott Dr", platform: "custom", careerPath: "/jobs", isHiring: false },
  { name: "Panera Bread", website: "https://panera.example", category: "restaurant", street: "945 W Stacy Rd", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Chipotle", website: "https://chipotle.example", category: "restaurant", street: "150 W Stacy Rd", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Panda Express", website: "https://pandaexpress.example", category: "restaurant", street: "1201 E Main St", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "Jersey Mike's", website: "https://jerseymikes.example", category: "restaurant", street: "404 S Greenville Ave", platform: "custom", careerPath: "/jobs", isHiring: false },
  { name: "Nothing Bundt Cakes", website: "https://nothingbundt.example", category: "restaurant", street: "210 N Greenville Ave", platform: "custom", careerPath: "/careers", isHiring: false },
  { name: "YMCA Allen", website: "https://ymcaallen.example", category: "fitness", street: "820 Central Expy", platform: "custom", careerPath: "/employment", isHiring: false },
  { name: "Gold's Gym", website: "https://golds.example", category: "fitness", street: "602 E Main St", platform: "paycom", careerPath: "/careers", isHiring: false },
  { name: "Pure Barre", website: "https://purebarre.example", category: "fitness", street: "1500 N Greenville Ave", platform: "custom", careerPath: "/careers", isHiring: false },
];

export function seededDistance(seed: string, radius: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return Math.round((0.2 + normalized * 0.75) * radius * 10) / 10;
}
