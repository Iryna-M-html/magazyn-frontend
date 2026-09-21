import type { Metadata, Viewport } from "next";
import css from "./globals.css";

export const metadata: Metadata = {
  title: "Statistic for a shop",
  description: "Statistic for a shop",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <main id="app-container">{children}</main>
      </body>
    </html>
  );
}
