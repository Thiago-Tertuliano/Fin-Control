import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createInvestment,
  listInvestments,
} from "@/lib/services/investment";
import { stringifyInvestmentMetadata } from "@/lib/investments/config";
import { investmentSchema } from "@/lib/validators/investment";

export async function GET() {
  try {
    return NextResponse.json(listInvestments());
  } catch (error) {
    console.error("GET /api/investments", error);
    return NextResponse.json({ error: "Erro ao listar investimentos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = investmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const item = createInvestment({
      id: uuidv4(),
      ...parsed.data,
      ticker: parsed.data.ticker ?? null,
      currentValueCents: parsed.data.currentValueCents ?? null,
      quantity: parsed.data.quantity ?? null,
      notes: parsed.data.notes ?? null,
      metadata: stringifyInvestmentMetadata(parsed.data.metadata ?? {}),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/investments", error);
    return NextResponse.json({ error: "Erro ao criar investimento" }, { status: 500 });
  }
}
