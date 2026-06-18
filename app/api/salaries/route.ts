// src/app/api/salaries/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Currency, Level, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { serializeForJson } from "@/lib/serialization";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const SORT_OPTIONS = {
  total_comp_desc: {
    total_compensation: "desc",
  },
  total_comp_asc: {
    total_compensation: "asc",
  },
  date_desc: {
    submitted_at: "desc",
  },
} as const;

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;

  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const company = searchParams.get("company");

    const role = searchParams.get("role");

    const level = searchParams.get("level");

    const location = searchParams.get("location");

    const currency = searchParams.get("currency");

    const sort = searchParams.get("sort") ?? "total_comp_desc";

    let page = parsePositiveInt(searchParams.get("page"), 1);

    const limit = Math.min(
      MAX_LIMIT,
      parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT),
    );

    if (level && !Object.values(Level).includes(level as Level)) {
      return NextResponse.json(
        {
          error: true,
          message: "Invalid level",
        },
        {
          status: 400,
        },
      );
    }

    if (currency && !Object.values(Currency).includes(currency as Currency)) {
      return NextResponse.json(
        {
          error: true,
          message: "Invalid currency",
        },
        {
          status: 400,
        },
      );
    }

    const skip = (page - 1) * limit;

    const where: Prisma.SalaryWhereInput = {};

    if (company) {
      where.company = {
        OR: [
          {
            name: {
              contains: company,
              mode: "insensitive",
            },
          },
          { normalized_name: { contains: company, mode: "insensitive" } },
          { slug: { contains: company, mode: "insensitive" } },
        ],
      };
    }

    if (role) {
      where.role = {
        contains: role,
        mode: "insensitive",
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    if (level) {
      where.level = level as Level;
    }

    if (currency) {
      where.currency = currency as Currency;
    }

    const orderBy =
      SORT_OPTIONS[sort as keyof typeof SORT_OPTIONS] ??
      SORT_OPTIONS.total_comp_desc;

    const total = await prisma.salary.count({
      where,
    });

    const totalPages = Math.ceil(total / limit);
    if (page > totalPages) {
      return NextResponse.json(
        {
          error: true,
          message: "Invalid page",
        },
        {
          status: 400,
        },
      );
    }

    const salaries = await prisma.salary.findMany({
      where,

      select: {
        id: true,

        role: true,
        level: true,
        location: true,
        currency: true,

        experience_years: true,

        base_salary: true,
        bonus: true,
        stock: true,

        total_compensation: true,

        source: true,
        confidence_score: true,

        is_verified: true,

        submitted_at: true,

        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },

      orderBy,

      skip,

      take: limit,
    });

    return NextResponse.json(
      serializeForJson({
        data: salaries,

        meta: {
          total,
          page,
          limit,

          totalPages: Math.ceil(total / limit),
        },
      }),
      {
        status: 200,

        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("[GET_SALARIES]", error);

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
