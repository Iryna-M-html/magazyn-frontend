"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { login } from "@/lib/api/clientApi";

import styles from "../Auth.module.css";

const HOME_PAGE = "/sprzedawca";

// Возврат только на страницы приложения (защита от перенаправления на чужой сайт)
const getSafeRedirect = (from: string | null) =>
  from && from.startsWith("/") && !from.startsWith("//") && from !== "/login"
    ? from
    : HOME_PAGE;

export default function LoginClient() {
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");
  const tHeader = useTranslations("Header");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !password) {
      setError(t("fillAll"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { mustChangePassword } = await login({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });

      // Полная перезагрузка — чтобы страницы приложения получили новую сессию
      window.location.replace(
        mustChangePassword
          ? "/change-password"
          : getSafeRedirect(searchParams.get("from")),
      );
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      setError(
        status === 401 || status === 400
          ? t("invalidCredentials")
          : status === 429
            ? t("tooManyAttempts")
            : t("loginError"),
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <LanguageSwitcher />

      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>{tHeader("title")}</h1>
        <p className={styles.brandSubtitle}>{tHeader("subtitle")}</p>
      </div>

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.cardTitle}>{t("loginTitle")}</h2>
        <p className={styles.cardText}>{t("loginText")}</p>

        <div className={styles.field}>
          <label htmlFor="login-first-name">{t("firstName")}</label>
          <input
            id="login-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-last-name">{t("lastName")}</label>
          <input
            id="login-last-name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-code">{t("accessCode")}</label>
          <div className={styles.passwordWrapper}>
            <input
              id="login-code"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t("hideCode") : t("showCode")}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </div>
  );
}
