import { prisma } from "./prisma";
import { Level } from "@prisma/client";

interface DuplicateCheckParams {
  company_id: string;
  role: string;
  level: string;
  location: string;
  base_salary: number;
}

export async function findDuplicateSalaryRecord({
  company_id,
  role,
  level,
  location,
  base_salary,
}: DuplicateCheckParams) {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const records = await prisma.salary.findMany({
    where: {
      company_id,
      role,
      level: level as Level,
      location,
      submitted_at: {
        gte: fortyEightHoursAgo,
      },
    },
    select: {
      id: true,
      base_salary: true,
      submitted_at: true,
    },
  });

  const duplicate = records.find((record) => {
    const existingSalary = Number(record.base_salary);

    const differencePercentage =
      Math.abs(existingSalary - base_salary) / base_salary;

    return differencePercentage <= 0.1;
  });

  return duplicate ?? null;
}
