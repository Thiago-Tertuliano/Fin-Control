import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createRecurring,
  listRecurringExpenses,
} from "@/lib/services/recurring";
import { recurringExpenseSchema } from "@/lib/validators/recurring";

export async function GET(request: NextRequest) {
  try {
    const activeOnly = request.nextUrl.searchParams.get("active") === "true";
    return NextResponse.json(listRecurringExpenses(activeOnly));
  } catch (error) {
    console.error("GET /api/recurring", error);
    return NextResponse.json({ error: "Erro ao listar mensalidades" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = recurringExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = createRecurring({
      id: uuidv4(),
      ...parsed.data,
      active: parsed.data.active !== false ? 1 : 0,
      notes: parsed.data.notes ?? null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/recurring", error);
    return NextResponse.json({ error: "Erro ao criar mensalidade" }, { status: 500 });
  }
}
