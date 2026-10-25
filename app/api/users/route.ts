import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { proxyError } from "@/app/api/_utils/proxyError";

// GET /api/users — список пользователей (только администратор)
export async function GET() {
  try {
    const cookie = await cookies();

    const response = await api.get("/users", {
      headers: { Cookie: cookie.toString() },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return proxyError(error);
  }
}

// POST /api/users — новый пользователь; в ответе один раз приходит сгенерированный код
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookie = await cookies();

    const response = await api.post("/users", body, {
      headers: { Cookie: cookie.toString() },
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    return proxyError(error);
  }
}
