import type { DisplayCurrency, SalaryView } from "./salary-view";
export const INR_PER_USD = 83.3333333333;
export const levelOrder = [
  "L3",
  "SDE_I",
  "L4",
  "SDE_II",
  "IC4",
  "L5",
  "SDE_III",
  "IC5",
  "L6",
  "STAFF",
  "PRINCIPAL",
];
export function levelLabel(value: string) {
  return value
    .replace("SDE_I", "SDE-I")
    .replace("SDE_II", "SDE-II")
    .replace("SDE_III", "SDE-III")
    .replace("STAFF", "Staff")
    .replace("PRINCIPAL", "Principal");
}
export function levelClass(value: string) {
  if (["L3", "SDE_I"].includes(value)) return "slate";
  if (["L4", "SDE_II", "IC4"].includes(value)) return "blue";
  if (["L5", "SDE_III", "IC5"].includes(value)) return "indigo";
  if (["L6", "STAFF"].includes(value)) return "purple";
  return "navy";
}
export function toInr(value: number, currency: string) {
  return currency === "USD" ? value * INR_PER_USD : value;
}
export function money(value: number, source: string, target: DisplayCurrency) {
  const inr = toInr(value, source);
  const amount = target === "USD" ? inr / INR_PER_USD : inr;
  return new Intl.NumberFormat(target === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: target,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
export function median(values: number[]) {
  const s = [...values].sort((a, b) => a - b),
    m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export type SortKey =
  | "company"
  | "role"
  | "level"
  | "location"
  | "experience"
  | "base"
  | "stock"
  | "total";
export function sortSalaries(
  rows: SalaryView[],
  key: SortKey,
  dir: "asc" | "desc",
) {
  const f = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const pair: { [K in SortKey]: [string | number, string | number] } = {
      company: [a.company.name, b.company.name],
      role: [a.role, b.role],
      level: [a.level, b.level],
      location: [a.location, b.location],
      experience: [a.experienceYears, b.experienceYears],
      base: [toInr(a.baseSalary, a.currency), toInr(b.baseSalary, b.currency)],
      stock: [toInr(a.stock, a.currency), toInr(b.stock, b.currency)],
      total: [toInr(a.totalComp, a.currency), toInr(b.totalComp, b.currency)],
    };
    const v = pair[key];
    return (
      (typeof v[0] === "string"
        ? String(v[0]).localeCompare(String(v[1]))
        : Number(v[0]) - Number(v[1])) * f
    );
  });
}
