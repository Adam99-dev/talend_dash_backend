import "server-only";
import type { CompanyApiData, SalaryView } from "./salary-view";

const API_BASE = (
  process.env.TALENTDASH_API_URL ?? "https://talend-dash-backend.vercel.app/api"
).replace(/\/$/, "");

async function apiJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: "force-cache" });
  if (!response.ok)
    throw new Error(`TalentDash API ${path} returned ${response.status}`);
  return response.json() as Promise<T>;
}

type ApiSalary = {
  id: string;
  company: { id: string; name: string; slug: string };
  role: string;
  level: string;
  location: string;
  currency: string;
  experience_years: number;
  base_salary: string | number;
  bonus: string | number;
  stock: string | number;
  total_compensation: string | number;
};

function mapSalary(row: ApiSalary): SalaryView {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    level: row.level,
    location: row.location,
    currency: row.currency,
    experienceYears: row.experience_years,
    baseSalary: Number(row.base_salary),
    bonus: Number(row.bonus),
    stock: Number(row.stock),
    totalComp: Number(row.total_compensation),
  };
}

export async function getAllSalaries(): Promise<SalaryView[]> {
  const first = await apiJson<{
    data: ApiSalary[];
    meta: { totalPages: number };
  }>("/salaries?limit=100&sort=total_comp_desc&page=1");
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, index) =>
      apiJson<{ data: ApiSalary[] }>(
        `/salaries?limit=100&sort=total_comp_desc&page=${index + 2}`,
      ),
    ),
  );
  return [...first.data, ...rest.flatMap((page) => page.data)].map(mapSalary);
}

export async function getCompanyData(
  slug: string,
): Promise<{
  company: CompanyApiData["company"];
  salaries: SalaryView[];
} | null> {
  try {
    const data = await apiJson<CompanyApiData>(
      `/companies/${encodeURIComponent(slug)}`,
    );
    return {
      company: data.company,
      salaries: data.salaries.map((row) =>
        mapSalary({
          ...row,
          company: row.company ?? {
            id: data.company.slug,
            name: data.company.name,
            slug: data.company.slug,
          },
        }),
      ),
    };
  } catch {
    return null;
  }
}
