import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { logErrorResponse } from "@/app/api/_utils/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookie = await cookies();

    // Отправляем POST запрос на ваш Node.js / Express бэкенд
    const res = await api.post("/inventory/intake", body, {
      headers: {
        Cookie: cookie.toString(),
      },
    });

    return NextResponse.json(res.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        error.response?.data || { error: "Backend error" },
        { status: error.response?.status || 500 },
      );
    }

    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cookie = await cookies();

    // Передаем query-параметры и заголовок Cookie для авторизации
    const response = await api.get("/inventory/intake", {
      params: Object.fromEntries(searchParams.entries()),
      headers: {
        Cookie: cookie.toString(),
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        error.response?.data || { error: "Backend error" },
        { status: error.response?.status || 500 },
      );
    }

    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
