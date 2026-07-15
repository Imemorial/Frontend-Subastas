import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="mb-1 text-xs uppercase tracking-[0.35em] text-gold">Mi cuenta</p>
          <h1 class="font-display text-3xl font-black text-white">{{ displayName() }}</h1>
          <p class="mt-2 text-sm text-gray-400">Gestiona tus datos personales y tu cartera de Bits.</p>
        </div>
        <div class="chip-balance shrink-0">
          <div class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gold-shine text-xs font-black text-space-dark shadow-gold">
            ₿
          </div>
          <div class="relative z-10">
            <p class="text-[9px] uppercase tracking-widest text-gold/80">Saldo</p>
            <p class="font-display text-base font-black text-gold-light">
              {{ currentUser()?.bit_balance ?? 0 }}
              <span class="text-[10px] font-semibold text-gold/70">Bits</span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav class="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          @if (!isAdmin()) {
            <a
              routerLink="/perfil/datos"
              routerLinkActive="border-gold/40 bg-gold/10 text-white"
              class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-gold/30 hover:text-white"
            >
              Datos personales
            </a>
          }
          <a
            routerLink="/perfil/bits"
            routerLinkActive="border-gold/40 bg-gold/10 text-white"
            class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-gold/30 hover:text-white"
          >
            Mis Bits
          </a>
          @if (isAdmin()) {
            <a
              routerLink="/admin"
              class="whitespace-nowrap rounded-xl border border-neon-magenta/20 px-4 py-3 text-sm font-semibold text-neon-magenta transition hover:border-neon-magenta/40 hover:text-white"
            >
              Panel admin
            </a>
          }
          <a
            routerLink="/"
            class="whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-400 transition hover:border-white/20 hover:text-white"
          >
            ← Volver al inicio
          </a>
        </nav>

        <div class="min-w-0">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class ProfileLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.user;
  readonly isAdmin = this.authService.isAdmin;

  readonly displayName = computed(() =>
    this.isAdmin() ? 'ADMINISTRADOR' : (this.currentUser()?.name ?? 'Mi perfil'),
  );
}
