export type UserRole = 'admin' | 'client';

export interface AuthUser {
  id: number;
  name: string;
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
