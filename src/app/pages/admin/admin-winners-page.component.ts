import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin/admin.service';
import { WinnerShowcase } from '../../core/admin/admin-api.models';

@Component({
  selector: 'app-admin-winners-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="grid gap-6 xl:grid-cols-2">
      <section class="glass-card p-6">
        <h2 class="mb-2 font-display text-xl font-bold text-white">
          {{ editingId() ? 'Editar ganador' : 'Nuevo ganador destacado' }}
        </h2>
        <p class="mb-6 text-sm text-gray-400">
          Estas historias aparecen en la home, en «Ganadores recientes». Usa fotos reales y frases cortas que
          generen confianza y urgencia.
        </p>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="mb-2 block text-sm text-gray-300">Nombre del ganador</label>
            <input
              formControlName="winner_name"
              placeholder="Ej. Laura M."
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-300">Producto ganado</label>
            <input
              formControlName="product_name"
              placeholder="Ej. iPhone 15 Pro"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-300">Frase corta (testimonio)</label>
            <textarea
              formControlName="short_description"
              rows="3"
              maxlength="280"
              placeholder="Ej. No me lo podía creer. Por menos de un café me llevé algo que llevaba meses mirando."
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">Máx. 280 caracteres. Aparece entre comillas en la tarjeta.</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm text-gray-300">Precio final (€)</label>
              <input
                type="number"
                step="0.01"
                formControlName="final_price"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm text-gray-300">Precio tienda (€)</label>
              <input
                type="number"
                step="0.01"
                formControlName="retail_value"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm text-gray-300">Orden</label>
              <input
                type="number"
                formControlName="sort_order"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"
              />
              <p class="mt-1 text-xs text-gray-500">Menor número = aparece primero</p>
            </div>
            <div class="flex items-end pb-1">
              <label class="flex cursor-pointer items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" formControlName="is_active" class="h-4 w-4 rounded accent-gold" />
                Visible en la home
              </label>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-300">Foto del ganador / premio</label>
            <input
              type="file"
              accept="image/*"
              class="w-full text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-gold/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gold hover:file:bg-gold/30"
              (change)="onImageSelected($event)"
            />
            @if (imagePreview()) {
              <img
                [src]="imagePreview()!"
                alt="Vista previa"
                class="mt-3 h-40 w-full rounded-xl object-cover"
              />
            }
          </div>

          @if (formError()) {
            <p class="rounded-xl border border-casino-red/30 bg-casino-red/10 px-4 py-3 text-sm text-casino-red">
              {{ formError() }}
            </p>
          }

          <div class="flex flex-wrap gap-3">
            <button
              type="submit"
              [disabled]="form.invalid || saving()"
              class="rounded-xl bg-gold-shine px-6 py-3 text-sm font-bold text-space-dark transition hover:brightness-110 disabled:opacity-50"
            >
              {{ saving() ? 'Guardando…' : editingId() ? 'Actualizar' : 'Publicar en home' }}
            </button>
            @if (editingId()) {
              <button
                type="button"
                (click)="cancelEdit()"
                class="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-300 hover:border-white/20 hover:text-white"
              >
                Cancelar
              </button>
            }
          </div>
        </form>
      </section>

      <section class="glass-card p-6">
        <h2 class="mb-2 font-display text-xl font-bold text-white">Ganadores publicados</h2>
        <p class="mb-6 text-sm text-gray-400">
          {{ showcases().length }} entradas · solo las activas se muestran en la web pública
        </p>

        @if (loading()) {
          <p class="text-sm text-gray-500">Cargando…</p>
        } @else if (showcases().length === 0) {
          <p class="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-gray-500">
            Aún no hay ganadores destacados. Crea el primero para rellenar la sección de prueba social.
          </p>
        } @else {
          <div class="space-y-4">
            @for (item of showcases(); track item.id) {
              <article
                class="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                [class.opacity-50]="!item.is_active"
              >
                @if (item.image_url) {
                  <img
                    [src]="item.image_url"
                    [alt]="item.winner_name"
                    class="h-24 w-24 shrink-0 rounded-lg object-cover"
                  />
                } @else {
                  <div
                    class="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white/5 text-2xl"
                  >
                    🏆
                  </div>
                }

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p class="font-semibold text-white">{{ item.winner_name }}</p>
                      <p class="text-sm text-gold">{{ item.product_name }}</p>
                    </div>
                    <span
                      class="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      [class.winner-badge-active]="item.is_active"
                      [class.winner-badge-hidden]="!item.is_active"
                    >
                      {{ item.is_active ? 'Activo' : 'Oculto' }}
                    </span>
                  </div>

                  @if (item.short_description) {
                    <p class="mt-2 line-clamp-2 text-sm italic text-gray-400">"{{ item.short_description }}"</p>
                  }

                  <p class="mt-2 text-sm text-gray-300">
                    {{ item.final_price | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}
                    <span class="text-gray-500">vs</span>
                    {{ item.retail_value | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}
                    <span class="text-neon-emerald">(-{{ item.discount_percent }}%)</span>
                  </p>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      (click)="startEdit(item)"
                      class="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-gold/30 hover:text-gold"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="toggleActive(item)"
                      class="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-neon-cyan/30 hover:text-neon-cyan"
                    >
                      {{ item.is_active ? 'Ocultar' : 'Activar' }}
                    </button>
                    <button
                      type="button"
                      (click)="remove(item)"
                      class="rounded-lg border border-casino-red/20 px-3 py-1.5 text-xs font-semibold text-casino-red hover:bg-casino-red/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class AdminWinnersPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  readonly showcases = signal<WinnerShowcase[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly editingId = signal<number | null>(null);
  readonly imagePreview = signal<string | null>(null);

  private selectedImage: File | null = null;

  readonly form = this.fb.nonNullable.group({
    winner_name: ['', [Validators.required, Validators.maxLength(120)]],
    product_name: ['', [Validators.required, Validators.maxLength(255)]],
    short_description: ['', Validators.maxLength(280)],
    final_price: [0, [Validators.required, Validators.min(0)]],
    retail_value: [0, [Validators.required, Validators.min(0.01)]],
    sort_order: [0, [Validators.min(0)]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadShowcases();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const value = this.form.getRawValue();
    const payload = {
      ...value,
      short_description: value.short_description || undefined,
      image: this.selectedImage ?? undefined,
    };

    const editingId = this.editingId();
    const request$ = editingId
      ? this.adminService.updateWinnerShowcase(editingId, payload)
      : this.adminService.createWinnerShowcase(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.loadShowcases();
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('No se pudo guardar. Revisa los datos e inténtalo de nuevo.');
      },
    });
  }

  startEdit(item: WinnerShowcase): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      winner_name: item.winner_name,
      product_name: item.product_name,
      short_description: item.short_description ?? '',
      final_price: item.final_price,
      retail_value: item.retail_value,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    this.imagePreview.set(item.image_url);
    this.selectedImage = null;
    this.formError.set('');
  }

  cancelEdit(): void {
    this.resetForm();
  }

  toggleActive(item: WinnerShowcase): void {
    this.adminService.updateWinnerShowcase(item.id, { is_active: !item.is_active }).subscribe({
      next: () => this.loadShowcases(),
    });
  }

  remove(item: WinnerShowcase): void {
    if (!confirm(`¿Eliminar a ${item.winner_name}?`)) {
      return;
    }

    this.adminService.deleteWinnerShowcase(item.id).subscribe({
      next: () => {
        if (this.editingId() === item.id) {
          this.resetForm();
        }
        this.loadShowcases();
      },
    });
  }

  private loadShowcases(): void {
    this.loading.set(true);
    this.adminService.getWinnerShowcases().subscribe({
      next: (items) => {
        this.showcases.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.selectedImage = null;
    this.imagePreview.set(null);
    this.form.reset({
      winner_name: '',
      product_name: '',
      short_description: '',
      final_price: 0,
      retail_value: 0,
      sort_order: 0,
      is_active: true,
    });
    this.formError.set('');
  }
}
