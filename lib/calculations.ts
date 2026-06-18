import { Level } from "@prisma/client";

export function calculateTotalCompensation(
  baseSalary: number,
  bonus: number = 0,
  stock: number = 0
): number {
  return baseSalary + bonus + stock;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values]
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

export function calculateMin(values: number[]): number {
  if (values.length === 0) return 0;

  return Math.min(...values);
}

export function calculateMax(values: number[]): number {
  if (values.length === 0) return 0;

  return Math.max(...values);
}

export function calculateLevelDistribution(
  levels: Level[]
): Record<Level, number> {
  const distribution = {} as Record<Level, number>;

  for (const level of levels) {
    distribution[level] =
      (distribution[level] ?? 0) + 1;
  }

  return distribution;
}