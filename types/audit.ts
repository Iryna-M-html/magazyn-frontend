import type { UserRole } from "@/types/user";

// Действия журнала — совпадают с бэкендом (src/constants/auditActions.js)
export const AUDIT_ACTION_GROUPS = {
  auth: ["auth.login", "auth.login_failed", "auth.logout", "auth.password_changed"],
  users: ["user.created", "user.code_reset"],
  products: ["product.created", "product.updated"],
  intakes: [
    "intake.created",
    "intake.discounted",
    "intake.written_off",
    "intake.price_changed",
  ],
  other: ["audit.created", "invoice.recognized"],
} as const;

export type AuditActionGroup = keyof typeof AUDIT_ACTION_GROUPS;

export type AuditAction =
  (typeof AUDIT_ACTION_GROUPS)[AuditActionGroup][number];

export interface AuditChange {
  field: string;
  from: unknown;
  to: unknown;
}

export interface AuditLogEntry {
  _id: string;
  userId: string | null;
  userName: string;
  userRole: UserRole | null;
  action: AuditAction;
  entityType: "user" | "product" | "intake" | "invoice" | null;
  entityId: string | null;
  entityLabel: string;
  changes: AuditChange[];
  details: Record<string, unknown> | null;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditLogQuery {
  userId?: string;
  role?: UserRole;
  /** Несколько действий через запятую */
  action?: string;
  entityId?: string;
  /** ISO, начало периода */
  from?: string;
  /** ISO, конец периода */
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogPage {
  data: AuditLogEntry[];
  total: number;
  page: number;
  pages: number;
}
