import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { proxyError } from "@/app/api/_utils/proxyError";

// GET /api/audit-logs — журнал действий с фильтрами (только администратор)
export async function GET(req: NextRequest) {
  try {
    const cookie = await cookies();

    const response = await api.get("/audit-logs", {
      params: Object.fromEntries(req.nextUrl.searchParams.entries()),
      headers: { Cookie: cookie.toString() },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return proxyError(error);
  }
}
