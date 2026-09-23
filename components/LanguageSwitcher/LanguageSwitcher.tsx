"use client";

import { useTransition, useEffect, useState } from "react";
import { setUserLocale } from "@/actions/set-locale";
import styles from "./LanguageSwitcher.module.css";

const languages = [
  { code: "pl", label: "PL" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState("pl");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Получаем значение locale из cookies
    const match = document.cookie.match(/locale=([^;]+)/);
    if (match) {
      setCurrentLocale(match[1]);
    }
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    setCurrentLocale(newLocale);
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
