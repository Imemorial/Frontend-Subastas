import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6">
      <div class="pointer-events-none absolute inset-0 bg-velvet-spotlight opacity-40"></div>
      <section class="glass-card relative w-full max-w-md border-gold/15 p-8">
        <div class="mb-8 text-center">
          <p class="mb-3 text-4xl">🎲</p>
          <p class="mb-2 text-xs uppercase tracking-[0.35em] text-gold">Únete a la acción</p>
          <h1 class="text-3xl font-black text-white">Crea tu cuenta</h1>
          <p class="mt-2 text-sm text-gray-400">
            30 segundos y estás dentro. Empieza a pujar en subastas en directo.
          </p>
        </div>

        <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label for="name" class="mb-2 block text-sm font-medium text-gray-200">Nombre</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              placeholder="Tu nombre"
            />
          </div>

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
            <label for="password" class="mb-2 block text-sm font-medium text-gray-200">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              placeholder="Minimo 8 caracteres"
            />
          </div>

          <div>
            <label for="password_confirmation" class="mb-2 block text-sm font-medium text-gray-200">
              Confirmar contraseña
            </label>
            <input
              id="password_confirmation"
              type="password"
              formControlName="password_confirmation"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              placeholder="Repite la contraseña"
            />
          </div>

          @if (passwordMismatch()) {
            <p class="text-sm text-amber-300">Las contraseñas no coinciden.</p>
          }

          @if (errorMessage()) {
            <p class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {{ errorMessage() }}
            </p>
          }

          <button
            type="submit"
            class="btn-neon-primary w-full animate-cta-pulse py-3 text-base"
            [disabled]="form.invalid || passwordMismatch() || submitting()"
          >
            {{ submitting() ? 'Preparando tu mesa...' : 'Empezar a jugar gratis' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-400">
          ¿Ya tienes cuenta?
          <a routerLink="/login" class="font-bold text-gold hover:text-gold-light">
            Inicia sesión
          </a>
        </p>
      </section>
    </main>
  `,
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
  });
  readonly passwordMismatch = computed(
    () =>
      this.form.controls.password.value !== this.form.controls.password_confirmation.value &&
      this.form.controls.password_confirmation.value.length > 0,
  );

  submit(): void {
    if (this.form.invalid || this.passwordMismatch() || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigate(['/']);
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error?.error?.message ??
            error?.error?.errors?.email?.[0] ??
            'No se ha podido crear la cuenta.',
        );
      },
    });
  }
}
