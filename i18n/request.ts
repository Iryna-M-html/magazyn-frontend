import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Список поддерживаемых локалей
export const locales = ["pl", "ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pl";

export default getRequestConfig(async () => {
  const store = await cookies();
  const rawLocale = store.get("locale")?.value;

  const locale = locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
