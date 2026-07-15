import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/profile/profile.service';
import {
  TRANSACTION_TYPE_LABELS,
  WalletTransaction,
} from '../../core/profile/profile.models';
import { WalletService } from '../../core/wallet/wallet.service';

@Component({
  selector: 'app-profile-bits-page',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  template: `
    <section class="glass-card border-gold/15 p-6 sm:p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💰</span>
          <div>
            <h2 class="text-xl font-bold text-white">Mis Bits</h2>
            <p class="text-sm text-gray-400">Saldo, recargas y últimos movimientos.</p>
          </div>
        </div>
        <button
          type="button"
          class="animate-cta-pulse rounded-xl bg-gradient-to-r from-neon-emerald to-neon-emerald-dim px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-neon-emerald disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="recharging()"
          (click)="rechargeBits()"
        >
          {{ recharging() ? 'Recargando...' : '+ Recargar Bits' }}
        </button>
      </div>

      <div class="mb-6 rounded-xl border border-gold/20 bg-gold/5 p-4">
        <p class="text-xs uppercase tracking-widest text-gold/70">Saldo actual</p>
        <p class="font-display text-3xl font-black text-gold-light">
          {{ currentUser()?.bit_balance ?? 0 }}
          <span class="text-base font-semibold text-gold/70">Bits</span>
        </p>
      </div>

      <h3 class="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">Últimos movimientos</h3>

      @if (loadingTransactions()) {
        <p class="text-sm text-gray-500">Cargando movimientos...</p>
      } @else if (transactions().length === 0) {
        <p class="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-gray-400">
          Aún no tienes movimientos de Bits.
        </p>
      } @else {
        <ul class="space-y-2">
          @for (tx of transactions(); track tx.id) {
            <li class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white">{{ transactionLabel(tx) }}</p>
                <p class="text-xs text-gray-500">
                  {{ (tx.completed_at ?? tx.created_at) | date: 'dd/MM/yyyy HH:mm' : '' : 'es' }}
                </p>
              </div>
              <div class="shrink-0 text-right">
                <p
                  class="font-display text-sm font-bold"
                  [class.text-neon-emerald]="tx.bits_delta > 0"
                  [class.text-red-400]="tx.bits_delta < 0"
                >
                  {{ tx.bits_delta > 0 ? '+' : '' }}{{ tx.bits_delta }} Bits
                </p>
                @if (tx.amount_eur > 0) {
                  <p class="text-xs text-gray-500">
                    {{ tx.amount_eur | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
                  </p>
                }
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class ProfileBitsPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly walletService = inject(WalletService);

  readonly currentUser = this.authService.user;
  readonly loadingTransactions = signal(true);
  readonly transactions = signal<WalletTransaction[]>([]);
  readonly recharging = signal(false);

  ngOnInit(): void {
    this.loadTransactions();
  }

  rechargeBits(): void {
    if (this.recharging()) {
      return;
    }

    this.recharging.set(true);
    this.walletService.testRecharge().subscribe({
      next: () => {
        this.recharging.set(false);
        this.loadTransactions();
      },
      error: () => this.recharging.set(false),
    });
  }

  transactionLabel(tx: WalletTransaction): string {
    return TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type;
  }

  private loadTransactions(): void {
    this.loadingTransactions.set(true);
    this.profileService.getTransactions().subscribe({
      next: (response) => {
        this.transactions.set(response.data ?? []);
        this.loadingTransactions.set(false);
      },
      error: () => {
        this.transactions.set([]);
        this.loadingTransactions.set(false);
      },
    });
  }
}
