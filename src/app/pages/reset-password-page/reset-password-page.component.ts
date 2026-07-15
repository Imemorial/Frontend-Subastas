import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6">
      <div class="pointer-events-none absolute inset-0 bg-velvet-spotlight opacity-40"></div>
      <section class="glass-card relative w-full max-w-md border-gold/15 p-8">
        <div class="mb-8 text-center">
          <p class="mb-3 text-4xl">🔐</p>
          <p class="mb-2 text-xs uppercase tracking-[0.35em] text-gold">Nueva contraseña</p>
          <h1 class="text-3xl font-black text-white">Restablecer contraseña</h1>
          <p class="mt-2 text-sm text-gray-400">Elige una contraseña segura para tu cuenta.</p>
        </div>

        @if (successMessage()) {
          <p class="mb-4 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm text-neon-emerald">
            {{ successMessage() }}
          </p>
          <a routerLink="/login" class="btn-neon-primary block w-full py-3 text-center text-base">
            Ir al login
          </a>
        } @else {
          <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label for="email" class="mb-2 block text-sm font-medium text-gray-200">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              />
            </div>

            <div>
              <label for="password" class="mb-2 block text-sm font-medium text-gray-200">Nueva contraseña</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
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
              [disabled]="form.invalid || submitting() || !token()"
            >
              {{ submitting() ? 'Guardando...' : 'Guardar nueva contraseña' }}
            </button>
          </form>
        }

        <p class="mt-6 text-center text-sm text-gray-400">
          <a routerLink="/login" class="font-bold text-gold hover:text-gold-light">← Volver a iniciar sesión</a>
        </p>
      </section>
    </main>
  `,
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly token = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const token = query.get('token') ?? '';
    const email = query.get('email') ?? '';

    this.token.set(token);
    this.form.patchValue({ email });

    if (!token) {
      this.errorMessage.set('El enlace de recuperación no es válido o ha caducado.');
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting() || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    if (values.password !== values.password_confirmation) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService
      .resetPassword({
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        token: this.token(),
      })
      .subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.successMessage.set(response.message);
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(
            error?.error?.message ??
              error?.error?.errors?.email?.[0] ??
              'No se pudo restablecer la contraseña. Solicita un nuevo enlace.',
          );
        },
      });
  }
}
