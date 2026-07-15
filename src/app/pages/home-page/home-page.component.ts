import { CurrencyPipe, DatePipe } from '@angular/common';

import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';



import { AuctionService, RecentWin, UpcomingAuction } from '../../core/auction/auction.service';

import { AuthService } from '../../core/auth/auth.service';

import { AuctionCardComponent } from '../../shared/components/auction-card/auction-card.component';

import { RecentWinCardComponent } from '../../shared/components/recent-win-card/recent-win-card.component';

import { AuctionSummary } from '../../shared/models/auction.model';



@Component({

  selector: 'app-home-page',

  standalone: true,

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [

    AuctionCardComponent,

    RecentWinCardComponent,

    CurrencyPipe,

    DatePipe,

    RouterLink,

  ],

  template: `

    <main class="page-content w-full min-w-0">

      <!-- HERO -->

      <section class="relative w-full min-w-0 overflow-hidden border-b border-gold/10">

        <div class="section-glow"></div>

        <div

          class="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-gold/8 blur-3xl sm:-right-32 sm:h-96 sm:w-96"

        ></div>

        <div

          class="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-neon-magenta/8 blur-3xl sm:-left-20 sm:h-72 sm:w-72"

        ></div>



        <div class="relative mx-auto grid w-full min-w-0 max-w-7xl gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:items-center lg:py-20">

          <div class="text-center lg:text-left">

            <div

              class="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 sm:px-4"

            >

              <span class="relative flex h-2 w-2">

                <span

                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"

                ></span>

                <span class="relative inline-flex h-2 w-2 rounded-full bg-gold"></span>

              </span>

              <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-gold sm:text-xs sm:tracking-[0.2em]">

                @if (initialLoadComplete()) {

                  {{ activeCount() }} subastas en juego ahora

                } @else {

                  Cargando subastas...

                }

              </span>

            </div>



            <h1 class="mx-auto mb-5 max-w-xl font-display text-3xl font-black leading-[1.1] text-white sm:text-5xl lg:mx-0 lg:max-w-none lg:text-6xl">

              Tecnología premium.

              <span class="text-gradient-neon">Precios de locura.</span>

            </h1>



            <p class="mx-auto mb-6 max-w-xl text-sm text-gray-400 sm:text-base lg:mx-0 lg:text-lg">

              Compite en tiempo real, gana productos de cientos de euros y siente la adrenalina de una

              subasta en directo — sin salir de casa.

            </p>



            <div class="mb-8 flex flex-wrap justify-center gap-3 lg:justify-start">

              @if (isAuthenticated()) {

                <a href="#activas" class="btn-neon-primary animate-cta-pulse w-full px-6 py-3.5 text-sm sm:w-auto">

                  Ir a las subastas

                </a>

              } @else {

                <a routerLink="/register" class="btn-neon-primary animate-cta-pulse w-full px-6 py-3.5 text-sm sm:w-auto">

                  Empezar a jugar — es gratis

                </a>

                <a

                  routerLink="/login"

                  class="w-full rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-gray-200 transition hover:border-gold/30 hover:text-gold-light sm:w-auto"

                >

                  Ya tengo cuenta

                </a>

              }

            </div>



            <div class="mx-auto grid w-full grid-cols-3 gap-2 sm:max-w-lg sm:gap-3 lg:mx-0">

              <div class="stat-pill">

                <p class="stat-pill-value text-gold">{{ activeCount() }}</p>

                <p class="stat-pill-label">En juego</p>

              </div>

              <div class="stat-pill">

                <p class="stat-pill-value break-words text-neon-emerald text-sm sm:text-2xl">{{ totalSavings() | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}</p>

                <p class="stat-pill-label">Ahorrado hoy</p>

              </div>

              <div class="stat-pill">

                <p class="stat-pill-value text-neon-cyan">{{ recentWins().length }}</p>

                <p class="stat-pill-label">Ganadores</p>

              </div>

            </div>

          </div>



          @if (featured(); as spotlight) {

            <div class="neon-border-gradient mx-auto w-full lg:mx-0">

              <div class="inner overflow-hidden">

                <div class="relative aspect-[4/3]">

                  <img

                    [src]="spotlight.product.imageUrl"

                    [alt]="spotlight.product.name"

                    class="h-full w-full object-cover transition duration-700 hover:scale-105"

                  />

                  <div class="absolute inset-0 bg-gradient-to-t from-space-dark via-space-dark/20 to-transparent"></div>



                  <span

                    class="absolute left-4 top-4 flex items-center gap-1.5 rounded-xl bg-gold-shine px-3 py-1.5 text-sm font-black text-space-dark shadow-gold"

                  >

                    ⭐ DESTACADA

                  </span>



                  @if (spotlight.discountPercent) {

                    <span

                      class="absolute right-4 top-4 rounded-xl bg-gradient-to-r from-casino-red to-casino-red-dim px-3 py-1.5 text-sm font-black text-white"

                    >

                      -{{ spotlight.discountPercent }}% OFF

                    </span>

                  }

                </div>



                <div class="space-y-4 p-4 sm:p-6">

                  <div>

                    <p class="mb-1 text-[9px] uppercase tracking-[0.3em] text-gold/70">Oportunidad del momento</p>

                    <h2 class="font-display text-xl font-black text-white sm:text-2xl">{{ spotlight.product.name }}</h2>

                    <p class="mt-1 text-sm text-gray-500">

                      Valor real:

                      <span class="price-anchor">{{ spotlight.product.retailValue | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}</span>

                    </p>

                  </div>



                  <div

                    class="rounded-2xl border border-gold/25 bg-gradient-to-b from-gold/10 to-transparent px-5 py-5 text-center"

                  >

                    <p class="text-[9px] uppercase tracking-[0.3em] text-gold/80">Subasta en juego</p>

                    <p class="mt-2 font-display text-3xl font-black text-white sm:text-4xl">

                      {{ spotlight.totalBids }}

                    </p>

                    <p class="mt-1 text-xs text-gray-400">

                      pujas en esta ronda · La competencia está encendida

                    </p>

                  </div>



                  <div class="flex items-end justify-between gap-4">

                    <div>

                      <p class="text-[9px] uppercase tracking-wider text-gray-500">Precio ahora</p>

                      <p class="font-display text-3xl font-black text-neon-emerald sm:text-4xl">

                        {{ spotlight.currentPrice | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                      </p>

                    </div>

                    <div class="text-right">

                      <p class="text-[9px] uppercase tracking-wider text-gray-500">Competidores</p>

                      <p class="font-display text-2xl font-bold text-neon-cyan">{{ spotlight.totalBids }}</p>

                    </div>

                  </div>



                  <button type="button" class="btn-neon-primary w-full animate-cta-pulse py-4 text-base" (click)="handleBid()">

                    {{ isAuthenticated() ? '⚡ PUJAR AHORA' : '🎯 REGÍSTRATE Y PUJA' }}

                  </button>

                  <p class="text-center text-[10px] text-gray-500">

                    La mesa está abierta. ¿Te unes?

                  </p>

                </div>

              </div>

            </div>

          } @else if (loading() && !initialLoadComplete()) {

            <div

              class="flex min-h-[320px] animate-pulse items-center justify-center rounded-2xl border border-gold/10 bg-white/5 p-8"

            >

              <div class="w-full max-w-sm space-y-4">

                <div class="mx-auto h-40 rounded-xl bg-white/10"></div>

                <div class="h-4 rounded bg-white/10"></div>

                <div class="h-4 w-2/3 rounded bg-white/10"></div>

                <div class="h-12 rounded-xl bg-gold/20"></div>

              </div>

            </div>

          } @else if (!featured() && initialLoadComplete()) {

            <div

              class="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gold/20 bg-gold/5 p-8 text-center"

            >

              <div>

                <p class="text-4xl">🎰</p>

                <p class="mt-3 font-display text-lg font-bold text-gray-300">Próxima ronda en camino</p>

                <p class="mt-2 text-sm text-gray-500">

                  Las subastas se activan en directo. Vuelve en unos minutos.

                </p>

              </div>

            </div>

          }

        </div>

      </section>



      <!-- ÚLTIMAS VICTORIAS -->

      <section class="w-full min-w-0 border-b border-white/[0.04] bg-space-velvet/50">

        <div class="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-6">

          <div class="mb-8 text-center">

            <p class="mb-2 text-xs uppercase tracking-[0.35em] text-gold">Ganadores recientes</p>

            <h2 class="font-display text-2xl font-black text-white sm:text-3xl">

              Ellos lo consiguieron. <span class="text-gradient-gold">¿Y tú?</span>

            </h2>

            <p class="mx-auto mt-2 max-w-xl text-sm text-gray-400">

              Mira lo que otros jugadores se han llevado por una fracción del precio de tienda.

            </p>

          </div>



          @if (recentWins().length > 0) {

            <div class="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

              @for (win of recentWins(); track win.id) {

                <app-recent-win-card [win]="win" />

              }

            </div>

          } @else if (!loading()) {

            <div

              class="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center"

            >

              <p class="text-sm text-gray-400">Sé el primero en ganar. Las subastas están activas.</p>

            </div>

          }

        </div>

      </section>



      <!-- SUBASTAS ACTIVAS -->

      <section id="activas" class="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-6">

        <div class="mb-8 text-center sm:text-left">

          <div class="mx-auto sm:mx-0">

            <div class="mb-2 flex items-center justify-center gap-2 sm:justify-start">

              <span class="relative flex h-2.5 w-2.5">

                <span

                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-casino-red opacity-75"

                ></span>

                <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-casino-red"></span>

              </span>

              <p class="text-xs font-bold uppercase tracking-[0.35em] text-casino-red">En directo</p>

            </div>

            <h2 class="font-display text-2xl font-black text-white sm:text-3xl">Mesa de subastas</h2>

            <p class="mt-1 text-sm text-gray-400">Elige tu premio. Cada puja te acerca más a ganar.</p>

          </div>

        </div>



        @if (loading()) {

          <div class="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            @for (i of [1, 2, 3]; track i) {

              <div class="glass-card h-[480px] animate-pulse rounded-2xl"></div>

            }

          </div>

        } @else if (activeAuctions().length > 0) {

          <div class="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            @for (auction of activeAuctions(); track auction.id) {

              <app-auction-card [auction]="auction" />

            }

          </div>

        } @else {

          <div

            class="rounded-2xl border border-dashed border-gold/20 bg-gold/5 px-6 py-14 text-center"

          >

            <p class="text-4xl">⏳</p>

            <p class="mt-3 font-display text-lg font-bold text-white">La mesa está vacía... por ahora</p>

            <p class="mx-auto mt-2 max-w-md text-sm text-gray-400">

              Nuevas subastas en camino. Activa las notificaciones y no te pierdas la próxima oportunidad.

            </p>

          </div>

        }



        @if (loadError()) {

          <p class="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">

            {{ loadError() }}

          </p>

        }

      </section>



      <!-- PROXIMAMENTE -->

      <section class="border-t border-white/[0.04] bg-space-velvet/30">

        <div class="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">

          <div class="mb-8 text-center sm:text-left">

            <div class="mx-auto sm:mx-0">

              <p class="mb-2 text-xs uppercase tracking-[0.35em] text-neon-cyan">Próximamente</p>

              <h2 class="font-display text-2xl font-bold text-white sm:text-3xl">

                Lo que viene en la mesa

              </h2>

              <p class="mx-auto mt-2 max-w-2xl text-sm text-gray-400 sm:mx-0">

                Prepárate. Estos productos entran en juego pronto — los primeros en pujar tienen ventaja.

              </p>

            </div>

          </div>



          @if (upcomingAuctions().length > 0) {

            <div class="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

              @for (auction of upcomingAuctions(); track auction.id) {

                <article class="glass-card w-full min-w-0 overflow-hidden transition hover:-translate-y-1 hover:border-gold/20">

                  <div class="relative">

                    <img

                      [src]="auction.productImageUrl"

                      [alt]="auction.productName"

                      class="aspect-[4/3] w-full object-cover"

                    />

                    <div class="absolute inset-0 bg-gradient-to-t from-space-dark/80 to-transparent"></div>

                    <span class="absolute left-3 top-3 rounded-lg bg-neon-cyan/90 px-2 py-1 text-[10px] font-bold uppercase text-space-dark">

                      Próximamente

                    </span>

                  </div>

                  <div class="space-y-3 p-4">

                    <h3 class="line-clamp-2 font-display text-base font-bold text-white">

                      {{ auction.productName }}

                    </h3>

                    <p class="text-sm text-gray-400">

                      Valor en tienda:

                      <span class="font-bold text-gold">

                        {{ auction.retailValue | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}

                      </span>

                    </p>

                    @if (auction.scheduledAt) {

                      <div class="rounded-xl border border-neon-magenta/20 bg-neon-magenta/5 px-4 py-3">

                        <p class="text-[9px] uppercase tracking-[0.25em] text-neon-magenta">

                          Abre el

                        </p>

                        <p class="mt-1 font-display text-lg font-bold text-white">

                          {{ auction.scheduledAt | date: 'dd MMM · HH:mm' : undefined : 'es' }}

                        </p>

                      </div>

                    }

                  </div>

                </article>

              }

            </div>

          } @else if (!loading()) {

            <div

              class="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center"

            >

              <p class="text-sm text-gray-400">Nuevos productos en camino. Estate atento.</p>

            </div>

          }

        </div>

      </section>



      <!-- CTA final -->

      @if (!isAuthenticated()) {

        <section class="border-t border-gold/10 bg-gradient-to-b from-gold/5 to-transparent">

          <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">

            <p class="text-5xl">🎲</p>

            <h2 class="mt-4 font-display text-3xl font-black text-white sm:text-4xl">

              ¿Listo para <span class="text-gradient-gold">ganar</span>?

            </h2>

            <p class="mx-auto mt-4 max-w-lg text-gray-400">

              Regístrate en 30 segundos. Recibe fichas de bienvenida y empieza a pujar en las

              subastas que están en juego ahora mismo.

            </p>

            <a routerLink="/register" class="btn-neon-primary mt-8 inline-flex animate-cta-pulse px-10 py-4 text-base">

              Crear cuenta gratis

            </a>

          </div>

        </section>

      }

    </main>

  `,

})

export class HomePageComponent implements OnInit, OnDestroy {

  private readonly auctionService = inject(AuctionService);

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  private refreshInterval?: ReturnType<typeof setInterval>;

  private staticRefreshInterval?: ReturnType<typeof setInterval>;

  private visibilityHandler = (): void => {
    if (document.visibilityState === 'visible') {
      this.refreshActiveAuctions();
    }
  };



  readonly activeAuctions = signal<AuctionSummary[]>([]);

  readonly recentWins = signal<RecentWin[]>([]);

  readonly upcomingAuctions = signal<UpcomingAuction[]>([]);

  readonly loading = signal(true);

  readonly initialLoadComplete = signal(false);

  readonly loadError = signal('');

  readonly isAuthenticated = this.authService.isAuthenticated;



  readonly featured = computed(() => this.activeAuctions()[0] ?? null);

  readonly activeCount = computed(() => this.activeAuctions().length);



  readonly totalSavings = computed(() =>

    this.recentWins().reduce(

      (sum, win) => sum + Math.max(0, win.retailValue - win.finalPrice),

      0,

    ),

  );



  ngOnInit(): void {

    this.loadHomeData(true);

    this.refreshInterval = setInterval(() => this.refreshActiveAuctions(), 12000);

    this.staticRefreshInterval = setInterval(() => this.refreshStaticSections(), 90000);

    document.addEventListener('visibilitychange', this.visibilityHandler);

  }



  ngOnDestroy(): void {

    if (this.refreshInterval) {

      clearInterval(this.refreshInterval);

    }

    if (this.staticRefreshInterval) {

      clearInterval(this.staticRefreshInterval);

    }

    document.removeEventListener('visibilitychange', this.visibilityHandler);

  }



  handleBid(): void {

    if (!this.isAuthenticated()) {

      void this.router.navigate(['/register']);

      return;

    }



    document.getElementById('activas')?.scrollIntoView({ behavior: 'smooth' });

  }



  private loadHomeData(showLoading = true): void {

    if (showLoading) {

      this.loading.set(true);

      this.loadError.set('');

    }



    this.auctionService.getHomeData().subscribe({

      next: (data) => {

        this.activeAuctions.set(data.active);

        this.recentWins.set(data.winners);

        this.upcomingAuctions.set(data.upcoming);

        this.initialLoadComplete.set(true);

        this.loadError.set('');

        if (showLoading) {

          this.loading.set(false);

        }

      },

      error: () => {

        if (!this.initialLoadComplete()) {

          this.loadError.set('No se pudieron cargar las subastas activas.');

        }

        if (showLoading) {

          this.loading.set(false);

        }

      },

    });

  }



  private refreshActiveAuctions(): void {

    if (document.visibilityState === 'hidden') {

      return;

    }



    this.auctionService.getActiveAuctions().subscribe({

      next: (auctions) => {

        this.activeAuctions.update((current) => this.auctionService.mergeActiveAuctions(current, auctions));

      },

    });

  }



  private refreshStaticSections(): void {

    if (document.visibilityState === 'hidden') {

      return;

    }



    this.auctionService.invalidateHomeWinnersCache();

    this.auctionService.getHomeWinners(true).subscribe({

      next: (wins) => this.recentWins.set(wins),

    });



    this.auctionService.getUpcomingAuctions().subscribe({

      next: (auctions) => this.upcomingAuctions.set(auctions),

    });

  }

}


