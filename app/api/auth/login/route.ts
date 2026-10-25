import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/api";
import { proxyError } from "@/app/api/_utils/proxyError";
import { applySessionCookies } from "@/app/api/_utils/session";

// POST /api/auth/login — вход по имени, фамилии и коду; cookie сессии ставит Next.js
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await api.post("/auth/login", body);

    await applySessionCookies(response.headers["set-cookie"]);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return proxyError(error);
  }
}
