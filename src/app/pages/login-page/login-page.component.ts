import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6">
      <div class="pointer-events-none absolute inset-0 bg-velvet-spotlight opacity-40"></div>
      <section class="glass-card relative w-full max-w-md border-gold/15 p-8">
        <div class="mb-8 text-center">
          <p class="mb-3 text-4xl">🎰</p>
          <p class="mb-2 text-xs uppercase tracking-[0.35em] text-gold">Bienvenido de vuelta</p>
          <h1 class="text-3xl font-black text-white">Entra a la mesa</h1>
          <p class="mt-2 text-sm text-gray-400">
            Tus fichas te esperan. Las subastas no paran.
          </p>
        </div>

        <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label for="email" class="mb-2 block text-sm font-medium text-gray-200">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <label for="password" class="block text-sm font-medium text-gray-200">Contraseña</label>
              <a routerLink="/olvide-contrasena" class="text-xs font-semibold text-gold hover:text-gold-light">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              placeholder="Tu contraseña"
            />
          </div>

          @if (errorMessage()) {
            <p class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {{ errorMessage() }}
            </p>
          }

          <button
            type="submit"
            class="btn-neon-primary w-full animate-cta-pulse py-3 text-base"
            [disabled]="form.invalid || submitting()"
          >
            {{ submitting() ? 'Entrando...' : 'Entrar y jugar' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-400">
          ¿No tienes cuenta?
          <a routerLink="/register" class="font-bold text-gold hover:text-gold-light">
            Crear cuenta gratis
          </a>
        </p>
      </section>
    </main>
  `,
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.submitting.set(false);
        void this.router.navigate([user.role === 'admin' ? '/admin' : '/']);
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error?.error?.message ??
            error?.error?.errors?.email?.[0] ??
            'No se ha podido iniciar sesión. Revisa tus credenciales.',
        );
      },
    });
  }
}
