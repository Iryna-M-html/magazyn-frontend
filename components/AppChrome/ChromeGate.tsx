"use client";

import { usePathname, useSearchParams } from "next/navigation";

// Полноэкранные экраны (сканер, «Товар найден», ручное добавление товара) показываются без Header/Footer
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFullscreen =
    pathname === "/scan" ||
    pathname === "/sprzedawca/create" ||
    (pathname === "/sprzedawca" && searchParams.has("barcode"));

  return isFullscreen ? null : children;
}
