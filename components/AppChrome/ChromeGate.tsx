"use client";

import { usePathname, useSearchParams } from "next/navigation";

// Полноэкранные экраны (сканер и «Товар найден») показываются без Header/Footer
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFullscreen =
    pathname === "/scan" ||
    (pathname === "/sprzedawca" && searchParams.has("barcode"));

  return isFullscreen ? null : children;
}
