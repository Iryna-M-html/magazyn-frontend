import { Suspense } from "react";

import { ChromeGate } from "@/components/AppChrome/ChromeGate";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";

import styles from "./layout.module.css";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className={styles.shell}>
        <Suspense fallback={null}>
          <ChromeGate>
            <Header />
          </ChromeGate>
        </Suspense>

        <div className={styles.page}>{children}</div>

        <Suspense fallback={null}>
          <ChromeGate>
            <Footer />
          </ChromeGate>
        </Suspense>
      </div>
    </AuthProvider>
  );
}
