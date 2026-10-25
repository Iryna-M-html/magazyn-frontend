"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FilePen, LogIn, ShieldAlert, Users } from "lucide-react";

import { useAuth } from "@/components/Auth/AuthProvider";

import styles from "./AdminShell.module.css";

const SECTIONS = [
  { href: "/admin/users", label: "users", Icon: Users },
  { href: "/admin/logins", label: "logins", Icon: LogIn },
  { href: "/admin/changes", label: "changes", Icon: FilePen },
] as const;

/**
 * Панель администратора: проверка роли для всех разделов сразу и боковое меню разделов.
 * Остальным ролям разделы не показываются (бэкенд тоже отдаёт данные только администратору).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AdminNav");
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className={styles.state}>{t("loading")}</div>;
  }

  if (user?.role !== "admin") {
    return (
      <div className={styles.state}>
        <ShieldAlert size={32} />
        <p>{t("noAccess")}</p>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>{t("title")}</p>

        <nav className={styles.nav} aria-label={t("title")}>
          {SECTIONS.map(({ href, label, Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={isActive ? styles.navItemActive : styles.navItem}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} />
                {t(label)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={styles.main}>{children}</div>
    </div>
  );
}
