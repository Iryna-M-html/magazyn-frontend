import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { logErrorResponse } from "@/app/api/_utils/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> },
) {
  try {
    const { intakeId } = await params;
    const cookie = await cookies();

    const response = await api.get(`/inventory/intake/${intakeId}/audits`, {
      headers: { Cookie: cookie.toString() },
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> },
) {
  try {
    const { intakeId } = await params;
    const body = await req.json();
    const cookie = await cookies();

    const response = await api.post(
      `/inventory/intake/${intakeId}/audits`,
      body,
      {
        headers: { Cookie: cookie.toString() },
      },
    );

    return NextResponse.json(response.data, { status: 201 });
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
