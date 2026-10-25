import { nextServer } from "@/lib/api/api";
import type { InventoryReportResponse } from "@/types/report";
export interface ProductData {
  id: string;
  name: string;
  barcode: string;
  brand: string;
  imageUrl: string;
  source: string;
  category?: string;
  product_quantity: number | null;
  product_quantity_unit: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

// 1. Поиск товара по штрихкоду
export const getProductByBarcode = async (
  barcode: string,
): Promise<ApiResponse<ProductData>> => {
  const response = await nextServer.get<ApiResponse<ProductData>>(
    `/products/barcode/${barcode}`,
  );
  return response.data;
};

// 2. Ручное создание товара
export const createProductManual = async (
  formData: FormData,
): Promise<ApiResponse<ProductData>> => {
  // Axios сам правильно установит multipart/form-data вместе с boundary
  const response = await nextServer.post<ApiResponse<ProductData>>(
    "/products/manual",
    formData,
  );
  return response.data;
};

export interface UpdateProductData {
  category?: string;
  shelfPrice?: number;
}

// Изменение категории и/или цены на полке
export const updateProductByBarcode = async (
  barcode: string,
  data: UpdateProductData,
): Promise<ApiResponse<unknown>> => {
  const response = await nextServer.patch<ApiResponse<unknown>>(
    `/products/barcode/${barcode}`,
    data,
  );
  return response.data;
};

export interface CreateIntakeData {
  productId: string;
  quantity: number;
  batch?: string;
  expirationDate: string;
  /** Цена нетто за 1 шт.; брутто бэкенд считает сам по VAT категории */
  priceNetto?: number;
}

// 3. Фиксация приёмки товара (сохранение количества, партии и срока годности)
export const createInventoryIntake = async (
  intakeData: CreateIntakeData,
): Promise<ApiResponse<unknown>> => {
  const response = await nextServer.post<ApiResponse<unknown>>(
    "/inventory/intake",
    intakeData,
  );
  return response.data;
};

export interface IntakeItem {
  _id: string;
  quantity: number;
  batch?: string;
  expirationDate: string;
  productId: {
    _id: string;
    name: string;
    barcode: string;
    brand?: string;
    imageUrl?: string;
    unit?: string;
  };
}

export interface GetIntakesQueryParams {
  productId?: string;
  year?: string;
  month?: string;
  expirationDate?: string;
}

export interface IntakesListResponse {
  status: "success" | "error";
  amount: number;
  data: IntakeItem[];
  message?: string;
}

export const getAllIntakes = async ({
  productId,
  year,
  month,
  expirationDate,
}: GetIntakesQueryParams = {}) => {
  const params = {
    productId,
    year,
    month,
    expirationDate,
  };

  const res = await nextServer.get("/inventory/intake", {
    params,
  });

  return res.data;
};

// Отчёт «Analityka i inwentaryzacja»: партии с категорией, ценой и последней ревизией
export const getInventoryReport = async (): Promise<InventoryReportResponse> => {
  const res = await nextServer.get<InventoryReportResponse>("/reports/inventory");

  return res.data;
};

export interface Category {
  _id: string;
  title: string;
}

// Справочник категорий товаров
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  const res = await nextServer.get<ApiResponse<Category[]>>("/categories");

  return res.data;
};
