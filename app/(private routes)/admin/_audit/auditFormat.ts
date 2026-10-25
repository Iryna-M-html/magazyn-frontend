import { DEFAULT_CATEGORY } from "@/lib/constants/products";
import { formatDate } from "@/lib/utils/date";
import type { AuditLogEntry } from "@/types/audit";

type Translate = (key: string, values?: Record<string, string | number>) => string;

const PRICE_FIELDS = new Set(["priceNetto", "priceBrutto", "shelfPrice"]);
const DATE_FIELDS = new Set(["expirationDate"]);

// Порядок и состав полей в «подробностях» записи
export const DETAIL_FIELDS = [
  "quantity",
  "batch",
  "expirationDate",
  "priceNetto",
  "priceBrutto",
  "expectedQuantity",
  "countedQuantity",
  "difference",
  "note",
  "role",
  "category",
  "productQuantity",
  "items",
  "confidence",
] as const;

/** Значение поля журнала для показа: цены в zł, даты dd.mm.yyyy, роли и «Другое» — переводом */
export function formatAuditValue(
  field: string,
  value: unknown,
  t: Translate,
  tRoles: Translate,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (PRICE_FIELDS.has(field) && typeof value === "number") {
    return `${value.toFixed(2)} zł`;
  }

  if (DATE_FIELDS.has(field)) {
    return formatDate(String(value));
  }

  if (field === "role") {
    return tRoles(String(value));
  }

  if (field === "category" && value === DEFAULT_CATEGORY) {
    return t("otherCategory");
  }

  if (field === "confidence") {
    return `${value}%`;
  }

  return String(value);
}

/** «Ilość: 12 · Partia: IM-25.10.2026 · …» */
export function formatAuditDetails(
  entry: AuditLogEntry,
  t: Translate,
  tRoles: Translate,
): string {
  const details = entry.details ?? {};

  const parts = DETAIL_FIELDS.filter((field) => details[field] !== undefined && details[field] !== null).map(
    (field) => `${t(`fields.${field}`)}: ${formatAuditValue(field, details[field], t, tRoles)}`,
  );

  // Единица веса — вместе с весом
  if (details.productQuantity && details.productQuantityUnit) {
    const index = parts.findIndex((part) => part.startsWith(t("fields.productQuantity")));
    parts[index] = `${parts[index]} ${details.productQuantityUnit}`;
  }

  return parts.join(" · ");
}

/** Короткое описание устройства из User-Agent: «Chrome · Android» */
export function describeDevice(userAgent: string): string {
  if (!userAgent) {
    return "";
  }

  const os = /Android/i.test(userAgent)
    ? "Android"
    : /iPhone|iPad|iPod/i.test(userAgent)
      ? "iOS"
      : /Windows/i.test(userAgent)
        ? "Windows"
        : /Mac OS/i.test(userAgent)
          ? "macOS"
          : /Linux/i.test(userAgent)
            ? "Linux"
            : "";

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "";

  return [browser, os].filter(Boolean).join(" · ") || userAgent.slice(0, 40);
}
