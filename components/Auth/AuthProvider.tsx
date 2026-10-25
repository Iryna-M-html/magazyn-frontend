"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser, logout as logoutRequest } from "@/lib/api/clientApi";
import type { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const CHANGE_PASSWORD_PAGE = "/change-password";

/**
 * Текущий пользователь для страниц приложения (имя в шапке, роль).
 * Вход с кодом от администратора → сначала обязательная смена кода.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        // Сессии нет или она закончилась
        if (!cancelled) {
          router.replace(`/login?from=${encodeURIComponent(pathname)}`);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // Пользователь загружается один раз на сессию страницы
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.isFirstLogin && pathname !== CHANGE_PASSWORD_PAGE) {
      router.replace(CHANGE_PASSWORD_PAGE);
    }
  }, [user, pathname, router]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo(() => ({ user, loading, logout }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
