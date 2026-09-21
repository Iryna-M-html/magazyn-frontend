import { nextServer } from "@/lib/api/api";
export interface ProductData {
  id: string;
  name: string;
  barcode: string;
  brand: string;
  imageUrl: string;
  source: string;
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

export interface CreateIntakeData {
  productId: string;
  quantity: number;
  batch?: string;
  expirationDate: string;
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
