import { NextRequest, NextResponse } from "next/server";
import {
  deleteInvestment,
  getInvestmentById,
  updateInvestment,
} from "@/lib/services/investment";
import { stringifyInvestmentMetadata } from "@/lib/investments/config";
import { investmentUpdateSchema } from "@/lib/validators/investment";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getInvestmentById(id);
    if (!item) {
      return NextResponse.json({ error: "Investimento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/investments/[id]", error);
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getInvestmentById(id)) {
      return NextResponse.json({ error: "Investimento não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = investmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { metadata, ...rest } = parsed.data;
    const item = updateInvestment(id, {
      ...rest,
      ...(metadata !== undefined
        ? { metadata: stringifyInvestmentMetadata(metadata ?? {}) }
        : {}),
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/investments/[id]", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getInvestmentById(id)) {
      return NextResponse.json({ error: "Investimento não encontrado" }, { status: 404 });
    }
    deleteInvestment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/investments/[id]", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
