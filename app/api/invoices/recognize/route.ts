import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { proxyError } from "@/app/api/_utils/proxyError";

// POST /api/invoices/recognize — фото фактуры (multipart, поле invoice) → строки товаров
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cookie = await cookies();

    const response = await api.post("/invoices/recognize", formData, {
      headers: { Cookie: cookie.toString() },
      // Распознавание на бэкенде может занять десятки секунд
      timeout: 120_000,
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return proxyError(error);
  }
}
