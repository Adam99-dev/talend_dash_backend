import { z } from "zod";
import { Currency, Level, Source } from "@prisma/client";

export const LEVEL_VALUES = Object.values(Level) as [Level, ...Level[]];
export const CURRENCY_VALUES = Object.values(Currency) as [
  Currency,
  ...Currency[],
];
export const SOURCE_VALUES = Object.values(Source) as [Source, ...Source[]];

function pickField(
  record: Record<string, unknown>,
  snake: string,
  camel: string,
) {
  return record[snake] ?? record[camel];
}

const NormalizedSalaryPayload = z.preprocess(
  (payload) => {
    if (!payload || typeof payload !== "object") return payload;

    const record = payload as Record<string, unknown>;

    return {
      company: record.company,
      role: record.role,
      level: record.level,
      location: record.location,
      currency: record.currency,
      experience_years: pickField(
        record,
        "experience_years",
        "experienceYears",
      ),
      base_salary: pickField(record, "base_salary", "baseSalary"),
      bonus: record.bonus ?? 0,
      stock: record.stock ?? 0,
      source: record.source,
      confidence_score: pickField(
        record,
        "confidence_score",
        "confidenceScore",
      ),
    };
  },
  z.object({
    company: z
      .string({
        error: "Company is required",
      })
      .trim()
      .min(2, "Company name must be at least 2 characters"),
    role: z
      .string({
        error: "Role is required",
      })
      .trim()
      .min(2, "Role must be at least 2 characters"),
    level: z.enum(LEVEL_VALUES, {
      error: "Invalid level",
    }),
    location: z
      .string({
        error: "Location is required",
      })
      .trim()
      .min(2, "Location is required"),
    currency: z.enum(CURRENCY_VALUES, {
      error: "Invalid currency",
    }),
    experience_years: z
      .number({
        error: "experience_years must be a number",
      })
      .int("experience_years must be a whole number")
      .gt(0, "experience_years must be greater than 0")
      .lt(51, "experience_years must be less than 51"),
    base_salary: z
      .number({
        error: "base_salary must be a number",
      })
      .gt(0, "base_salary must be greater than 0"),
    bonus: z
      .number({
        error: "bonus must be a number",
      })
      .min(0, "bonus cannot be negative")
      .default(0),
    stock: z
      .number({
        error: "stock must be a number",
      })
      .min(0, "stock cannot be negative")
      .default(0),
    source: z.enum(SOURCE_VALUES, {
      error: `Source must be one of: ${SOURCE_VALUES.join(", ")}`,
    }),
    confidence_score: z
      .number({
        error: "confidence_score must be a number",
      })
      .min(0, "confidence_score must be between 0.0 and 1.0")
      .max(1, "confidence_score must be between 0.0 and 1.0"),
  }),
);

export const SalaryIngestionSchema = NormalizedSalaryPayload;

export type SalaryIngestionInput = z.infer<typeof SalaryIngestionSchema>;

export function validateSalaryPayload(payload: unknown) {
  return SalaryIngestionSchema.safeParse(payload);
}

export function formatZodError(error: z.ZodError) {
  const issue = error.issues[0];
  const field = String(issue?.path[0] ?? "body");

  return {
    error: true,
    field,
    message: issue?.message ?? "Validation failed",
  };
}
