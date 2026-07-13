import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { Component, inject, OnInit, signal } from '@angular/core';



import { AdminService } from '../../core/admin/admin.service';

import { WeeklyMarginReport, WeeklySchedulePlan } from '../../core/admin/admin-api.models';



@Component({

  selector: 'app-admin-dashboard-page',

  standalone: true,

  imports: [CurrencyPipe, DecimalPipe],

  template: `

    <div class="space-y-6">

      <section class="glass-card p-6">

        <div class="mb-6 flex flex-wrap items-start justify-between gap-4">

          <div>

            <h2 class="font-display text-xl font-bold text-white">Margen semanal</h2>

            <p class="mt-1 text-sm text-gray-400">

              Objetivo global: {{ report()?.target_min_margin ?? 17 }}% – {{ report()?.target_max_margin ?? 25 }}%

            </p>

          </div>

          <button

            type="button"

            class="btn-neon-primary px-4 py-2 text-sm"

            [disabled]="balancing()"

            (click)="runBalance()"

          >

            {{ balancing() ? 'Aplicando...' : 'Ajustar subastas activas' }}

          </button>

        </div>



        @if (report(); as r) {

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Margen real</p>

              <p

                class="font-display text-3xl font-black"

                [class.text-neon-emerald]="r.is_within_target"

                [class.text-neon-magenta]="!r.is_within_target"

              >

                {{ r.margin_percent | number: '1.1-1' }}%

              </p>

              <p class="mt-1 text-xs text-gray-500">Semana {{ r.iso_week }}</p>

            </div>

            <div class="rounded-xl border border-neon-emerald/30 bg-neon-emerald/5 p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Ganancia real</p>

              <p class="font-display text-2xl font-bold text-neon-emerald">

                {{ r.metrics.net_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

              </p>

            </div>

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Ingresos</p>

              <p class="font-display text-2xl font-bold text-neon-cyan">

                {{ r.metrics.total_revenue | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

              </p>

            </div>

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Coste acumulado</p>

              <p class="font-display text-2xl font-bold text-gray-200">

                {{ r.metrics.total_real_cost | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

              </p>

            </div>

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Cerradas</p>

              <p class="font-display text-2xl font-bold text-white">{{ r.metrics.auctions_ended }}</p>

            </div>

          </div>

        } @else if (loading()) {

          <div class="h-32 animate-pulse rounded-xl bg-white/5"></div>

        }

      </section>



      @if (schedule(); as plan) {

        <section class="glass-card p-6">

          <h2 class="mb-4 font-display text-xl font-bold text-white">Planificado esta semana</h2>

          <div class="grid gap-4 sm:grid-cols-3">

            <div class="rounded-xl border border-gold/30 bg-gold/5 p-4">

              <p class="text-xs uppercase tracking-wider text-gold/80">Ganancia total prevista</p>

              <p class="font-display text-3xl font-black text-gold-light">

                {{ plan.combined.net_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

              </p>

            </div>

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Margen previsto (real + programado)</p>

              <p

                class="font-display text-3xl font-black"

                [class.text-neon-emerald]="plan.combined.is_within_target"

                [class.text-amber-300]="!plan.combined.is_within_target"

              >

                {{ plan.combined.margin_percent | number: '1.1-1' }}%

              </p>

            </div>

            <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

              <p class="text-xs uppercase tracking-wider text-gray-500">Subastas programadas</p>

              <p class="font-display text-3xl font-black text-neon-cyan">{{ plan.scheduled.length }}</p>

            </div>

          </div>

          <p class="mt-4 text-sm text-gray-400">

            Ve a <strong class="text-white">Subastas</strong> para programar productos y ver el desglose completo.

          </p>

        </section>

      }



      <section class="glass-card p-6">

        <h2 class="mb-4 font-display text-xl font-bold text-white">Cómo se calcula tu ganancia</h2>

        <div class="space-y-3 text-sm text-gray-300">

          <p><strong class="text-neon-cyan">Ingresos</strong> = bits consumidos + precio final del ganador</p>

          <p><strong class="text-neon-emerald">Tu ganancia</strong> = Ingresos − tu coste real del producto</p>

          <p><strong class="text-gold">Margen %</strong> = (Ganancia / coste real) × 100</p>

        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">

          <div class="rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4">

            <p class="text-xs uppercase tracking-wider text-neon-cyan">Por subasta</p>

            <p class="mt-1 font-display text-lg font-bold text-white">17% – 25%</p>

          </div>

          <div class="rounded-xl border border-gold/20 bg-gold/5 p-4">

            <p class="text-xs uppercase tracking-wider text-gold">Semanal global</p>

            <p class="mt-1 font-display text-lg font-bold text-white">17% – 25%</p>

            <p class="mt-2 text-xs text-gray-400">Lo que quieres ganar a la semana en conjunto.</p>

          </div>

        </div>

      </section>

    </div>

  `,

})

export class AdminDashboardPageComponent implements OnInit {

  private readonly adminService = inject(AdminService);



  readonly report = signal<WeeklyMarginReport | null>(null);

  readonly schedule = signal<WeeklySchedulePlan | null>(null);

  readonly loading = signal(true);

  readonly balancing = signal(false);



  ngOnInit(): void {

    this.loadReport();

    this.adminService.getWeeklySchedule().subscribe({

      next: (plan) => this.schedule.set(plan),

    });

  }



  runBalance(): void {

    this.balancing.set(true);

    this.adminService.balanceWeekly().subscribe({

      next: (report) => {

        this.report.set(report);

        this.balancing.set(false);

      },

      error: () => this.balancing.set(false),

    });

  }



  private loadReport(): void {

    this.loading.set(true);

    this.adminService.getWeeklyMargin().subscribe({

      next: (report) => {

        this.report.set(report);

        this.loading.set(false);

      },

      error: () => this.loading.set(false),

    });

  }

}


