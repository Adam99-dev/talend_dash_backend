import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {validateSalaryPayload,formatZodError,} from "@/lib/validations";
import { calculateTotalCompensation } from "@/lib/calculations";
import { resolveCompany } from "@/lib/normalization";
import { findDuplicateSalaryRecord } from "@/lib/duplicate_check";
import { serializeForJson } from "@/lib/serialization";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = validateSalaryPayload(body);

    if (!validationResult.success) {
      return NextResponse.json(
        formatZodError(validationResult.error),
        {
          status: 400,
        }
      );
    }

    const data = validationResult.data;

    const resolvedCompany = resolveCompany(data.company);

    let company = await prisma.company.findUnique({
      where: {
        normalized_name: resolvedCompany.normalizedName,
      },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: resolvedCompany.company ?? data.company,
          slug: resolvedCompany.slug,
          normalized_name: resolvedCompany.normalizedName,
          industry: resolvedCompany.metadata?.industry ?? "Unknown",
          headquarters: resolvedCompany.metadata?.headquarters ?? "Unknown",
          founded_year: resolvedCompany.metadata?.foundedYear ?? null,
          headcount_range: resolvedCompany.metadata?.headcountRange ?? null,
        },
      });
    }

    const duplicate = await findDuplicateSalaryRecord({
      company_id: company.id,
      role: data.role,
      level: data.level,
      location: data.location,
      base_salary: data.base_salary,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error: true,
          message: "Duplicate salary record detected",
        },
        {
          status: 409,
        }
      );
    }

    const totalCompensation = calculateTotalCompensation(
      data.base_salary,
      data.bonus,
      data.stock
    );

    const salary = await prisma.salary.create({
      data: {
        company_id: company.id,

        role: data.role,

        level: data.level,

        location: data.location,

        currency: data.currency,

        experience_years: data.experience_years,

        base_salary: BigInt(data.base_salary),

        bonus: BigInt(data.bonus),

        stock: BigInt(data.stock),

        total_compensation: BigInt(totalCompensation),

        source: data.source,

        confidence_score: data.confidence_score,

        is_verified: false,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(
      serializeForJson(salary),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: true,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
