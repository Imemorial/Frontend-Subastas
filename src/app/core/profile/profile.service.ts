import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../auth/auth.models';
import {
  ProfileUpdatePayload,
  ProfileUpdateResponse,
  TransactionsResponse,
  UpdateEmailPayload,
  UpdatePasswordPayload,
} from './profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  refreshMe(): Observable<AuthUser> {
    return this.http.get<{ user: AuthUser }>(`${environment.apiUrl}/v1/auth/me`).pipe(
      map((response) => response.user),
      tap((user) => this.authService.updateUser(user)),
    );
  }

  updateProfile(payload: ProfileUpdatePayload): Observable<ProfileUpdateResponse> {
    return this.http
      .patch<ProfileUpdateResponse>(`${environment.apiUrl}/v1/me/profile`, payload)
      .pipe(tap((response) => this.authService.updateUser(response.user)));
  }

  updateEmail(payload: UpdateEmailPayload): Observable<ProfileUpdateResponse> {
    return this.http
      .patch<ProfileUpdateResponse>(`${environment.apiUrl}/v1/me/email`, payload)
      .pipe(tap((response) => this.authService.updateUser(response.user)));
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<ProfileUpdateResponse> {
    return this.http
      .patch<ProfileUpdateResponse>(`${environment.apiUrl}/v1/me/password`, payload)
      .pipe(tap((response) => this.authService.updateUser(response.user)));
  }

  getTransactions(): Observable<TransactionsResponse> {
    return this.http.get<TransactionsResponse>(`${environment.apiUrl}/v1/me/transactions`);
  }
}
