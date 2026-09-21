import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ScrollToTopBtn from "@/components/ScrollToTop/ScrollToTop";
import Footer from "@/components/Footer/Footer";
// Предположим, у вас есть компонент Header, импортируем его:
// import Header from "@/components/Header/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Pharmacy",
  description: "Your medications, delivered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header></header>

        <main>{children}</main>

        <Footer />
        <ScrollToTopBtn />
      </body>
    </html>
  );
}
