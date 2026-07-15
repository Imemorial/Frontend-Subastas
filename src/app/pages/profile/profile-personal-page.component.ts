import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/profile/profile.service';
import { AuthUser } from '../../core/auth/auth.models';

@Component({
  selector: 'app-profile-personal-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="glass-card border-gold/15 p-6 sm:p-8">
      @if (loading()) {
        <p class="mb-4 text-sm text-gray-400">Actualizando datos...</p>
      }
        <div class="mb-6 flex items-center gap-3">
          <span class="text-2xl">👤</span>
          <div>
            <h2 class="text-xl font-bold text-white">Datos personales</h2>
            <p class="text-sm text-gray-400">Nombre, correo y contraseña de tu cuenta.</p>
          </div>
        </div>

        <form class="space-y-4" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="name" class="mb-2 block text-sm font-medium text-gray-200">Nombre</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              />
            </div>
            <div>
              <label for="last_name" class="mb-2 block text-sm font-medium text-gray-200">Apellido</label>
              <input
                id="last_name"
                type="text"
                formControlName="last_name"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
              />
            </div>
          </div>

          @if (profileMessage()) {
            <p
              class="rounded-xl border px-4 py-3 text-sm"
              [class]="profileError() ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald'"
            >
              {{ profileMessage() }}
            </p>
          }

          <button
            type="submit"
            class="btn-neon-primary px-6 py-2.5 text-sm"
            [disabled]="profileForm.invalid || savingProfile()"
          >
            {{ savingProfile() ? 'Guardando...' : 'Guardar datos' }}
          </button>
        </form>

        <div class="mt-8 border-t border-white/10 pt-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-widest text-gray-500">Correo electrónico</p>
              <p class="mt-1 font-medium text-white">{{ currentUser()?.email }}</p>
            </div>
            <button
              type="button"
              class="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:border-gold/30 hover:text-gold-light"
              (click)="toggleEmailForm()"
            >
              {{ showEmailForm() ? 'Cancelar' : 'Cambiar correo' }}
            </button>
          </div>

          @if (showEmailForm()) {
            <form class="mt-4 space-y-4" [formGroup]="emailForm" (ngSubmit)="saveEmail()">
              <div>
                <label for="new_email" class="mb-2 block text-sm font-medium text-gray-200">Nuevo correo</label>
                <input
                  id="new_email"
                  type="email"
                  formControlName="email"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
                />
              </div>
              <div>
                <label for="email_password" class="mb-2 block text-sm font-medium text-gray-200">Contraseña actual</label>
                <input
                  id="email_password"
                  type="password"
                  formControlName="current_password"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
                />
              </div>
              @if (emailMessage()) {
                <p
                  class="rounded-xl border px-4 py-3 text-sm"
                  [class]="emailError() ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald'"
                >
                  {{ emailMessage() }}
                </p>
              }
              <button
                type="submit"
                class="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
                [disabled]="emailForm.invalid || savingEmail()"
              >
                {{ savingEmail() ? 'Actualizando...' : 'Actualizar correo' }}
              </button>
            </form>
          }
        </div>

        <div class="mt-6 border-t border-white/10 pt-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-widest text-gray-500">Contraseña</p>
              <p class="mt-1 text-sm text-gray-400">••••••••</p>
            </div>
            <button
              type="button"
              class="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:border-gold/30 hover:text-gold-light"
              (click)="togglePasswordForm()"
            >
              {{ showPasswordForm() ? 'Cancelar' : 'Cambiar contraseña' }}
            </button>
          </div>

          @if (showPasswordForm()) {
            <form class="mt-4 space-y-4" [formGroup]="passwordForm" (ngSubmit)="savePassword()">
              <div>
                <label for="current_password" class="mb-2 block text-sm font-medium text-gray-200">Contraseña actual</label>
                <input
                  id="current_password"
                  type="password"
                  formControlName="current_password"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
                />
              </div>
              <div>
                <label for="new_password" class="mb-2 block text-sm font-medium text-gray-200">Nueva contraseña</label>
                <input
                  id="new_password"
                  type="password"
                  formControlName="password"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
                />
              </div>
              <div>
                <label for="password_confirmation" class="mb-2 block text-sm font-medium text-gray-200">Confirmar contraseña</label>
                <input
                  id="password_confirmation"
                  type="password"
                  formControlName="password_confirmation"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/50 focus:shadow-gold"
                />
              </div>
              @if (passwordMessage()) {
                <p
                  class="rounded-xl border px-4 py-3 text-sm"
                  [class]="passwordError() ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald'"
                >
                  {{ passwordMessage() }}
                </p>
              }
              <button
                type="submit"
                class="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
                [disabled]="passwordForm.invalid || savingPassword()"
              >
                {{ savingPassword() ? 'Actualizando...' : 'Actualizar contraseña' }}
              </button>
            </form>
          }
        </div>
      </section>
  `,
})
export class ProfilePersonalPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  readonly currentUser = this.authService.user;
  readonly loading = signal(false);
  readonly savingProfile = signal(false);
  readonly savingEmail = signal(false);
  readonly savingPassword = signal(false);
  readonly profileMessage = signal('');
  readonly profileError = signal(false);
  readonly emailMessage = signal('');
  readonly emailError = signal(false);
  readonly passwordMessage = signal('');
  readonly passwordError = signal(false);
  readonly showEmailForm = signal(false);
  readonly showPasswordForm = signal(false);

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    last_name: ['', [Validators.maxLength(120)]],
  });

  readonly emailForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    current_password: ['', [Validators.required]],
  });

  readonly passwordForm = this.formBuilder.nonNullable.group({
    current_password: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.hydrateForms(this.authService.user());

    this.loading.set(true);
    this.profileService.refreshMe().subscribe({
      next: (user) => {
        this.hydrateForms(user);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private hydrateForms(user: AuthUser | null): void {
    if (!user?.email) {
      return;
    }

    this.profileForm.patchValue({
      name: user.name ?? '',
      last_name: user.last_name ?? '',
    });
    this.emailForm.patchValue({ email: user.email });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);
    this.profileMessage.set('');
    this.profileError.set(false);

    const { name, last_name } = this.profileForm.getRawValue();

    this.profileService
      .updateProfile({
        name,
        last_name: last_name.trim() || null,
      })
      .subscribe({
        next: (response) => {
          this.savingProfile.set(false);
          this.profileMessage.set(response.message);
        },
        error: (error) => {
          this.savingProfile.set(false);
          this.profileError.set(true);
          this.profileMessage.set(this.extractError(error));
        },
      });
  }

  saveEmail(): void {
    if (this.emailForm.invalid || this.savingEmail()) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.savingEmail.set(true);
    this.emailMessage.set('');
    this.emailError.set(false);

    this.profileService.updateEmail(this.emailForm.getRawValue()).subscribe({
      next: (response) => {
        this.savingEmail.set(false);
        this.emailMessage.set(response.message);
        this.emailForm.patchValue({ current_password: '' });
      },
      error: (error) => {
        this.savingEmail.set(false);
        this.emailError.set(true);
        this.emailMessage.set(this.extractError(error));
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const values = this.passwordForm.getRawValue();

    if (values.password !== values.password_confirmation) {
      this.passwordError.set(true);
      this.passwordMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.savingPassword.set(true);
    this.passwordMessage.set('');
    this.passwordError.set(false);

    this.profileService.updatePassword(values).subscribe({
      next: (response) => {
        this.savingPassword.set(false);
        this.passwordMessage.set(response.message);
        this.passwordForm.reset();
      },
      error: (error) => {
        this.savingPassword.set(false);
        this.passwordError.set(true);
        this.passwordMessage.set(this.extractError(error));
      },
    });
  }

  toggleEmailForm(): void {
    this.showEmailForm.update((value) => !value);
    this.emailMessage.set('');
    this.emailError.set(false);
  }

  togglePasswordForm(): void {
    this.showPasswordForm.update((value) => !value);
    this.passwordMessage.set('');
    this.passwordError.set(false);
  }

  private extractError(error: {
    status?: number;
    error?: { message?: string; errors?: Record<string, string[]> } | string;
    message?: string;
  }): string {
    if (typeof error?.error === 'string') {
      if (error.status === 500) {
        return 'Error del servidor. Si acabas de actualizar la app, ejecuta las migraciones del backend (php artisan migrate).';
      }

      return 'Ha ocurrido un error. Inténtalo de nuevo.';
    }

    const errors = error?.error?.errors;

    if (errors) {
      const firstKey = Object.keys(errors)[0];
      if (firstKey && errors[firstKey]?.[0]) {
        return errors[firstKey][0];
      }
    }

    return error?.error?.message ?? error?.message ?? 'Ha ocurrido un error. Inténtalo de nuevo.';
  }
}
