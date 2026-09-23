"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { setUserLocale } from "@/actions/set-locale";
import styles from "./LanguageSwitcher.module.css";

const languages = [
  { code: "pl", label: "PL" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    startTransition(async () => {
      await setUserLocale(newLocale);
    });
  };

  return (
    <div className={styles.switcherContainer}>
      {languages.map((lang) => {
        const isActive = currentLocale === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            className={`${styles.langButton} ${
              isActive ? styles.active : ""
            } ${isPending ? styles.pending : ""}`}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isPending}
            aria-pressed={isActive}
            aria-label={`Switch language to ${lang.label}`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
