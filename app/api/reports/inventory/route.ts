import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { api } from "@/app/api/api";
import { logErrorResponse } from "@/app/api/_utils/utils";
import type { InventoryReportApiRow } from "@/types/report";

// Сколько партий догружаем с бэкенда одновременно
const CONCURRENCY = 8;

interface BackendProduct {
  name?: string;
  barcode?: string;
  category?: string | null;
  shelfPrice?: number | null;
}

interface BackendIntake {
  _id: string;
  productId?: BackendProduct | null;
  expirationDate?: string | null;
  scannedAt?: string | null;
  createdAt?: string | null;
  discountedQuantity?: number;
  writtenOffQuantity?: number;
}

interface BackendAudit {
  countedQuantity?: number;
  countedAt?: string;
  createdAt?: string;
}

const toDateOnly = (value?: string | null) =>
  value ? value.slice(0, 10) : null;

async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
}

// GET /api/reports/inventory — строки отчёта: партии + категория/цена товара + последняя ревизия
export async function GET() {
  try {
    const cookie = await cookies();
    const headers = { Cookie: cookie.toString() };

    const listResponse = await api.get("/inventory/intake", { headers });
    const intakes: BackendIntake[] = listResponse.data?.data ?? [];

    const rows = await mapWithLimit(
      intakes,
      CONCURRENCY,
      async (intake): Promise<InventoryReportApiRow> => {
        // Детали партии (категория и цена есть только здесь) и ревизии.
        // Ошибка по одной партии не ломает весь отчёт — поля останутся пустыми.
        const [detailsResult, auditsResult] = await Promise.allSettled([
          api.get(`/inventory/intake/${intake._id}`, { headers }),
          api.get(`/inventory/intake/${intake._id}/audits`, { headers }),
        ]);

        const product: BackendProduct =
          (detailsResult.status === "fulfilled"
            ? detailsResult.value.data?.data?.productId
            : null) ??
          intake.productId ??
          {};

        const audits: BackendAudit[] =
          auditsResult.status === "fulfilled"
            ? (auditsResult.value.data?.data ?? [])
            : [];

        const lastAudit = audits.reduce<BackendAudit | null>(
          (latest, audit) => {
            const date = audit.countedAt ?? audit.createdAt ?? "";
            const latestDate = latest?.countedAt ?? latest?.createdAt ?? "";

            return !latest || date > latestDate ? audit : latest;
          },
          null,
        );

        return {
          id: intake._id,
          name: product.name ?? "",
          barcode: product.barcode ?? "",
          category: product.category || null,
          expirationDate: toDateOnly(intake.expirationDate),
          intakeDate: toDateOnly(intake.scannedAt ?? intake.createdAt),
          discountedQuantity: intake.discountedQuantity ?? 0,
          writtenOffQuantity: intake.writtenOffQuantity ?? 0,
          actualQuantity: lastAudit?.countedQuantity ?? null,
          lastAuditAt: lastAudit?.countedAt ?? lastAudit?.createdAt ?? null,
          shelfPrice:
            typeof product.shelfPrice === "number" ? product.shelfPrice : null,
        };
      },
    );

    return NextResponse.json({ status: "success", data: rows }, { status: 200 });
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
