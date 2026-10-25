import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { logErrorResponse } from "@/app/api/_utils/utils";

// POST /api/products/manual — ручное создание товара (multipart/form-data, фото в поле imageUrl)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cookie = await cookies();

    const response = await api.post("/manual", formData, {
      headers: {
        Cookie: cookie.toString(),
      },
    });

    return NextResponse.json(response.data, { status: response.status });
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
