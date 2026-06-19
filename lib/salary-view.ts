export type DisplayCurrency = "INR" | "USD";
export type SalaryView = {
  id: string;
  company: { id: string; name: string; slug: string };
  role: string;
  level: string;
  location: string;
  currency: string;
  experienceYears: number;
  baseSalary: number;
  bonus: number;
  stock: number;
  totalComp: number;
};

export type CompanyApiData = {
  company: { name: string; slug: string; industry: string; headquarters: string; founded_year: number | null; headcount_range: string | null };
  median_total_compensation: number;
  level_distribution: Record<string, number>;
  salaries: Array<{
    id: string; company?: { id: string; name: string; slug: string }; role: string; level: string; location: string; currency: string;
    experience_years: number; base_salary: string | number; bonus: string | number; stock: string | number; total_compensation: string | number;
  }>;
};
