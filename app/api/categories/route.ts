import { NextResponse } from "next/server";
import { listCategories } from "@/lib/services/expense";

export async function GET() {
  try {
    return NextResponse.json(listCategories());
  } catch (error) {
    console.error("GET /api/categories", error);
    return NextResponse.json({ error: "Erro ao listar categorias" }, { status: 500 });
  }
}
