import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface TestRechargeResponse {
  message: string;
  bits_added: number;
  bit_balance: number;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  testRecharge(): Observable<TestRechargeResponse> {
    return this.http
      .post<TestRechargeResponse>(`${environment.apiUrl}/v1/wallet/test-recharge`, {})
      .pipe(tap((response) => this.authService.updateBitBalance(response.bit_balance)));
  }
}
