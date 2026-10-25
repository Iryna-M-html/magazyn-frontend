import type { User } from "@/types/user";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Номер партии при приёмке: инициалы принимающего + дата приёмки (местная).
 * Iryna Mokhnata, 25.10.2026 → «IM-25.10.2026»
 */
export function makeBatchCode(user: User | null, date = new Date()): string {
  const parts = user?.fullName.trim().split(/\s+/) ?? [];
  const first = user?.firstName ?? parts[0] ?? "";
  const last = user?.lastName ?? parts[parts.length - 1] ?? "";

  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "XX";

  return `${initials}-${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}
