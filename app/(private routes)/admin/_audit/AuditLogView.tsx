"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Search,
} from "lucide-react";

import { getAuditLogs, getUsers } from "@/lib/api/clientApi";
import { formatDateTime } from "@/lib/utils/date";
import {
  AUDIT_ACTION_GROUPS,
  type AuditActionGroup,
  type AuditLogEntry,
  type AuditLogQuery,
} from "@/types/audit";
import { USER_ROLES, type User, type UserRole } from "@/types/user";

import {
  describeDevice,
  formatAuditDetails,
  formatAuditValue,
} from "./auditFormat";
import styles from "./AuditLogView.module.css";

const PAGE_SIZE = 50;
const EXPORT_LIMIT = 5000;

type Period = "today" | "7d" | "30d" | "all" | "custom";

/** logins — входы в систему, changes — изменения данных */
export type AuditMode = "logins" | "changes";

// Какие группы действий показывает каждый режим
const MODE_GROUPS: Record<AuditMode, AuditActionGroup[]> = {
  logins: ["auth"],
  changes: ["users", "products", "intakes", "other"],
};

const groupOf = (action: string): AuditActionGroup =>
  (Object.keys(AUDIT_ACTION_GROUPS) as AuditActionGroup[]).find((group) =>
    (AUDIT_ACTION_GROUPS[group] as readonly string[]).includes(action),
  ) ?? "other";

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Границы периода в местном времени → ISO для бэкенда
function periodRange(period: Period, fromDate: string, toDate: string) {
  const today = startOfDay(new Date());

  if (period === "today") {
    return { from: today.toISOString() };
  }

  if (period === "7d" || period === "30d") {
    const from = new Date(today);
    from.setDate(from.getDate() - (period === "7d" ? 6 : 29));
    return { from: from.toISOString() };
  }

  if (period === "custom") {
    const range: { from?: string; to?: string } = {};

    if (fromDate) {
      const [y, m, d] = fromDate.split("-").map(Number);
      range.from = new Date(y, m - 1, d).toISOString();
    }

    if (toDate) {
      const [y, m, d] = toDate.split("-").map(Number);
      range.to = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
    }

    return range;
  }

  return {};
}

export function AuditLogView({ mode }: { mode: AuditMode }) {
  const t = useTranslations("AuditLog");
  const tRoles = useTranslations("Roles");
  const searchParams = useSearchParams();

  const groups = MODE_GROUPS[mode];
  const isLogins = mode === "logins";

  // Фильтры (userId / entityId можно передать ссылкой: /admin/changes?userId=…)
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [userId, setUserId] = useState(searchParams.get("userId") ?? "");
  const [role, setRole] = useState<UserRole | "">("");
  const [actionFilter, setActionFilter] = useState("");
  const [period, setPeriod] = useState<Period>("7d");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entityId, setEntityId] = useState(searchParams.get("entityId") ?? "");
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Поиск по тексту — с задержкой, чтобы не запрашивать на каждую букву
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const query = useMemo<AuditLogQuery>(() => {
    // Без выбора — все действия своего режима (входы не смешиваются с изменениями)
    const action = !actionFilter
      ? groups.flatMap((group) => AUDIT_ACTION_GROUPS[group]).join(",")
      : actionFilter.startsWith("group:")
        ? AUDIT_ACTION_GROUPS[actionFilter.slice(6) as AuditActionGroup].join(",")
        : actionFilter;

    return {
      action,
      ...periodRange(period, fromDate, toDate),
      ...(userId && { userId }),
      ...(role && { role }),
      ...(entityId && { entityId }),
      ...(debouncedQ && { q: debouncedQ }),
    };
  }, [groups, actionFilter, period, fromDate, toDate, userId, role, entityId, debouncedQ]);

  // При смене фильтров — снова первая страница
  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(false);

    getAuditLogs({ ...query, page, limit: PAGE_SIZE })
      .then((result) => {
        if (!cancelled) {
          setEntries(result.data);
          setTotal(result.total);
          setPages(result.pages);
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки журнала:", error);

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
  }, [query, page]);

  const handleReset = () => {
    setQ("");
    setUserId("");
    setRole("");
    setActionFilter("");
    setPeriod("7d");
    setFromDate("");
    setToDate("");
    setEntityId("");
  };

  const describeChanges = (entry: AuditLogEntry) =>
    entry.changes
      .map(
        (change) =>
          `${t(`fields.${change.field}`)}: ${formatAuditValue(change.field, change.from, t, tRoles)} → ${formatAuditValue(change.field, change.to, t, tRoles)}`,
      )
      .join("; ");

  // Выгрузка в CSV — все записи по текущим фильтрам (до 5000)
  const handleExport = async () => {
    setExporting(true);

    try {
      const { data } = await getAuditLogs({ ...query, page: 1, limit: EXPORT_LIMIT });

      const header = isLogins
        ? [t("csv.date"), t("csv.user"), t("csv.role"), t("csv.event"), t("csv.ip"), t("csv.device")]
        : [
            t("csv.date"),
            t("csv.user"),
            t("csv.role"),
            t("csv.action"),
            t("csv.object"),
            t("csv.changes"),
            t("csv.details"),
            t("csv.ip"),
            t("csv.device"),
          ];

      const rows = data.map((entry) => {
        const common = [
          formatDateTime(entry.createdAt),
          entry.userName || t("unknownUser"),
          entry.userRole ? tRoles(entry.userRole) : "",
          t(`actions.${entry.action}`),
        ];

        return isLogins
          ? [...common, entry.ip, describeDevice(entry.userAgent)]
          : [
              ...common,
              entry.entityLabel,
              describeChanges(entry),
              formatAuditDetails(entry, t, tRoles),
              entry.ip,
              describeDevice(entry.userAgent),
            ];
      });

      const csv = [header, ...rows]
        .map((row) =>
          row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(";"),
        )
        .join("\n");

      const url = URL.createObjectURL(
        new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${isLogins ? "logowania" : "zmiany"}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка выгрузки журнала:", error);
      window.alert(t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  const renderUser = (entry: AuditLogEntry) => (
    <div className={styles.entryUser}>
      <button
        type="button"
        className={styles.userLink}
        onClick={() => entry.userId && setUserId(entry.userId)}
        disabled={!entry.userId}
        title={t("filterByUser")}
      >
        {entry.userName || t("unknownUser")}
      </button>
      {entry.userRole && (
        <span className={`${styles.roleBadge} ${styles[`role_${entry.userRole}`]}`}>
          {tRoles(entry.userRole)}
        </span>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t(`${mode}.title`)}</h1>
        <p className={styles.subtitle}>{t(`${mode}.subtitle`)}</p>
      </header>

      <div className={styles.content}>
        {/* ---------- Фильтры ---------- */}
        <section className={styles.filters}>
          <div className={styles.searchField}>
            <Search size={16} />
            <input
              type="text"
              value={q}
              placeholder={t(`${mode}.searchPlaceholder`)}
              aria-label={t(`${mode}.searchPlaceholder`)}
              onChange={(event) => setQ(event.target.value)}
            />
          </div>

          <div className={styles.filterGrid}>
            <div className={styles.field}>
              <label htmlFor="audit-user">{t("filters.user")}</label>
              <select
                id="audit-user"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              >
                <option value="">{t("filters.allUsers")}</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="audit-role">{t("filters.role")}</label>
              <select
                id="audit-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole | "")}
              >
                <option value="">{t("filters.allRoles")}</option>
                {USER_ROLES.map((value) => (
                  <option key={value} value={value}>
                    {tRoles(value)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="audit-action">{t(`${mode}.actionFilter`)}</label>
              <select
                id="audit-action"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
              >
                <option value="">{t(`${mode}.allActions`)}</option>
                {isLogins
                  ? AUDIT_ACTION_GROUPS.auth.map((action) => (
                      <option key={action} value={action}>
                        {t(`actions.${action}`)}
                      </option>
                    ))
                  : groups.map((group) => (
                      <optgroup key={group} label={t(`groups.${group}`)}>
                        <option value={`group:${group}`}>
                          {t("filters.wholeGroup", { group: t(`groups.${group}`) })}
                        </option>
                        {AUDIT_ACTION_GROUPS[group].map((action) => (
                          <option key={action} value={action}>
                            {t(`actions.${action}`)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="audit-period">{t("filters.period")}</label>
              <select
                id="audit-period"
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
              >
                <option value="today">{t("periods.today")}</option>
                <option value="7d">{t("periods.7d")}</option>
                <option value="30d">{t("periods.30d")}</option>
                <option value="all">{t("periods.all")}</option>
                <option value="custom">{t("periods.custom")}</option>
              </select>
            </div>

            {period === "custom" && (
              <>
                <div className={styles.field}>
                  <label htmlFor="audit-from">{t("filters.from")}</label>
                  <input
                    id="audit-from"
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="audit-to">{t("filters.to")}</label>
                  <input
                    id="audit-to"
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {entityId && (
            <div className={styles.entityFilter}>
              {t("filters.entity")}
              <button type="button" onClick={() => setEntityId("")} aria-label={t("reset")}>
                ×
              </button>
            </div>
          )}

          <div className={styles.filterActions}>
            <span className={styles.resultCount}>{t("found", { count: total })}</span>

            <button type="button" className={styles.secondaryButton} onClick={handleReset}>
              <RotateCcw size={15} />
              {t("reset")}
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleExport}
              disabled={exporting || total === 0}
            >
              <Download size={15} />
              {exporting ? t("exporting") : t("export")}
            </button>
          </div>

          <p className={styles.retention}>{t("retention")}</p>
        </section>

        {/* ---------- Записи ---------- */}
        {loading || loadError ? (
          <div className={styles.state}>{loading ? t("loading") : t("loadError")}</div>
        ) : entries.length === 0 ? (
          <div className={styles.state}>{t("empty")}</div>
        ) : isLogins ? (
          /* Входы: компактные строки — кто, когда, событие, откуда */
          <ul className={styles.loginList}>
            {entries.map((entry) => (
              <li
                key={entry._id}
                className={`${styles.loginRow} ${
                  entry.action === "auth.login_failed" ? styles.entryDanger : ""
                }`}
              >
                <time className={styles.entryTime} dateTime={entry.createdAt}>
                  {formatDateTime(entry.createdAt)}
                </time>

                {renderUser(entry)}

                <span className={`${styles.actionBadge} ${styles[`login_${entry.action.split(".")[1]}`]}`}>
                  {t(`actions.${entry.action}`)}
                </span>

                <span className={styles.meta}>
                  {[entry.ip, describeDevice(entry.userAgent)].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          /* Изменения: что, где и «было → стало» */
          <ul className={styles.entries}>
            {entries.map((entry) => {
              const details = formatAuditDetails(entry, t, tRoles);
              const device = describeDevice(entry.userAgent);

              return (
                <li key={entry._id} className={styles.entry}>
                  <div className={styles.entryTop}>
                    <span
                      className={`${styles.actionBadge} ${styles[`group_${groupOf(entry.action)}`]}`}
                    >
                      {t(`actions.${entry.action}`)}
                    </span>
                    <time className={styles.entryTime} dateTime={entry.createdAt}>
                      {formatDateTime(entry.createdAt)}
                    </time>
                  </div>

                  {renderUser(entry)}

                  {entry.entityLabel && (
                    <div className={styles.entryObject}>
                      {entry.entityType === "intake" && entry.entityId ? (
                        <Link href={`/inventory/${entry.entityId}`}>{entry.entityLabel}</Link>
                      ) : (
                        entry.entityLabel
                      )}
                      {entry.entityId && (
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => setEntityId(entry.entityId ?? "")}
                        >
                          {t("objectHistory")}
                        </button>
                      )}
                    </div>
                  )}

                  {entry.changes.length > 0 && (
                    <ul className={styles.changes}>
                      {entry.changes.map((change) => (
                        <li key={change.field}>
                          <span>{t(`fields.${change.field}`)}:</span>{" "}
                          <s>{formatAuditValue(change.field, change.from, t, tRoles)}</s>
                          {" → "}
                          <strong>{formatAuditValue(change.field, change.to, t, tRoles)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}

                  {details && <p className={styles.details}>{details}</p>}

                  {(entry.ip || device) && (
                    <p className={styles.meta}>{[entry.ip, device].filter(Boolean).join(" · ")}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {pages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setPage((value) => value - 1)}
              disabled={page <= 1 || loading}
              aria-label={t("previous")}
            >
              <ChevronLeft size={16} />
            </button>
            <span>{t("pageOf", { page, pages })}</span>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setPage((value) => value + 1)}
              disabled={page >= pages || loading}
              aria-label={t("next")}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
