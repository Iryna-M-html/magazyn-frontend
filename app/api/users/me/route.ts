import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { proxyError } from "@/app/api/_utils/proxyError";

// GET /api/users/me — текущий пользователь (имя для шапки, роль)
export async function GET() {
  try {
    const cookie = await cookies();

    const response = await api.get("/users/me", {
      headers: { Cookie: cookie.toString() },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return proxyError(error);
  }
}
