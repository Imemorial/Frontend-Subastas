import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RecentWin } from '../../../core/auction/auction.service';

@Component({
  selector: 'app-recent-win-card',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="jackpot-card group flex w-full min-w-0 max-w-full flex-col overflow-hidden">
      <div class="relative aspect-[4/3] overflow-hidden">
        <img
          [src]="win().productImageUrl"
          [alt]="win().winnerName"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-space-dark via-space-dark/40 to-transparent"></div>

        <div class="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-gold-shine px-2.5 py-1 shadow-gold">
          <span class="text-sm">🏆</span>
          <span class="text-xs font-black uppercase tracking-wider text-space-dark">Ganador</span>
        </div>

        @if (win().discountPercent > 0) {
          <span
            class="absolute right-3 top-3 rounded-lg bg-neon-emerald/90 px-2.5 py-1 text-xs font-black text-space-dark shadow-neon-emerald"
          >
            -{{ win().discountPercent }}%
          </span>
        }

        <div class="absolute bottom-3 left-3 right-3">
          <p class="text-[9px] uppercase tracking-[0.25em] text-gold/80">Se lo llevó por</p>
          <p class="font-display text-3xl font-black text-white drop-shadow-lg">
            {{ win().finalPrice | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
          </p>
          <p class="price-anchor text-xs">
            {{ win().retailValue | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}
          </p>
        </div>
      </div>

      <div class="relative z-10 flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 class="line-clamp-2 font-display text-sm font-bold text-white">
            {{ win().productName }}
          </h3>
          <p class="mt-1 text-xs font-semibold text-gold">{{ win().winnerName }}</p>
        </div>

        @if (win().shortDescription) {
          <blockquote
            class="rounded-xl border border-gold/20 bg-gold/5 px-3 py-2.5 text-sm italic leading-snug text-gray-200"
          >
            "{{ win().shortDescription }}"
          </blockquote>
        }

        <div class="mt-auto flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
          <p class="text-[10px] uppercase tracking-wider text-gray-500">Ahorro real</p>
          <p class="font-display text-sm font-bold text-neon-emerald">
            {{ win().retailValue - win().finalPrice | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}
          </p>
        </div>
      </div>
    </article>
  `,
})
export class RecentWinCardComponent {
  readonly win = input.required<RecentWin>();
}
