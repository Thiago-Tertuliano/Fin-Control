import { NextRequest, NextResponse } from "next/server";
import {
  deleteIncome,
  getIncomeById,
  updateIncome,
} from "@/lib/services/income";
import { incomeSchema } from "@/lib/validators/income";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getIncomeById(id);
    if (!item) {
      return NextResponse.json({ error: "Renda não encontrada" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/income/[id]", error);
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getIncomeById(id)) {
      return NextResponse.json({ error: "Renda não encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = incomeSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.active !== undefined) {
      updateData.active = parsed.data.active ? 1 : 0;
    }

    const item = updateIncome(id, updateData);
    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/income/[id]", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getIncomeById(id)) {
      return NextResponse.json({ error: "Renda não encontrada" }, { status: 404 });
    }
    deleteIncome(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/income/[id]", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
