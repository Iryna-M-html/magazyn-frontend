import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { proxyError } from "@/app/api/_utils/proxyError";

// POST /api/auth/change-password — пользователь задаёт свой код
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookie = await cookies();

    const response = await api.post("/auth/change-password", body, {
      headers: { Cookie: cookie.toString() },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return proxyError(error);
  }
}
