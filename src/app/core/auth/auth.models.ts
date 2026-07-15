export type UserRole = 'admin' | 'client';

export interface AuthUser {
  id: number;
  name: string;
  last_name: string | null;
  email: string;
  role: UserRole;
  bit_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface MessageResponse {
  message: string;
}
