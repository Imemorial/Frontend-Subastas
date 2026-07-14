import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { debounceTime } from 'rxjs';



import { AdminService } from '../../core/admin/admin.service';

import {

  AdminAuction,

  AdminProduct,

  MarginPreview,

  WeeklySchedulePlan,

} from '../../core/admin/admin-api.models';



@Component({

  selector: 'app-admin-auctions-page',

  standalone: true,

  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe],

  template: `

    <div class="space-y-6">

      <!-- Plan semanal -->

      @if (weeklyPlan(); as plan) {

        <section class="glass-card p-6">

          <div class="mb-4 flex flex-wrap items-start justify-between gap-4">

            <div>

              <h2 class="font-display text-xl font-bold text-white">Plan de la semana {{ plan.iso_week }}</h2>

              <p class="mt-1 text-sm text-gray-400">

                Objetivo de margen global: {{ plan.target_min_margin }}% – {{ plan.target_max_margin }}%

              </p>

            </div>

            <span

              class="rounded-full px-3 py-1 text-xs font-bold uppercase"

              [class]="plan.combined.is_within_target ? 'bg-neon-emerald/20 text-neon-emerald' : 'bg-amber-500/20 text-amber-200'"

            >

              {{ plan.combined.is_within_target ? 'Dentro del objetivo' : 'Fuera del objetivo' }}

            </span>

          </div>



          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Ganancia real (cerradas)</p>

              <p class="font-display text-2xl font-black text-neon-cyan">

                {{ plan.actual.metrics.net_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

              </p>

              <p class="text-xs text-gray-500">{{ plan.actual.metrics.auctions_ended }} subastas cerradas</p>

            </div>

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Ganancia prevista (programadas)</p>

              <p class="font-display text-2xl font-black text-gold">

                {{ scheduledProfit() | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

              </p>

              <p class="text-xs text-gray-500">{{ plan.scheduled.length }} subastas programadas</p>

            </div>

            <div class="rounded-xl border border-gold/30 bg-gold/5 p-4">

              <p class="text-xs uppercase tracking-wider text-gold/80">Ganancia total prevista</p>

              <p class="font-display text-2xl font-black text-gold-light">

                {{ plan.combined.net_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

              </p>

            </div>

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Margen semanal previsto</p>

              <p

                class="font-display text-2xl font-black"

                [class.text-neon-emerald]="plan.combined.is_within_target"

                [class.text-neon-magenta]="!plan.combined.is_within_target"

              >

                {{ plan.combined.margin_percent | number: '1.1-1' }}%

              </p>

            </div>

          </div>



          @if (plan.scheduled.length > 0) {

            <div class="mt-5 overflow-x-auto">

              <table class="w-full min-w-[640px] text-left text-sm">

                <thead class="text-xs uppercase tracking-wider text-gray-500">

                  <tr>

                    <th class="pb-2 pr-4">Producto</th>

                    <th class="pb-2 pr-4">Fecha</th>

                    <th class="pb-2 pr-4">Bits</th>

                    <th class="pb-2 pr-4">Ganancia prev.</th>

                    <th class="pb-2">Margen</th>

                  </tr>

                </thead>

                <tbody class="text-gray-300">

                  @for (item of plan.scheduled; track item.auction_id) {

                    <tr class="border-t border-white/[0.06]">

                      <td class="py-2.5 pr-4 font-medium text-white">{{ item.product_name }}</td>

                      <td class="py-2.5 pr-4">{{ item.scheduled_at | date: 'dd/MM HH:mm' : undefined : 'es' }}</td>

                      <td class="py-2.5 pr-4">{{ item.planned_bits }}</td>

                      <td class="py-2.5 pr-4 text-neon-emerald">

                        {{ item.projection.net_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                      </td>

                      <td class="py-2.5">{{ item.projection.margin_percent | number: '1.0-1' }}%</td>

                    </tr>

                  }

                </tbody>

              </table>

            </div>

          }

        </section>

      }



      <!-- Crear subasta -->

      <section class="glass-card p-6">

        <h2 class="mb-2 font-display text-xl font-bold text-white">Programar subasta</h2>

        <p class="mb-6 text-sm text-gray-400">

          Elige un producto y verás cuánto vas a ganar antes de publicarlo. El sistema respeta el margen del 17–25%.

        </p>



        <form class="grid gap-4 lg:grid-cols-2" [formGroup]="form" (ngSubmit)="submit()">

          <div class="lg:col-span-2">

            <label class="mb-2 block text-sm text-gray-300">Producto</label>

            @if (products().length === 0) {

              <p class="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-gray-400">

                No hay productos disponibles. Crea uno en la sección Productos.

              </p>

            } @else if (availableProducts().length === 0) {

              <p class="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-gray-400">

                Todos los productos publicados ya tienen una subasta activa o programada.

              </p>

            } @else {

              <div class="grid max-h-[28rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">

                @for (product of availableProducts(); track product.id) {

                  <button

                    type="button"

                    class="flex gap-3 rounded-xl border p-3 text-left transition hover:border-gold/40 hover:bg-white/[0.04]"

                    [class]="productCardClass(product.id)"

                    (click)="selectProduct(product)"

                  >

                    <img

                      [src]="productImage(product)"

                      [alt]="product.name"

                      class="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10"

                    />

                    <div class="min-w-0 flex-1">

                      <p class="truncate font-semibold text-white">{{ product.name }}</p>

                      <p class="mt-1 text-xs text-gray-400">

                        Coste / valor en tienda:

                        <span class="font-medium text-gray-200">

                          {{ product.real_cost | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                        </span>

                      </p>

                      <span

                        class="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"

                        [class]="productStatusClass(product.status)"

                      >

                        {{ product.status }}

                      </span>

                    </div>

                  </button>

                }

              </div>

            }

            @if (form.controls.product_id.invalid && form.controls.product_id.touched) {

              <p class="mt-2 text-xs text-amber-300">Selecciona un producto para continuar.</p>

            }

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Bits planificados</label>

            <input

              type="number"

              formControlName="planned_bits"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Precio de cierre objetivo (€)</label>

            <input

              type="number"

              step="0.01"

              formControlName="planned_closing_price"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Precio de salida (€)</label>

            <input

              type="number"

              step="0.01"

              formControlName="starting_price"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Incremento por puja (€)</label>

            <input

              type="number"

              step="0.01"

              formControlName="bid_increment"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Timer inicial (seg)</label>

            <input

              type="number"

              formControlName="initial_timer_seconds"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

          </div>



          <div class="lg:col-span-2">

            <label class="mb-2 block text-sm text-gray-300">Fecha y hora programada</label>

            <input

              type="datetime-local"

              formControlName="scheduled_at"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

          </div>



          <label class="flex items-center gap-3 lg:col-span-2">

            <input type="checkbox" formControlName="start_immediately" class="rounded" />

            <span class="text-sm text-gray-300">Activar inmediatamente (sin programar)</span>

          </label>



          @if (auctionPreview(); as preview) {

            <div class="lg:col-span-2 rounded-xl border border-neon-emerald/30 bg-neon-emerald/5 p-4">

              <p class="mb-3 text-xs font-bold uppercase tracking-wider text-neon-emerald">

                Previsión de esta subasta

              </p>

              <div class="grid gap-3 sm:grid-cols-3">

                <div>

                  <p class="text-[10px] uppercase text-gray-500">Ingresos previstos</p>

                  <p class="font-display text-xl font-bold text-white">

                    {{ preview.strategy.projected_revenue | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                  </p>

                </div>

                <div>

                  <p class="text-[10px] uppercase text-gray-500">Tu ganancia</p>

                  <p class="font-display text-xl font-bold text-neon-emerald">

                    {{ preview.strategy.projected_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                  </p>

                </div>

                <div>

                  <p class="text-[10px] uppercase text-gray-500">Margen</p>

                  <p

                    class="font-display text-xl font-bold"

                    [class.text-neon-emerald]="isMarginOk(preview)"

                    [class.text-amber-300]="!isMarginOk(preview)"

                  >

                    {{ preview.strategy.projected_margin_percent | number: '1.0-1' }}%

                  </p>

                </div>

              </div>

              @if (!isMarginOk(preview) && preview.strategy.product_role !== 'attractor') {

                <p class="mt-3 text-xs text-amber-200">

                  Ajusta bits o precio de cierre para acercarte al rango 17–25%.

                </p>

              }

            </div>

          }



          @if (successMessage()) {

            <p class="lg:col-span-2 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm text-neon-emerald">

              {{ successMessage() }}

            </p>

          }

          @if (errorMessage()) {

            <p class="lg:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">

              {{ errorMessage() }}

            </p>

          }



          <button

            type="submit"

            class="btn-neon-primary py-3 lg:col-span-2"

            [disabled]="form.invalid || submitting()"

          >

            {{ submitting() ? 'Programando...' : 'Programar subasta' }}

          </button>

        </form>

      </section>



      <!-- Listado -->

      <section class="glass-card p-6">

        <h2 class="mb-6 font-display text-xl font-bold text-white">Subastas ({{ auctions().length }})</h2>



        @if (auctions().length === 0) {

          <p class="text-sm text-gray-400">No hay subastas. Programa una arriba.</p>

        } @else {

          <div class="space-y-4">

            @for (auction of auctions(); track auction.id) {

              <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">

                <div class="flex flex-wrap items-start justify-between gap-4">

                  <div class="flex min-w-0 flex-1 gap-4">

                    <img

                      [src]="auctionProductImage(auction)"

                      [alt]="auctionProductName(auction)"

                      class="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10"

                    />

                    <div class="min-w-0">

                      <p class="truncate font-semibold text-white">{{ auctionProductName(auction) }}</p>

                      <p class="text-sm text-gray-400">

                        Precio: {{ auction.current_price | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                        · {{ auction.total_bids }} pujas

                      </p>

                      @if (auction.scheduled_at && auction.status === 'scheduled') {

                        <p class="mt-1 text-xs text-neon-cyan">

                          Programada: {{ auction.scheduled_at | date: 'dd/MM/yyyy HH:mm' : undefined : 'es' }}

                        </p>

                      }

                      @if (auction.status === 'active' && auction.ends_at) {

                        <p class="mt-1 text-xs text-neon-emerald">

                          En directo · termina {{ auction.ends_at | date: 'dd/MM HH:mm' : undefined : 'es' }}

                        </p>

                      }

                      <div class="mt-2 flex flex-wrap gap-2">

                        <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" [class]="statusClass(auction.status)">

                          {{ auction.status }}

                        </span>

                      </div>

                    </div>

                  </div>



                  <div class="flex flex-wrap gap-2">

                    @if (auction.status === 'scheduled' || auction.status === 'draft') {

                      <button type="button" class="btn-neon-primary px-3 py-1.5 text-xs" (click)="activate(auction)">

                        Activar

                      </button>

                    }

                    @if (auction.status === 'active') {

                      <button type="button" class="rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs text-amber-200" (click)="pause(auction)">

                        Pausar

                      </button>

                    }

                    @if (auction.status === 'paused') {

                      <button type="button" class="rounded-lg border border-neon-cyan/30 px-3 py-1.5 text-xs text-neon-cyan" (click)="resume(auction)">

                        Reanudar

                      </button>

                    }

                    <button type="button" class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300" (click)="loadMargin(auction.id)">

                      Ver margen

                    </button>

                  </div>

                </div>



                @if (expandedMarginId() === auction.id && marginData(); as margin) {

                  <div class="mt-4 grid gap-3 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4 sm:grid-cols-2">

                    <div>

                      <p class="text-xs uppercase tracking-wider text-gray-500">Margen actual</p>

                      <p class="font-display text-2xl font-bold text-neon-emerald">

                        {{ margin.evaluation.margin_percent | number: '1.1-1' }}%

                      </p>

                    </div>

                    <div>

                      <p class="text-xs uppercase tracking-wider text-gray-500">Beneficio actual</p>

                      <p class="font-display text-2xl font-bold text-white">

                        {{ margin.evaluation.net_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                      </p>

                    </div>

                  </div>

                }

              </div>

            }

          </div>

        }

      </section>

    </div>

  `,

})

export class AdminAuctionsPageComponent implements OnInit {

  private readonly adminService = inject(AdminService);

  private readonly formBuilder = inject(FormBuilder);



  readonly products = signal<AdminProduct[]>([]);

  readonly auctions = signal<AdminAuction[]>([]);

  readonly weeklyPlan = signal<WeeklySchedulePlan | null>(null);

  readonly auctionPreview = signal<MarginPreview | null>(null);

  readonly submitting = signal(false);

  readonly successMessage = signal('');

  readonly errorMessage = signal('');

  readonly expandedMarginId = signal<number | null>(null);

  readonly marginData = signal<{

    evaluation: import('../../core/admin/admin-api.models').MarginEvaluation;

    closing_range: MarginPreview;

  } | null>(null);



  readonly scheduledProfit = computed(() =>

    (this.weeklyPlan()?.scheduled ?? []).reduce((sum, item) => sum + item.projection.net_profit, 0),

  );



  readonly availableProducts = computed(() => {
    const busyProductIds = new Set(
      this.auctions()
        .filter((auction) => ['active', 'scheduled', 'paused', 'draft'].includes(auction.status))
        .map((auction) => auction.product?.id)
        .filter((id): id is number => id != null),
    );

    return this.products().filter(
      (product) => product.status !== 'archived' && !busyProductIds.has(product.id),
    );
  });



  readonly form = this.formBuilder.nonNullable.group({

    product_id: ['', Validators.required],

    planned_bits: [500, [Validators.min(0)]],

    planned_closing_price: [0, [Validators.min(0)]],

    starting_price: [0, [Validators.min(0)]],

    bid_increment: [0.2, [Validators.min(0.01)]],

    initial_timer_seconds: [15, [Validators.min(5), Validators.max(120)]],

    min_margin_percent: [17, [Validators.min(10), Validators.max(30)]],

    max_margin_percent: [25, [Validators.min(15), Validators.max(40)]],

    scheduled_at: [''],

    start_immediately: [false],

  });



  ngOnInit(): void {

    this.loadProducts();

    this.loadAuctions();

    this.loadWeeklyPlan();



    this.form.valueChanges.pipe(debounceTime(300)).subscribe(() => this.updateAuctionPreview());



    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    tomorrow.setHours(10, 0, 0, 0);

    this.form.controls.scheduled_at.setValue(this.toDatetimeLocal(tomorrow));

  }



  onProductChange(): void {

    const productId = Number(this.form.controls.product_id.value);

    const product = this.products().find((p) => p.id === productId);

    if (!product) return;



    const strategy = product.metadata?.strategy;

    if (strategy) {

      this.form.patchValue({

        planned_bits: product.metadata?.estimated_bits ?? strategy.recommended_bits_target,

        planned_closing_price: strategy.recommended_customer_price_target,

        starting_price: strategy.recommended_starting_price,

        bid_increment: strategy.suggested_bid_increment,

      }, { emitEvent: true });

    } else {

      this.adminService.previewMargin({ real_cost: product.real_cost }).subscribe({

        next: (preview) => {

          this.form.patchValue({

            planned_bits: preview.strategy.recommended_bits_target,

            planned_closing_price: preview.strategy.recommended_customer_price_target,

            starting_price: preview.strategy.recommended_starting_price,

            bid_increment: preview.strategy.suggested_bid_increment,

          }, { emitEvent: true });

        },

      });

    }

  }



  selectProduct(product: AdminProduct): void {

    this.form.controls.product_id.setValue(String(product.id));

    this.form.controls.product_id.markAsTouched();

    this.onProductChange();

  }



  isProductSelected(productId: number): boolean {

    return Number(this.form.controls.product_id.value) === productId;

  }



  productCardClass(productId: number): string {

    return this.isProductSelected(productId)

      ? 'border-gold bg-gold/10 ring-1 ring-gold/30'

      : 'border-white/10 bg-white/[0.02]';

  }



  productImage(product: AdminProduct): string {

    return (

      product.image_urls[0] ??

      product.image_url ??

      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=128&h=128&fit=crop'

    );

  }



  productStatusClass(status: AdminProduct['status']): string {

    if (status === 'published') return 'bg-neon-emerald/20 text-neon-emerald';

    if (status === 'draft') return 'bg-gray-500/20 text-gray-300';

    return 'bg-amber-500/20 text-amber-200';

  }



  auctionProductName(auction: AdminAuction): string {

    return auction.product?.name ?? 'Producto no disponible';

  }



  auctionProductImage(auction: AdminAuction): string {

    const product = auction.product;

    if (!product) {

      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=128&h=128&fit=crop';

    }

    return this.productImage(product);

  }



  isMarginOk(preview: MarginPreview): boolean {

    const margin = preview.strategy.projected_margin_percent ?? 0;

    if (preview.strategy.product_role === 'attractor') return true;

    return margin >= 17 && margin <= 25;

  }



  submit(): void {

    if (this.form.invalid || this.submitting()) return;

    const raw = this.form.getRawValue();

    if (!raw.start_immediately && !raw.scheduled_at) {

      this.errorMessage.set('Indica fecha y hora si no activas inmediatamente.');

      return;

    }



    this.submitting.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');



    this.adminService

      .createAuction({

        product_id: Number(raw.product_id),

        planned_bits: raw.planned_bits,

        planned_closing_price: raw.planned_closing_price,

        starting_price: raw.starting_price,

        bid_increment: raw.bid_increment,

        initial_timer_seconds: raw.initial_timer_seconds,

        min_margin_percent: raw.min_margin_percent,

        max_margin_percent: raw.max_margin_percent,

        start_immediately: raw.start_immediately,

        scheduled_at:

          !raw.start_immediately && raw.scheduled_at

            ? new Date(raw.scheduled_at).toISOString()

            : undefined,

      })

      .subscribe({

        next: () => {

          this.submitting.set(false);

          this.successMessage.set('Subasta programada. Revisa el plan semanal arriba.');

          this.loadAuctions();

          this.loadWeeklyPlan();

        },

        error: (err) => {

          this.submitting.set(false);

          this.errorMessage.set(err?.error?.message ?? 'Error al crear la subasta.');

        },

      });

  }



  activate(auction: AdminAuction): void {

    this.adminService.activateAuction(auction.id).subscribe({ next: () => this.loadAuctions() });

  }



  pause(auction: AdminAuction): void {

    this.adminService.pauseAuction(auction.id).subscribe({ next: () => this.loadAuctions() });

  }



  resume(auction: AdminAuction): void {

    this.adminService.resumeAuction(auction.id).subscribe({ next: () => this.loadAuctions() });

  }



  loadMargin(id: number): void {

    if (this.expandedMarginId() === id) {

      this.expandedMarginId.set(null);

      return;

    }

    this.expandedMarginId.set(id);

    this.adminService.getAuctionMargin(id).subscribe({

      next: (data) => this.marginData.set(data),

    });

  }



  statusClass(status: string): string {

    if (status === 'active') return 'bg-neon-emerald/20 text-neon-emerald';

    if (status === 'scheduled') return 'bg-neon-cyan/20 text-neon-cyan';

    if (status === 'paused') return 'bg-amber-500/20 text-amber-300';

    return 'bg-gray-500/20 text-gray-300';

  }



  private loadProducts(): void {

    this.adminService.getProducts().subscribe({

      next: (products) => {

        this.products.set(products);

        this.syncSelectedProduct();

      },

    });

  }



  private loadAuctions(): void {

    this.adminService.getAuctions().subscribe({

      next: (auctions) => {

        this.auctions.set(auctions);

        this.syncSelectedProduct();

      },

    });

  }



  private syncSelectedProduct(): void {

    const selectedId = Number(this.form.controls.product_id.value);

    if (!selectedId) {

      return;

    }

    if (!this.availableProducts().some((product) => product.id === selectedId)) {

      this.form.controls.product_id.setValue('');

      this.auctionPreview.set(null);

    }

  }



  private loadWeeklyPlan(): void {

    this.adminService.getWeeklySchedule().subscribe({

      next: (plan) => this.weeklyPlan.set(plan),

    });

  }



  private updateAuctionPreview(): void {

    const productId = Number(this.form.controls.product_id.value);

    const product = this.products().find((p) => p.id === productId);

    if (!product) {

      this.auctionPreview.set(null);

      return;

    }



    this.adminService

      .previewMargin({

        real_cost: product.real_cost,

        bits_consumed: this.form.controls.planned_bits.value,

        min_margin_percent: 17,

        max_margin_percent: 25,

      })

      .subscribe({

        next: (preview) => {

          const closing = this.form.controls.planned_closing_price.value;

          const bits = this.form.controls.planned_bits.value;

          const bitRevenue = bits * preview.bit_value_eur;

          const totalRevenue = bitRevenue + closing;

          const profit = totalRevenue - product.real_cost;

          const margin = product.real_cost > 0 ? (profit / product.real_cost) * 100 : 0;



          this.auctionPreview.set({

            ...preview,

            strategy: {

              ...preview.strategy,

              projected_revenue: totalRevenue,

              projected_profit: profit,

              projected_margin_percent: margin,

            },

          });

        },

      });

  }



  private toDatetimeLocal(date: Date): string {

    const pad = (n: number): string => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

  }

}


