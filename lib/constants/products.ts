// Значения совпадают с бэкендом (src/constants/categories.js, src/constants/units.js)

/** Категория по умолчанию в бэкенде; в названии нет ставки VAT, поэтому брутто для неё не считается */
export const DEFAULT_CATEGORY = "Другое";

/** Единицы веса/объёма упаковки — как product_quantity_unit из Open Food Facts */
export const QUANTITY_UNITS = ["g", "kg", "ml"] as const;

export type QuantityUnit = (typeof QUANTITY_UNITS)[number];
