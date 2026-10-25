"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Check, Copy, KeyRound, ShieldAlert, UserPlus, X } from "lucide-react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { createUser, getUsers, resetUserPassword } from "@/lib/api/clientApi";
import { formatDate } from "@/lib/utils/date";
import { USER_ROLES, type User, type UserRole } from "@/types/user";

import styles from "./UsersAdmin.module.css";

interface Credentials {
  fullName: string;
  accessCode: string;
  isReset: boolean;
}

export default function UsersAdminClient() {
  const t = useTranslations("UsersAdmin");
  const tRoles = useTranslations("Roles");
  const { user: currentUser, loading: authLoading } = useAuth();

  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [formError, setFormError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [resettingId, setResettingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let cancelled = false;

    getUsers()
      .then((list) => {
        if (!cancelled) {
          setUsers(list);
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки пользователей:", error);

        if (!cancelled) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const showCredentials = (next: Credentials) => {
    setCopied(false);
    setCredentials(next);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setFormError(t("nameRequired"));
      return;
    }

    setIsCreating(true);
    setFormError("");

    try {
      const { user, accessCode } = await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      });

      setUsers((list) => [...list, user]);
      setFirstName("");
      setLastName("");
      setRole("user");
      showCredentials({ fullName: user.fullName, accessCode, isReset: false });
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      setFormError(status === 400 ? t("invalidName") : t("createError"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = async (user: User) => {
    if (!window.confirm(t("resetConfirm", { name: user.fullName }))) {
      return;
    }

    setResettingId(user._id);

    try {
      const { user: updated, accessCode } = await resetUserPassword(user._id);

      setUsers((list) =>
        list.map((item) => (item._id === updated._id ? updated : item)),
      );
      showCredentials({ fullName: updated.fullName, accessCode, isReset: true });
    } catch (error) {
      console.error("Ошибка сброса кода:", error);
      window.alert(t("resetError"));
    } finally {
      setResettingId(null);
    }
  };

  // Clipboard API есть только в безопасном контексте (HTTPS / localhost) — иначе код выделяется вручную
  const handleCopy = async () => {
    if (!credentials) {
      return;
    }

    try {
      await navigator.clipboard.writeText(credentials.accessCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (authLoading) {
    return <div className={styles.state}>{t("loading")}</div>;
  }

  if (!isAdmin) {
    return (
      <div className={styles.state}>
        <ShieldAlert size={32} />
        <p>{t("noAccess")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </header>

      <div className={styles.content}>
        {/* Новый пользователь */}
        <form className={styles.card} onSubmit={handleCreate} noValidate>
          <h2 className={styles.cardTitle}>
            <UserPlus size={18} />
            {t("addTitle")}
          </h2>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="new-user-first-name">{t("firstName")}</label>
              <input
                id="new-user-first-name"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="new-user-last-name">{t("lastName")}</label>
              <input
                id="new-user-last-name"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="new-user-role">{t("role")}</label>
              <select
                id="new-user-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                {USER_ROLES.map((value) => (
                  <option key={value} value={value}>
                    {tRoles(value)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className={styles.hint}>{t("addHint")}</p>

          {formError && (
            <div className={styles.error} role="alert">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isCreating}
          >
            {isCreating ? t("creating") : t("create")}
          </button>
        </form>

        {/* Список */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            {t("listTitle", { count: users.length })}
          </h2>

          {loading || loadError ? (
            <p className={styles.muted}>
              {loading ? t("loading") : t("loadError")}
            </p>
          ) : users.length === 0 ? (
            <p className={styles.muted}>{t("empty")}</p>
          ) : (
            <ul className={styles.userList}>
              {users.map((user) => (
                <li key={user._id} className={styles.userRow}>
                  <div className={styles.userMain}>
                    <span className={styles.userName}>
                      {user.fullName}
                      {user._id === currentUser?._id && (
                        <span className={styles.youBadge}>{t("you")}</span>
                      )}
                    </span>

                    <span className={styles.userMeta}>
                      <span
                        className={`${styles.roleBadge} ${styles[`role_${user.role}`]}`}
                      >
                        {tRoles(user.role)}
                      </span>

                      <span
                        className={
                          user.isFirstLogin ? styles.statusPending : styles.statusActive
                        }
                      >
                        {user.isFirstLogin ? t("statusPending") : t("statusActive")}
                      </span>

                      {user.createdAt && (
                        <span className={styles.createdAt}>
                          {t("createdAt", { date: formatDate(user.createdAt) })}
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => handleReset(user)}
                    disabled={resettingId === user._id}
                  >
                    <KeyRound size={15} />
                    {t("newCode")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Код доступа — показывается один раз */}
      {credentials && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="credentials-title"
        >
          <div className={styles.dialog}>
            <button
              type="button"
              className={styles.dialogClose}
              onClick={() => setCredentials(null)}
              aria-label={t("close")}
            >
              <X size={18} />
            </button>

            <h2 id="credentials-title" className={styles.cardTitle}>
              {credentials.isReset ? t("resetDone") : t("createdDone")}
            </h2>

            <dl className={styles.credentials}>
              <div>
                <dt>{t("loginName")}</dt>
                <dd>{credentials.fullName}</dd>
              </div>
              <div>
                <dt>{t("accessCode")}</dt>
                <dd className={styles.code}>{credentials.accessCode}</dd>
              </div>
            </dl>

            <p className={styles.warning}>{t("codeOnce")}</p>

            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleCopy}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? t("copied") : t("copy")}
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setCredentials(null)}
              >
                {t("done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
