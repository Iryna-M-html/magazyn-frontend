import { Suspense } from "react";
import ProductsClient from "./Products.client";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 20, textAlign: "center" }}>Загрузка...</div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
