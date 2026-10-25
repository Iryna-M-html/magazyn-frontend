"use client";

import { useTranslations } from "next-intl";
import { LogOut, UserCircle } from "lucide-react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";

import styles from "./Header.module.css";

const Logo = () => (
  <svg
    className={styles.logo}
    width="52"
    height="52"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>

    <path
      d="M 50 85 L 15 50 L 32 30 L 50 48 L 68 30 L 85 50 Z"
      stroke="url(#logo-gradient)"
      strokeWidth="10"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />

    <path
      d="M 33 45 L 50 28 L 67 45"
      stroke="#1E293B"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default function Header() {
  const t = useTranslations("Header");
  const tRoles = useTranslations("Roles");
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Logo />

        <div className={styles.brandText}>
          <p className={styles.title}>{t("title")}</p>

          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
      </div>

      {/* Вошедший пользователь: имя и фамилия, роль, выход */}
      {user && (
        <div className={styles.userInfo}>
          <UserCircle size={22} className={styles.userIcon} aria-hidden="true" />

          <div className={styles.userText}>
            <span className={styles.userName}>{user.fullName}</span>
            <span className={styles.userRole}>{tRoles(user.role)}</span>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={logout}
            title={t("logout")}
            aria-label={t("logout")}
          >
            <LogOut size={18} />
          </button>
        </div>
      )}

      <div className={styles.headerRight}>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
