// admin — администратор, owner — руководитель, user — продавец
export type UserRole = "admin" | "owner" | "user";

export const USER_ROLES: UserRole[] = ["user", "owner", "admin"];

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: UserRole;
  /** true — вошёл с кодом от администратора и должен задать свой */
  isFirstLogin?: boolean;
  createdAt?: string;
}

export interface LoginData {
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  mustChangePassword: boolean;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  role: UserRole;
}

/** Код доступа приходит только в ответе на создание / сброс — в базе хранится хеш */
export interface UserWithAccessCode {
  user: User;
  accessCode: string;
}
