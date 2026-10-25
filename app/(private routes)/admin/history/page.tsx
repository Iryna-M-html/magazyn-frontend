import { redirect } from "next/navigation";

// Старый адрес истории → «Historia zmian» (с теми же фильтрами в адресе)
export default async function HistoryRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  const query = params.toString();

  redirect(`/admin/changes${query ? `?${query}` : ""}`);
}
