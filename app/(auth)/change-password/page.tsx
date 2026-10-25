"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { changePassword, logout } from "@/lib/api/clientApi";

import styles from "../Auth.module.css";

const MIN_LENGTH = 8;

// Обязательная смена кода после входа с кодом от администратора
export default function ChangePasswordPage() {
  const t = useTranslations("Auth");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < MIN_LENGTH) {
      setError(t("codeTooShort", { min: MIN_LENGTH }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("codesDoNotMatch"));
      return;
    }

    if (newPassword === currentPassword) {
      setError(t("codeSameAsOld"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await changePassword({ currentPassword, newPassword });
      window.location.replace("/sprzedawca");
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "";

      setError(
        status === 401
          ? t("sessionExpired")
          : message === "Current password is incorrect"
            ? t("wrongCurrentCode")
            : message === "New password must be different"
              ? t("codeSameAsOld")
              : t("changeError"),
      );
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.replace("/login");
    }
  };

  const inputType = showPasswords ? "text" : "password";

  return (
    <div className={styles.page}>
      <LanguageSwitcher />

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.cardTitle}>{t("changeTitle")}</h1>
        <p className={styles.cardText}>{t("changeText")}</p>

        <div className={styles.field}>
          <label htmlFor="current-code">{t("currentCode")}</label>
          <div className={styles.passwordWrapper}>
            <input
              id="current-code"
              type={inputType}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoFocus
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPasswords((value) => !value)}
              aria-label={showPasswords ? t("hideCode") : t("showCode")}
            >
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="new-code">{t("newCode")}</label>
          <input
            id="new-code"
            type={inputType}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <span className={styles.hint}>
            {t("codeHint", { min: MIN_LENGTH })}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="confirm-code">{t("confirmCode")}</label>
          <input
            id="confirm-code"
            type={inputType}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
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
          {isSubmitting ? t("saving") : t("saveCode")}
        </button>

        <button
          type="button"
          className={styles.linkButton}
          onClick={handleLogout}
        >
          {t("logout")}
        </button>
      </form>
    </div>
  );
}
