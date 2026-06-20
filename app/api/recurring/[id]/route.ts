import { NextRequest, NextResponse } from "next/server";
import {
  deleteRecurring,
  getRecurringById,
  updateRecurring,
} from "@/lib/services/recurring";
import { recurringExpenseSchema } from "@/lib/validators/recurring";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getRecurringById(id);
    if (!item) {
      return NextResponse.json({ error: "Mensalidade não encontrada" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/recurring/[id]", error);
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getRecurringById(id)) {
      return NextResponse.json({ error: "Mensalidade não encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = recurringExpenseSchema.partial().safeParse(body);
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

    const item = updateRecurring(id, updateData);
    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/recurring/[id]", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getRecurringById(id)) {
      return NextResponse.json({ error: "Mensalidade não encontrada" }, { status: 404 });
    }
    deleteRecurring(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/recurring/[id]", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
