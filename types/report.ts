// Строка отчёта «Analityka i inwentaryzacja», собранная из данных бэкенда.
// null — данных в базе нет (в таблице показывается «No data»).
export interface InventoryReportApiRow {
  id: string;
  name: string;
  barcode: string;
  category: string | null;
  /** YYYY-MM-DD */
  expirationDate: string | null;
  /** YYYY-MM-DD */
  intakeDate: string | null;
  discountedQuantity: number;
  writtenOffQuantity: number;
  /** countedQuantity последней ревизии */
  actualQuantity: number | null;
  /** ISO-дата последней ревизии */
  lastAuditAt: string | null;
  shelfPrice: number | null;
}

export interface InventoryReportResponse {
  status: "success" | "error";
  data: InventoryReportApiRow[];
  message?: string;
}
