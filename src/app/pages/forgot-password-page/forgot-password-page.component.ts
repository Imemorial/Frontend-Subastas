import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6">
      <div class="pointer-events-none absolute inset-0 bg-velvet-spotlight opacity-40"></div>
      <section class="glass-card relative w-full max-w-md border-gold/15 p-8">
        <div class="mb-8 text-center">
          <p class="mb-3 text-4xl">🔑</p>
          <p class="mb-2 text-xs uppercase tracking-[0.35em] text-gold">Recuperación</p>
          <h1 class="text-3xl font-black text-white">¿Olvidaste tu contraseña?</h1>
          <p class="mt-2 text-sm text-gray-400">
            Introduce tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        @if (successMessage()) {
          <p class="mb-4 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm text-neon-emerald">
            {{ successMessage() }}
          </p>
        } @else {
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
              {{ submitting() ? 'Enviando...' : 'Enviar enlace de recuperación' }}
            </button>
          </form>
        }

        <p class="mt-6 text-center text-sm text-gray-400">
          <a routerLink="/login" class="font-bold text-gold hover:text-gold-light">← Volver al login</a>
        </p>
      </section>
    </main>
  `,
})
export class ForgotPasswordPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService.forgotPassword(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.successMessage.set(response.message);
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error?.error?.message ??
            error?.error?.errors?.email?.[0] ??
            'No se pudo enviar el correo de recuperación.',
        );
      },
    });
  }
}
