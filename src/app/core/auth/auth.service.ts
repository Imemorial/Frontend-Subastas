import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from './auth.models';

const TOKEN_STORAGE_KEY = 'bitsauction.auth.token';
const USER_STORAGE_KEY = 'bitsauction.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userState = signal<AuthUser | null>(this.readStoredUser());
  private readonly tokenState = signal<string | null>(this.readStoredToken());

  readonly user = this.userState.asReadonly();
  readonly token = this.tokenState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null && this.tokenState() !== null);
  readonly isAdmin = computed(() => this.userState()?.role === 'admin');

  login(payload: LoginPayload): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/v1/auth/login`, payload).pipe(
      tap((response) => this.persistSession(response)),
      map((response) => response.user),
    );
  }

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/v1/auth/register`, payload).pipe(
      tap((response) => this.persistSession(response)),
      map((response) => response.user),
    );
  }

  logout(): Observable<void> {
    return this.http.post(`${environment.apiUrl}/v1/auth/logout`, {}).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.clearSession()),
    );
  }

  updateBitBalance(bitBalance: number): void {
    const currentUser = this.userState();

    if (!currentUser) {
      return;
    }

    const updatedUser: AuthUser = {
      ...currentUser,
      bit_balance: bitBalance,
    };

    this.userState.set(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  }

  private persistSession(response: AuthResponse): void {
    this.userState.set(response.user);
    this.tokenState.set(response.token);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
  }

  private clearSession(): void {
    this.userState.set(null);
    this.tokenState.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private readStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}
