"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BarChart3, FileText, Home, MoreHorizontal } from "lucide-react";

import styles from "./Footer.module.css";

const NAV_ITEMS = [
  { href: "/sprzedawca", label: "main", Icon: Home },
  { href: "/products", label: "products", Icon: BarChart3 },
  { href: "/reports", label: "reports", Icon: FileText },
  { href: "/more", label: "more", Icon: MoreHorizontal },
] as const;

export default function Footer() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} aria-label={t("main")}>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={isActive ? styles.navTabActive : styles.navTab}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} />

            <span className={styles.navLabel}>{t(label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
