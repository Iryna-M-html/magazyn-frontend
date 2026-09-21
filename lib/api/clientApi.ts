import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
});

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
  const response = await API.get<ApiResponse<ProductData>>(
    `/products/barcode/${barcode}`,
  );
  return response.data;
};

// 2. Ручное создание товара
export const createProductManual = async (
  formData: FormData,
): Promise<ApiResponse<ProductData>> => {
  const response = await API.post<ApiResponse<ProductData>>(
    "/products/manual",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};
