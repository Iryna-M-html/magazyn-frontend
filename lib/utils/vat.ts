// Ставка VAT из названия категории: «33 (Vat 8%)» → 8; «Другое» → null (как на бэкенде, src/utils/vat.js)
export function parseVatRate(categoryTitle?: string | null): number | null {
  if (!categoryTitle) {
    return null;
  }

  const match = /vat\s*(\d+(?:[.,]\d+)?)\s*%/i.exec(categoryTitle);

  return match ? Number(match[1].replace(",", ".")) : null;
}
