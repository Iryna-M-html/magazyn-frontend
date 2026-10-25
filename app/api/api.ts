import axios from "axios";
import { headers } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// IP и браузер пользователя — для журнала действий на бэкенде
// (иначе бэкенд видел бы только адрес сервера Next.js)
api.interceptors.request.use(async (config) => {
  try {
    const incoming = await headers();
    const forwardedFor = incoming.get("x-forwarded-for");
    const userAgent = incoming.get("user-agent");

    if (forwardedFor) {
      config.headers.set("X-Forwarded-For", forwardedFor);
    }

    if (userAgent) {
      config.headers.set("User-Agent", userAgent);
    }
  } catch {
    // Вызов вне HTTP-запроса — заголовков нет
  }

  return config;
});
