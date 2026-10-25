import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { logErrorResponse } from "@/app/api/_utils/utils";

// Ответ с ошибкой бэкенда (статус и тело как есть) — общий для маршрутов /api/auth и /api/users
export function proxyError(error: unknown) {
  if (isAxiosError(error)) {
    logErrorResponse(error.response?.data);
    return NextResponse.json(
      error.response?.data || { error: "Backend error" },
      { status: error.response?.status || 500 },
    );
  }

  logErrorResponse({ message: (error as Error).message });
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
