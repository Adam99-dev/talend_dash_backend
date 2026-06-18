import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  calculateMedian,
  calculateLevelDistribution,
} from "@/lib/calculations";
import { serializeForJson } from "@/lib/serialization";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const company = await prisma.company.findUnique({
      where: {
        slug,
      },

      include: {
        salaries: {
          orderBy: {
            total_compensation: "desc",
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          error: true,
          message: "Company not found",
        },
        {
          status: 404,
        },
      );
    }

    const compensations = company.salaries.map((salary) =>
      Number(salary.total_compensation),
    );

    const levels = company.salaries.map((salary) => salary.level);

    return NextResponse.json(
      serializeForJson({
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          normalized_name: company.normalized_name,

          industry: company.industry,

          headquarters: company.headquarters,

          founded_year: company.founded_year,

          headcount_range: company.headcount_range,

          created_at: company.created_at,
          updated_at: company.updated_at,
        },

        median_total_compensation: calculateMedian(compensations),

        level_distribution: calculateLevelDistribution(levels),

        salaries: company.salaries,
      }),
      {
        status: 200,

        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("[GET_COMPANY]", error);

    return NextResponse.json(
      {
        error: true,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
