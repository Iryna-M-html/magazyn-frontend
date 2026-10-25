import { NextRequest, NextResponse } from "next/server";
import { parseSetCookies, sessionCookieOptions } from "@/app/api/_utils/session";

// Страницы без входа
const PUBLIC_PAGES = ["/login"];

const HOME_PAGE = "/sprzedawca";

const isPublicPage = (pathname: string) =>
  PUBLIC_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));

/**
 * accessToken живёт 15 минут. Когда его cookie истекла, но есть refreshToken,
 * сессия обновляется на бэкенде, и запрос идёт дальше уже с новыми cookie.
 */
async function refreshSession(request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { Cookie: request.headers.get("cookie") ?? "" },
      },
    );

    if (!response.ok) {
      return null;
    }

    const cookies = parseSetCookies(response.headers.getSetCookie());

    return cookies.some((cookie) => cookie.name === "accessToken")
      ? cookies
      : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isPublic = isPublicPage(pathname);

  const hasAccessToken = request.cookies.has("accessToken");
  const hasRefreshToken = request.cookies.has("refreshToken");

  if (hasAccessToken) {
    // Уже вошёл — со страницы входа на главную
    return isPublic
      ? NextResponse.redirect(new URL(HOME_PAGE, request.url))
      : NextResponse.next();
  }

  const refreshed = hasRefreshToken ? await refreshSession(request) : null;

  if (refreshed) {
    // Новые cookie: для текущего запроса (route handler / страница) и для браузера
    for (const { name, value } of refreshed) {
      request.cookies.set(name, value);
    }

    const response = isPublic
      ? NextResponse.redirect(new URL(HOME_PAGE, request.url))
      : NextResponse.next({ request: { headers: request.headers } });

    for (const { name, value, maxAge } of refreshed) {
      response.cookies.set(name, value, sessionCookieOptions(maxAge));
    }

    return response;
  }

  // API без сессии пропускаем — права проверяет бэкенд (ответит 401/403)
  if (isApi || isPublic) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Всё, кроме статики и самих запросов входа/выхода
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
