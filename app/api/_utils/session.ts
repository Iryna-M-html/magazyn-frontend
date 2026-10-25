import { cookies } from "next/headers";

// Cookie сессии бэкенда: accessToken (15 минут), refreshToken и sessionId (30 дней)
export const SESSION_COOKIES = ["accessToken", "refreshToken", "sessionId"] as const;

export interface ParsedCookie {
  name: string;
  value: string;
  maxAge?: number;
}

/**
 * Разбирает заголовки Set-Cookie ответа бэкенда.
 * Бэкенд ставит cookie с Secure + SameSite=None — браузер принимает такие только по HTTPS,
 * поэтому Next.js выставляет их заново со своими параметрами (см. sessionCookieOptions).
 */
export function parseSetCookies(
  setCookie: string[] | string | undefined | null,
): ParsedCookie[] {
  const headers = Array.isArray(setCookie)
    ? setCookie
    : setCookie
      ? [setCookie]
      : [];

  return headers
    .map((header): ParsedCookie => {
      const [pair, ...attributes] = header.split(";");
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator).trim();
      const value = decodeURIComponent(pair.slice(separator + 1).trim());

      const maxAgeAttribute = attributes.find((attribute) =>
        attribute.trim().toLowerCase().startsWith("max-age="),
      );

      return {
        name,
        value,
        maxAge: maxAgeAttribute
          ? Number(maxAgeAttribute.split("=")[1])
          : undefined,
      };
    })
    .filter((cookie) =>
      (SESSION_COOKIES as readonly string[]).includes(cookie.name),
    );
}

// Secure только в продакшене (HTTPS) — иначе вход не работал бы с телефона по http://192.168…
export const sessionCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

/** Переносит cookie сессии из ответа бэкенда в ответ Next.js (route handlers) */
export async function applySessionCookies(
  setCookie: string[] | string | undefined | null,
) {
  const store = await cookies();

  for (const { name, value, maxAge } of parseSetCookies(setCookie)) {
    store.set(name, value, sessionCookieOptions(maxAge));
  }
}

export async function clearSessionCookies() {
  const store = await cookies();

  for (const name of SESSION_COOKIES) {
    store.delete(name);
  }
}
