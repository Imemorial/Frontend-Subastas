import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuctionService, RecentWin } from './core/auction/auction.service';
import { AuthService } from './core/auth/auth.service';
import { WalletService } from './core/wallet/wallet.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe],
  template: `
    <div class="min-h-screen">
      <!-- Live wins ticker -->
      @if (tickerItems().length > 0) {
        <div class="live-ticker" aria-hidden="true">
          <div class="live-ticker-track">
            @for (item of tickerItems(); track item.key) {
              <span class="inline-flex items-center gap-2 px-2 text-xs text-gray-300">
                <span class="text-gold">🏆</span>
                <span class="font-semibold text-white">{{ item.winner }}</span>
                <span class="text-gray-500">se llevó</span>
                <span class="font-semibold text-neon-emerald">{{ item.product }}</span>
                <span class="text-gray-500">por solo</span>
                <span class="font-bold text-gold">{{ item.price | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</span>
                <span class="savings-badge">-{{ item.discount }}%</span>
              </span>
            }
            @for (item of tickerItems(); track item.key + '-dup') {
              <span class="inline-flex items-center gap-2 px-2 text-xs text-gray-300">
                <span class="text-gold">🏆</span>
                <span class="font-semibold text-white">{{ item.winner }}</span>
                <span class="text-gray-500">se llevó</span>
                <span class="font-semibold text-neon-emerald">{{ item.product }}</span>
                <span class="text-gray-500">por solo</span>
                <span class="font-bold text-gold">{{ item.price | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</span>
                <span class="savings-badge">-{{ item.discount }}%</span>
              </span>
            }
          </div>
        </div>
      }

      <header class="sticky top-0 z-50 border-b border-gold/10 bg-space-dark/90 backdrop-blur-xl">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a routerLink="/" class="group flex items-center gap-2.5">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-shine font-display text-base font-black text-space-dark shadow-gold transition group-hover:animate-coin-flip"
            >
              B
            </div>
            <div>
              <span class="font-display text-xl font-black text-gradient-neon">BitsAuction</span>
              <p class="text-[9px] uppercase tracking-[0.3em] text-gold/70">Subastas premium</p>
            </div>
          </a>

          <div class="flex items-center gap-2 sm:gap-3">
            @if (isAuthenticated()) {
              <div class="chip-balance">
                <div class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gold-shine text-xs font-black text-space-dark shadow-gold">
                  ₿
                </div>
                <div class="relative z-10">
                  <p class="text-[9px] uppercase tracking-widest text-gold/80">Tus fichas</p>
                  <p class="font-display text-sm font-black text-gold-light">
                    {{ currentUser()?.bit_balance ?? 0 }}
                    <span class="text-[10px] font-semibold text-gold/70">Bits</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="hidden animate-cta-pulse rounded-xl bg-gradient-to-r from-neon-emerald to-neon-emerald-dim px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-neon-emerald disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
                [disabled]="recharging()"
                (click)="rechargeBits()"
              >
                {{ recharging() ? 'Recargando...' : '+ Recargar' }}
              </button>

              <div class="hidden text-right sm:block">
                <p class="text-sm font-semibold text-white">{{ currentUser()?.name }}</p>
                <p class="text-[10px] uppercase tracking-widest text-gray-500">{{ roleLabel() }}</p>
              </div>

              @if (isAdmin()) {
                <a
                  routerLink="/admin"
                  class="hidden rounded-xl border border-neon-magenta/30 bg-neon-magenta/10 px-3 py-2 text-xs font-semibold text-neon-magenta transition hover:text-white sm:inline-flex"
                >
                  Admin
                </a>
              }

              <button
                type="button"
                class="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-white/20 hover:text-white"
                (click)="logout()"
              >
                Salir
              </button>
            } @else {
              <a
                routerLink="/login"
                routerLinkActive="shadow-gold"
                class="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-gold/30 hover:text-gold-light"
              >
                Entrar
              </a>
              <a routerLink="/register" class="btn-neon-primary animate-cta-pulse px-4 py-2 text-xs">
                Jugar gratis
              </a>
            }
          </div>
        </div>
      </header>

      <router-outlet />
    </div>
  `,
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly auctionService = inject(AuctionService);
  private readonly walletService = inject(WalletService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly recentWins = signal<RecentWin[]>([]);
  readonly recharging = signal(false);

  readonly roleLabel = computed(() =>
    this.currentUser()?.role === 'admin' ? 'Administrador' : 'Jugador',
  );

  rechargeBits(): void {
    if (this.recharging()) {
      return;
    }

    this.recharging.set(true);
    this.walletService.testRecharge().subscribe({
      next: () => this.recharging.set(false),
      error: () => this.recharging.set(false),
    });
  }

  readonly tickerItems = computed(() =>
    this.recentWins().map((win) => ({
      key: `win-${win.id}`,
      winner: win.winnerName,
      product: win.productName,
      price: win.finalPrice,
      discount: win.discountPercent,
    })),
  );

  ngOnInit(): void {
    this.auctionService.getHomeWinners().subscribe({
      next: (wins) => this.recentWins.set(wins),
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      void this.router.navigate(['/login']);
    });
  }
}
