import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createIncome, listIncomeSources } from "@/lib/services/income";
import { incomeSchema } from "@/lib/validators/income";

export async function GET(request: NextRequest) {
  try {
    const activeOnly = request.nextUrl.searchParams.get("active") === "true";
    return NextResponse.json(listIncomeSources(activeOnly));
  } catch (error) {
    console.error("GET /api/income", error);
    return NextResponse.json({ error: "Erro ao listar rendas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = incomeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = createIncome({
      id: uuidv4(),
      ...parsed.data,
      active: parsed.data.active !== false ? 1 : 0,
      notes: parsed.data.notes ?? null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/income", error);
    return NextResponse.json({ error: "Erro ao criar renda" }, { status: 500 });
  }
}
