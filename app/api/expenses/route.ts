import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createExpense, listExpenses } from "@/lib/services/expense";
import { expenseSchema } from "@/lib/validators/expense";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const expenses = listExpenses({
      start: searchParams.get("start") ?? undefined,
      end: searchParams.get("end") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      bankId: searchParams.get("bankId") ?? undefined,
      paymentMethod: searchParams.get("paymentMethod") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses", error);
    return NextResponse.json({ error: "Erro ao listar gastos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const expense = createExpense({
      id,
      ...parsed.data,
      notes: parsed.data.notes ?? null,
      installments: parsed.data.installments ?? null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses", error);
    return NextResponse.json({ error: "Erro ao criar gasto" }, { status: 500 });
  }
}
