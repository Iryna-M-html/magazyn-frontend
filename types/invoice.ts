// Строка фактуры после распознавания (Tesseract) и разбора на бэкенде
export interface RecognizedInvoiceItem {
  /** Строка текста, из которой извлечена позиция */
  line: string;
  name: string;
  ean: string | null;
  weight: { quantity: number; unit: string } | null;
  quantity: number;
  unitNetPrice: number;
  vatRate: number | null;
  /** true — цена проверена: цена × количество = стоимость нетто */
  priceVerified: boolean;
}

export interface RecognizedInvoice {
  invoiceNumber: string;
  items: RecognizedInvoiceItem[];
  /** Весь распознанный текст — для проверки */
  text: string;
  /** Уверенность OCR, 0–100 */
  confidence: number;
}

export interface ProductCandidate {
  /** db — товар уже есть в базе, off — найден в Open Food Facts */
  source: "db" | "off";
  productId: string | null;
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  productQuantity?: number | null;
  productQuantityUnit?: string;
  category?: string;
  /** Сходство со строкой фактуры, 0–100 */
  score: number;
}
