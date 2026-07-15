import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuctionService, RecentWin } from './core/auction/auction.service';
import { AuthService } from './core/auth/auth.service';
import { WalletService } from './core/wallet/wallet.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe],
  template: `
    <div class="page-shell flex min-h-screen flex-col">
      <!-- Live wins ticker -->
      @if (tickerItems().length > 0) {
        <div class="live-ticker shrink-0" aria-hidden="true">
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

      <header class="sticky top-0 z-50 w-full border-b border-gold/10 bg-space-dark/90 backdrop-blur-xl">
        <div class="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-1 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
          <a routerLink="/" class="group flex min-w-0 max-w-[42%] shrink items-center gap-1.5 sm:max-w-none sm:gap-2.5">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-shine font-display text-xs font-black text-space-dark shadow-gold transition group-hover:animate-coin-flip sm:h-10 sm:w-10 sm:rounded-xl sm:text-base"
            >
              B
            </div>
            <div class="min-w-0">
              <span class="block truncate font-display text-base font-black text-gradient-neon sm:text-xl">BitsAuction</span>
              <p class="hidden text-[9px] uppercase tracking-[0.3em] text-gold/70 md:block">Subastas premium</p>
            </div>
          </a>

          <div class="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            @if (isAuthenticated()) {
              <div class="chip-balance" title="Tus fichas">
                <div class="chip-balance-icon">₿</div>
                <p class="chip-balance-value">
                  {{ currentUser()?.bit_balance ?? 0 }}
                  <span class="chip-balance-unit">Bits</span>
                </p>
              </div>

              <button
                type="button"
                class="hidden animate-cta-pulse rounded-xl bg-gradient-to-r from-neon-emerald to-neon-emerald-dim px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-neon-emerald disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
                [disabled]="recharging()"
                (click)="rechargeBits()"
              >
                {{ recharging() ? 'Recargando...' : '+ Recargar' }}
              </button>

              <a
                routerLink="/perfil"
                class="group hidden truncate rounded-xl px-1.5 py-1 text-right transition hover:bg-white/5 lg:block lg:max-w-none lg:px-2"
                title="Ver mi perfil"
              >
                <p class="truncate text-xs font-semibold text-white group-hover:text-gold-light sm:text-sm">{{ headerDisplayName() }}</p>
                <p class="hidden truncate text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-gray-400 sm:block">{{ roleLabel() }}</p>
              </a>

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
                class="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-gray-300 transition hover:border-white/20 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
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

      <div class="page-content min-w-0 flex-1">
        <router-outlet />
      </div>
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

  readonly headerDisplayName = computed(() =>
    this.currentUser()?.role === 'admin' ? 'ADMINISTRADOR' : (this.currentUser()?.name ?? ''),
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
