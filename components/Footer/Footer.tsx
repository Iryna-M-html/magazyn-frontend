"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  FileText,
  Home,
  MoreHorizontal,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/Auth/AuthProvider";

import styles from "./Footer.module.css";

const NAV_ITEMS = [
  { href: "/sprzedawca", label: "main", Icon: Home },
  { href: "/products", label: "products", Icon: BarChart3 },
  { href: "/reports", label: "reports", Icon: FileText },
  { href: "/recommendations", label: "more", Icon: MoreHorizontal },
] as const;

// Панель пользователей — только для администратора
const ADMIN_NAV_ITEM = { href: "/admin/users", label: "users", Icon: Users } as const;

export default function Footer() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const { user } = useAuth();

  const items =
    user?.role === "admin" ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <nav className={styles.bottomNav} aria-label={t("main")}>
      {items.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={isActive ? styles.navTabActive : styles.navTab}
            aria-current={isActive ? "page" : undefined}
            title={t(label)}
          >
            <Icon size={20} />

            <span className={styles.navLabel}>{t(label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
