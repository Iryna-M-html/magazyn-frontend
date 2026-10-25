import { Suspense } from "react";
import { useTranslations } from "next-intl";
import CreateProductClient from "./CreateProduct.client";

export default function CreateProductPage() {
  const t = useTranslations("Common");

  return (
    <Suspense
      fallback={
        <div style={{ padding: 20, textAlign: "center" }}>{t("loading")}</div>
      }
    >
      <CreateProductClient />
    </Suspense>
  );
}
