import { Suspense } from "react";
import SprzedawcaClient from "./Sprzedawca.client";

export default function SprzedawcaPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 20, textAlign: "center" }}>Загрузка...</div>
      }
    >
      <SprzedawcaClient />
    </Suspense>
  );
}
