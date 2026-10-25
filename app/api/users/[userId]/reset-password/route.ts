import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { proxyError } from "@/app/api/_utils/proxyError";

// POST /api/users/[userId]/reset-password — новый код для пользователя (только администратор)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const cookie = await cookies();

    const response = await api.post(`/users/${userId}/reset-password`, null, {
      headers: { Cookie: cookie.toString() },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return proxyError(error);
  }
}
