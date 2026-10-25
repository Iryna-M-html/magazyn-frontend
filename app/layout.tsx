import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-roboto",
  display: "swap",
});

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={roboto.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <main id="app-container">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
