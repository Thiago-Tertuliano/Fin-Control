import { NextRequest, NextResponse } from "next/server";
import {
  deleteExpense,
  getExpenseById,
  updateExpense,
} from "@/lib/services/expense";
import { expenseUpdateSchema } from "@/lib/validators/expense";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expense = getExpenseById(id);
    if (!expense) {
      return NextResponse.json({ error: "Gasto não encontrado" }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    console.error("GET /api/expenses/[id]", error);
    return NextResponse.json({ error: "Erro ao buscar gasto" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getExpenseById(id);
    if (!existing) {
      return NextResponse.json({ error: "Gasto não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = expenseUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const expense = updateExpense(id, parsed.data);
    return NextResponse.json(expense);
  } catch (error) {
    console.error("PUT /api/expenses/[id]", error);
    return NextResponse.json({ error: "Erro ao atualizar gasto" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getExpenseById(id);
    if (!existing) {
      return NextResponse.json({ error: "Gasto não encontrado" }, { status: 404 });
    }

    deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id]", error);
    return NextResponse.json({ error: "Erro ao excluir gasto" }, { status: 500 });
  }
}
