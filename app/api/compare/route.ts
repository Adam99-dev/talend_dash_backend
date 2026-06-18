import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeForJson } from "@/lib/serialization";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const s1 = searchParams.get("s1");
    const s2 = searchParams.get("s2");

    if (!s1 || !s2) {
      return NextResponse.json(
        {
          error: true,
          message: "s1 and s2 query parameters are required",
        },
        { status: 400 },
      );
    }

    if (s1 === s2) {
      return NextResponse.json(
        {
          error: true,
          message: "Salary IDs must be different",
        },
        { status: 400 },
      );
    }

    const [record1, record2] = await Promise.all([
      prisma.salary.findUnique({
        where: { id: s1 },
        include: { company: true },
      }),
      prisma.salary.findUnique({
        where: { id: s2 },
        include: { company: true },
      }),
    ]);

    if (!record1 || !record2) {
      return NextResponse.json(
        {
          error: true,
          message: "One or both salary records not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      serializeForJson({
        record_1: record1,
        record_2: record2,
        delta: {
          base_delta: Number(record1.base_salary - record2.base_salary),
          bonus_delta: Number(record1.bonus - record2.bonus),
          stock_delta: Number(record1.stock - record2.stock),
          tc_delta: Number(record1.total_compensation - record2.total_compensation),
          experience_delta: record1.experience_years - record2.experience_years,
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
    console.error("[COMPARE_SALARIES]", error);

    return NextResponse.json(
      {
        error: true,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
