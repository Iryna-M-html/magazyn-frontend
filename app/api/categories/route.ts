import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { logErrorResponse } from "@/app/api/_utils/utils";

// GET /api/categories — справочник категорий товаров
export async function GET() {
  try {
    const cookie = await cookies();

    const response = await api.get("/categories", {
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
