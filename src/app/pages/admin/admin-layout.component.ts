import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div class="mb-8">
        <p class="mb-1 text-xs uppercase tracking-[0.35em] text-neon-magenta">Panel de control</p>
        <h1 class="font-display text-3xl font-bold text-white">Administración</h1>
        <p class="mt-2 text-sm text-gray-400">
          Gestiona productos, programa subastas, publica ganadores en la home y controla el margen semanal (17%–25%).
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav class="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          <a
            routerLink="/admin"
            routerLinkActive="border-neon-cyan/40 bg-neon-cyan/10 text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-neon-cyan/30 hover:text-white"
          >
            Dashboard
          </a>
          <a
            routerLink="/admin/products"
            routerLinkActive="border-neon-cyan/40 bg-neon-cyan/10 text-white"
            class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-neon-cyan/30 hover:text-white"
          >
            Productos
          </a>
          <a
            routerLink="/admin/auctions"
            routerLinkActive="border-neon-cyan/40 bg-neon-cyan/10 text-white"
            class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-neon-cyan/30 hover:text-white"
          >
            Subastas
          </a>
          <a
            routerLink="/admin/winners"
            routerLinkActive="border-neon-cyan/40 bg-neon-cyan/10 text-white"
            class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-neon-cyan/30 hover:text-white"
          >
            Ganadores
          </a>
          <a
            routerLink="/"
            class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-400 transition hover:border-white/20 hover:text-white"
          >
            ← Ver web pública
          </a>
        </nav>

        <div class="min-w-0">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {}
