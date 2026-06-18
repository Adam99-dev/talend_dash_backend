import { PrismaClient, Currency, Level, Source } from "@prisma/client";

import { calculateTotalCompensation } from "../lib/calculations";
import { resolveCompany } from "../lib/normalization";

const prisma = new PrismaClient();

const companyInputs = [
  "Google India",
  "GOOGLE",
  "google",
  "Amazon",
  "Meta",
  "Microsoft",
  "Flipkart",
  "Meesho",
  "NVIDIA",
  "TCS",
  "Infosys",
  "Wipro",
  "Razorpay",
  "Zepto",
];

const levels: Level[] = [
  "L3",
  "L4",
  "L5",
  "L6",
  "SDE_I",
  "SDE_II",
  "SDE_III",
  "STAFF",
  "PRINCIPAL",
  "IC4",
  "IC5",
];

const roles = [
  "Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Platform Engineer",
  "Site Reliability Engineer",
];

const locations = [
  "Bengaluru",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Delhi",
  "San Francisco",
  "London",
];

const levelMultiplier: Record<Level, number> = {
  L3: 1,
  L4: 1.35,
  L5: 1.85,
  L6: 2.45,
  SDE_I: 1.05,
  SDE_II: 1.45,
  SDE_III: 1.95,
  STAFF: 2.9,
  PRINCIPAL: 3.8,
  IC4: 1.6,
  IC5: 2.15,
};

async function upsertCompany(input: string) {
  const resolved = resolveCompany(input);
  const metadata = resolved.metadata;

  return prisma.company.upsert({
    where: { normalized_name: resolved.normalizedName },
    update: {
      name: resolved.company ?? input,
      slug: resolved.slug,
      industry: metadata?.industry ?? "Unknown",
      headquarters: metadata?.headquarters ?? "Unknown",
      founded_year: metadata?.foundedYear ?? null,
      headcount_range: metadata?.headcountRange ?? null,
    },
    create: {
      name: resolved.company ?? input,
      slug: resolved.slug,
      normalized_name: resolved.normalizedName,
      industry: metadata?.industry ?? "Unknown",
      headquarters: metadata?.headquarters ?? "Unknown",
      founded_year: metadata?.foundedYear ?? null,
      headcount_range: metadata?.headcountRange ?? null,
    },
  });
}

async function main() {
  await prisma.salary.deleteMany();
  await prisma.company.deleteMany();

  const companyByInput = new Map<string, Awaited<ReturnType<typeof upsertCompany>>>();

  for (const input of companyInputs) {
    companyByInput.set(input, await upsertCompany(input));
  }

  const salaryData = Array.from({ length: 72 }, (_, index) => {
    const companyInput = companyInputs[index % companyInputs.length];
    const level = levels[index % levels.length];
    const currency: Currency = index % 6 === 5 ? "USD" : "INR";
    const baseUnit = currency === "USD" ? 95000 : 1_850_000;
    const multiplier = levelMultiplier[level];
    const base_salary = Math.round(baseUnit * multiplier + (index % 9) * (currency === "USD" ? 3500 : 85_000));
    const bonus = index === 4 ? 0 : Math.round(base_salary * (0.08 + (index % 4) * 0.025));
    const stock = index === 9 ? 0 : Math.round(base_salary * (level === "PRINCIPAL" ? 1.8 : 0.16 + (index % 5) * 0.08));
    const boostedStock = index === 17 ? stock * 5 : stock;

    return {
      company_id: companyByInput.get(companyInput)!.id,
      role: roles[index % roles.length],
      level,
      location: locations[index % locations.length],
      currency,
      experience_years: Math.min(50, Math.max(1, Math.round(multiplier * 3 + (index % 8)))),
      base_salary: BigInt(base_salary),
      bonus: BigInt(bonus),
      stock: BigInt(boostedStock),
      total_compensation: BigInt(calculateTotalCompensation(base_salary, bonus, boostedStock)),
      source: (index % 10 === 0 ? "SCRAPED" : index % 13 === 0 ? "AI_INFERRED" : "CONTRIBUTOR") as Source,
      confidence_score: index % 13 === 0 ? 0.72 : 0.91,
      is_verified: index % 3 === 0,
      submitted_at: new Date(Date.now() - index * 60 * 60 * 1000),
    };
  });

  await prisma.salary.createMany({
    data: salaryData,
  });

  const google = await prisma.company.findUnique({
    where: { slug: "google" },
    include: { salaries: true },
  });

  console.log(`Seeded ${salaryData.length} salary records.`);
  console.log(`Google normalized to slug "${google?.slug}" with ${google?.salaries.length ?? 0} records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
