import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { logErrorResponse } from "@/app/api/_utils/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ barcode: string }> },
) {
  const cookie = await cookies();
  const { barcode } = await params;

  try {
    // Делаем запрос к вашему внешнему бэкенду
    const res = await api.get(`/products/barcode/${barcode}`, {
      headers: {
        Cookie: cookie.toString(),
      },
    });

    return NextResponse.json(res.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.response?.data },
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
