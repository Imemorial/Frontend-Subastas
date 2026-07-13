import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { BidService } from '../../../core/auction/bid.service';
import { AuthService } from '../../../core/auth/auth.service';
import { WebsocketService } from '../../../core/websocket/websocket.service';
import { AuctionSummary } from '../../models/auction.model';

const BIT_PRESETS = [1, 5, 10, 20, 50] as const;

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <article class="glass-card group flex h-full flex-col transition-all duration-300 hover:-translate-y-1.5">
      <div class="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        <img
          [src]="imageUrl()"
          [alt]="auction().product.name"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-space-dark via-space-dark/30 to-transparent"></div>

        @if (discountPercent() > 0) {
          <span
            class="absolute left-3 top-3 rounded-lg bg-gradient-to-r from-casino-red to-casino-red-dim px-2.5 py-1 text-xs font-black text-white shadow-neon-magenta"
          >
            AHORRA {{ discountPercent() }}%
          </span>
        }

        <div class="absolute right-3 top-3">
          <span
            class="flex items-center gap-1.5 rounded-xl border border-neon-cyan/30 bg-space-dark/90 px-2.5 py-1 backdrop-blur-md"
          >
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan"></span>
            </span>
            <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-neon-cyan">Live</span>
          </span>
        </div>
      </div>

      <div class="relative z-10 flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 class="line-clamp-2 font-display text-base font-bold text-white">
            {{ auction().product.name }}
          </h3>
          <p class="mt-1 text-xs text-gray-500">
            Valor en tienda:
            <span class="price-anchor">{{ retailValue() | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}</span>
          </p>
        </div>

        <div class="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
          <div class="flex items-end justify-between">
            <div>
              <p class="text-[9px] uppercase tracking-wider text-gray-500">Precio ahora</p>
              <p class="font-display text-2xl font-black text-neon-emerald">
                {{ currentPrice() | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[9px] uppercase tracking-wider text-gray-500">Pujas</p>
              <p class="font-display text-xl font-bold text-neon-cyan">{{ totalBids() }}</p>
            </div>
          </div>
          @if (savingsAmount() > 0) {
            <p class="mt-2 text-center text-xs text-neon-emerald">
              Te ahorras
              <span class="font-bold">{{ savingsAmount() | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}</span>
              del precio real
            </p>
          }
        </div>

        @if (lastBidder(); as bidder) {
          <div class="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
            <img
              [src]="bidder.avatarUrl"
              [alt]="bidder.name"
              width="32"
              height="32"
              class="rounded-full ring-2 ring-neon-emerald/40"
              loading="lazy"
            />
            <div class="min-w-0 flex-1">
              @if (isCurrentUserWinning()) {
                <p class="truncate text-xs font-semibold text-gold">¡Vas ganando!</p>
                <p class="truncate text-sm font-bold text-white">No dejes escapar el premio</p>
              } @else {
                <p class="truncate text-xs text-gray-400">{{ bidder.name }} va ganando</p>
                <p class="truncate text-xs text-red-300/80">¡Puja antes de que se lo lleve!</p>
              }
            </div>
            @if (isCurrentUserWinning()) {
              <span class="badge-winning">Tuyo</span>
            } @else {
              <span class="badge-hot">Rival</span>
            }
          </div>
        }

        @if (isAuthenticated()) {
          <div class="space-y-2">
            <p class="text-[9px] uppercase tracking-wider text-gray-500">Bits a pujar</p>
            <div class="flex flex-wrap gap-1.5">
              @for (preset of bitPresets; track preset) {
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-bold transition"
                  [class]="
                    selectedBits() === preset
                      ? 'border-gold bg-gold/20 text-gold-light'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-gold/30'
                  "
                  [disabled]="preset > maxAffordableBits()"
                  (click)="selectedBits.set(preset)"
                >
                  {{ preset }}
                </button>
              }
            </div>
            <p class="text-center text-[10px] text-gray-400">
              1 Bit = +{{ bidIncrement() | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }} al precio ·
              Tu puja: <span class="font-semibold text-gold">+{{ priceStep() | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}</span>
            </p>
          </div>
        }

        <button
          type="button"
          class="btn-neon-primary animate-cta-pulse mt-auto w-full"
          [disabled]="isBidding() || !canAffordSelected()"
          (click)="onBid()"
        >
          @if (isBidding()) {
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-space-dark border-t-transparent"></span>
            Pujando...
          } @else {
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
            </svg>
            {{ ctaLabel() }}
          }
        </button>

        @if (isAuthenticated() && !canAffordSelected()) {
          <p class="text-center text-xs text-amber-300">No tienes suficientes Bits para esta puja.</p>
        }

        @if (errorMessage()) {
          <p class="text-center text-xs text-red-300">{{ errorMessage() }}</p>
        }
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionCardComponent {
  private readonly bidService = inject(BidService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ws = inject(WebsocketService);

  readonly auction = input.required<AuctionSummary>();
  readonly bidPlaced = output<number>();

  readonly bitPresets = BIT_PRESETS;
  readonly selectedBits = signal(1);
  readonly currentPrice = signal(0);
  readonly totalBids = signal(0);
  readonly lastBidder = signal<AuctionSummary['lastBidder']>(null);
  readonly isBidding = signal(false);
  readonly errorMessage = signal('');
  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly bidIncrement = computed(() => this.auction().bidIncrement || 0.2);

  readonly priceStep = computed(() => this.selectedBits() * this.bidIncrement());

  readonly maxAffordableBits = computed(() => this.authService.user()?.bit_balance ?? 0);

  readonly canAffordSelected = computed(() => this.selectedBits() <= this.maxAffordableBits());

  readonly imageUrl = computed(
    () =>
      this.auction().product.imageUrl ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop',
  );

  readonly retailValue = computed(() => this.auction().product.retailValue);

  readonly savingsAmount = computed(() => Math.max(0, this.retailValue() - this.currentPrice()));

  readonly discountPercent = computed(() => {
    const a = this.auction();
    if (a.discountPercent) return a.discountPercent;
    const retail = a.product.retailValue;
    if (retail <= 0) return 0;
    return Math.round((1 - this.currentPrice() / retail) * 100);
  });

  readonly isCurrentUserWinning = computed(() => {
    const user = this.authService.user();
    const bidder = this.lastBidder();
    return user && bidder && user.id === bidder.id;
  });

  readonly ctaLabel = computed(() => {
    const bits = this.selectedBits();
    if (!this.isAuthenticated()) return 'Entrar y pujar';
    if (this.isCurrentUserWinning()) return `Defiende · ${bits} Bit${bits > 1 ? 's' : ''}`;
    return `Pujar · ${bits} Bit${bits > 1 ? 's' : ''}`;
  });

  constructor() {
    this.ws.connect();

    effect((onCleanup) => {
      const a = this.auction();
      this.currentPrice.set(a.currentPrice);
      this.totalBids.set(a.totalBids);
      this.lastBidder.set(a.lastBidder);

      const balance = this.authService.user()?.bit_balance ?? 0;
      if (this.selectedBits() > balance && balance > 0) {
        const affordable = [...BIT_PRESETS].reverse().find((p) => p <= balance) ?? 1;
        this.selectedBits.set(affordable);
      }

      const bidSub = this.ws.onBidPlaced(a.id).subscribe((bid) => {
        this.currentPrice.set(bid.amount);
        this.totalBids.update((n) => n + 1);
        this.lastBidder.set({
          id: bid.id,
          name: bid.userName,
          avatarUrl: bid.userAvatarUrl,
        });
      });

      onCleanup(() => bidSub.unsubscribe());
    });
  }

  onBid(): void {
    if (!this.isAuthenticated()) {
      void this.router.navigate(['/register']);
      return;
    }

    if (this.isBidding() || !this.canAffordSelected()) return;

    this.isBidding.set(true);
    this.errorMessage.set('');
    const a = this.auction();
    const bitsCount = this.selectedBits();

    this.bidService.placeBid(a.id, bitsCount).subscribe({
      next: (response) => {
        const currentUser = this.authService.user();
        const userName = response.bid.user?.name ?? currentUser?.name ?? 'Usuario';
        const userId = response.bid.user?.id ?? currentUser?.id ?? 0;
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

        this.currentPrice.set(response.bid.amount);
        this.totalBids.update((n) => n + 1);
        this.lastBidder.set({ id: userId, name: userName, avatarUrl });
        this.authService.updateBitBalance(response.bit_balance);
        this.ws.emitBid({
          auctionId: a.id,
          bidId: response.bid.id,
          amount: response.bid.amount,
          user: { id: userId, name: userName, avatarUrl },
          placedAt: response.bid.bid_at,
          remainingSeconds: a.remainingSeconds,
        });
        this.isBidding.set(false);
        this.bidPlaced.emit(a.id);
      },
      error: (error) => {
        this.isBidding.set(false);
        this.errorMessage.set(
          error?.error?.message ??
            error?.error?.errors?.auction?.[0] ??
            error?.error?.errors?.balance?.[0] ??
            error?.error?.errors?.bits_count?.[0] ??
            'No se pudo realizar la puja.',
        );
      },
    });
  }
}
