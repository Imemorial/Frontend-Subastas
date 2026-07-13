import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { WebsocketService } from '../../../core/websocket/websocket.service';
import { LiveBid } from '../../models/bid.model';

const MAX_VISIBLE_BIDS = 5;

@Component({
  selector: 'app-live-bid-history',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  animations: [
    trigger('bidEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-16px) scale(0.96)' }),
        animate(
          '400ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
    ]),
  ],
  template: `
    <section class="glass-card flex flex-col" aria-label="Historial de pujas en vivo">
      <header class="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <h3 class="font-display text-sm font-semibold uppercase tracking-wider text-gray-300">
          Pujas en vivo
        </h3>
        <span class="flex items-center gap-1.5 text-xs text-neon-emerald">
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-emerald opacity-75"
            ></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-neon-emerald"></span>
          </span>
          LIVE
        </span>
      </header>

      <ul class="scrollbar-thin max-h-72 space-y-1 overflow-y-auto p-2" role="list">
        @for (bid of bids(); track bid.id) {
          <li
            @bidEnter
            class="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-neon-cyan/20 hover:bg-neon-cyan/[0.03]"
          >
            <img
              [src]="bid.userAvatarUrl"
              [alt]="bid.userName"
              width="36"
              height="36"
              class="shrink-0 rounded-full ring-2 ring-white/10"
              loading="lazy"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white">{{ bid.userName }}</p>
              <p class="text-xs text-gray-500">
                {{ bid.placedAt | date: 'HH:mm:ss' }}
              </p>
            </div>
            <span class="shrink-0 font-display text-sm font-bold text-neon-emerald">
              {{ bid.amount | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
            </span>
          </li>
        } @empty {
          <li class="px-4 py-8 text-center text-sm text-gray-500">
            Esperando pujas...
          </li>
        }
      </ul>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveBidHistoryComponent {
  private readonly ws = inject(WebsocketService);

  readonly auctionId = input.required<number>();
  readonly initialBids = input<LiveBid[]>([]);

  readonly bids = signal<LiveBid[]>([]);

  constructor() {
    effect((onCleanup) => {
      const initial = this.initialBids();
      if (initial.length > 0) {
        this.bids.set(initial.slice(0, MAX_VISIBLE_BIDS));
      }

      const auctionId = this.auctionId();
      const sub = this.ws.onBidPlaced(auctionId).subscribe((bid) => {
        this.bids.update((current) => [bid, ...current].slice(0, MAX_VISIBLE_BIDS));
      });

      onCleanup(() => sub.unsubscribe());
    });
  }
}
