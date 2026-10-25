import { Suspense } from "react";
import { useTranslations } from "next-intl";
import ProductsClient from "./Products.client";

export default function ProductsPage() {
  const t = useTranslations("Common");

  return (
    <Suspense
      fallback={
        <div style={{ padding: 20, textAlign: "center" }}>{t("loading")}</div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
