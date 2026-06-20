import { NextResponse } from "next/server";
import { listBanks } from "@/lib/services/expense";

export async function GET() {
  try {
    return NextResponse.json(listBanks());
  } catch (error) {
    console.error("GET /api/banks", error);
    return NextResponse.json({ error: "Erro ao listar bancos" }, { status: 500 });
  }
}
