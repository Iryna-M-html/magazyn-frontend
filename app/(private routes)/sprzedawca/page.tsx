import { Suspense } from "react";
import { useTranslations } from "next-intl";
import SprzedawcaClient from "./Sprzedawca.client";

export default function SprzedawcaPage() {
  const t = useTranslations("Common");

  return (
    <Suspense
      fallback={
        <div style={{ padding: 20, textAlign: "center" }}>{t("loading")}</div>
      }
    >
      <SprzedawcaClient />
    </Suspense>
  );
}
