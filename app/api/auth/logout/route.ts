import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { logErrorResponse } from "@/app/api/_utils/utils";
import { clearSessionCookies } from "@/app/api/_utils/session";

// POST /api/auth/logout — сессия удаляется на бэкенде, cookie — в любом случае
export async function POST() {
  const cookie = await cookies();

  try {
    await api.post("/auth/logout", null, {
      headers: { Cookie: cookie.toString() },
    });
  } catch (error) {
    logErrorResponse({ message: (error as Error).message });
  }

  await clearSessionCookies();

  return new NextResponse(null, { status: 204 });
}
