"use server";

import { cookies } from "next/headers";

const locales = ["pl", "ru", "en"] as const;

type Locale = (typeof locales)[number];

export async function setUserLocale(locale: string) {
  if (!locales.includes(locale as Locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  const store = await cookies();

  store.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
