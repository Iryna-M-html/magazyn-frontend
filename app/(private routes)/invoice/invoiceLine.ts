import type { ProductCandidate, RecognizedInvoiceItem } from "@/types/invoice";

export type SearchStatus = "idle" | "queued" | "loading" | "done" | "error";

/** Подтверждённый товар: всегда уже есть в базе (productId) */
export type SelectedProduct = ProductCandidate & {
  productId: string;
  category: string;
};

/** Состояние одной строки фактуры на странице приёмки */
export interface InvoiceLine {
  id: string;
  /** Строка текста фактуры; пусто — позиция добавлена вручную */
  sourceLine: string;
  ean: string | null;
  vatRate: number | null;
  /** Цена не прошла проверку «цена × количество = стоимость» */
  priceUnverified: boolean;

  query: string;
  quantity: string;
  priceNetto: string;
  expirationDate: string;
  category: string;

  dbCandidates: ProductCandidate[] | null;
  dbStatus: SearchStatus;
  offCandidates: ProductCandidate[] | null;
  offStatus: SearchStatus;

  selected: SelectedProduct | null;
  confirming: boolean;
  status: "pending" | "saving" | "done" | "skipped";
  error: string;
  /** Номер партии после приёмки */
  batch: string;
}

let nextId = 0;

const newId = () => `${Date.now().toString(36)}-${(nextId++).toString(36)}`;

export function createLine(
  item: RecognizedInvoiceItem | null,
  defaultCategory: string,
): InvoiceLine {
  return {
    id: newId(),
    sourceLine: item?.line ?? "",
    ean: item?.ean ?? null,
    vatRate: item?.vatRate ?? null,
    priceUnverified: item ? !item.priceVerified : false,

    query: item?.name ?? "",
    quantity: item ? String(item.quantity) : "1",
    priceNetto: item ? item.unitNetPrice.toFixed(2) : "",
    expirationDate: "",
    category: defaultCategory,

    dbCandidates: null,
    dbStatus: "idle",
    offCandidates: null,
    offStatus: "idle",

    selected: null,
    confirming: false,
    status: "pending",
    error: "",
    batch: "",
  };
}
