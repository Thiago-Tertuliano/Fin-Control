import { NextRequest, NextResponse } from "next/server";
import { getFullDashboard } from "@/lib/services/dashboard";
import { getMonthRange } from "@/lib/utils/date";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month");

    let start = searchParams.get("start");
    let end = searchParams.get("end");

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split("-").map(Number);
      const range = getMonthRange(new Date(year, mon - 1, 1));
      start = range.start;
      end = range.end;
    }

    if (!start || !end) {
      const range = getMonthRange();
      start = range.start;
      end = range.end;
    }

    const dashboard = getFullDashboard(start, end);
    return NextResponse.json({ start, end, ...dashboard });
  } catch (error) {
    console.error("GET /api/dashboard", error);
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
