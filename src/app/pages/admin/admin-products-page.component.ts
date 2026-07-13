import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs';



import { AdminService } from '../../core/admin/admin.service';

import { AdminProduct, MarginPreview } from '../../core/admin/admin-api.models';



@Component({

  selector: 'app-admin-products-page',

  standalone: true,

  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe],

  template: `

    <div class="grid gap-6 xl:grid-cols-2">

      <section class="glass-card p-6">

        <h2 class="mb-2 font-display text-xl font-bold text-white">Nuevo producto</h2>

        <p class="mb-6 text-sm text-gray-400">

          Introduce tu coste real y el sistema calcula cuánto vas a ganar respetando el margen semanal del 17–25%.

        </p>



        <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">

          <div>

            <label class="mb-2 block text-sm text-gray-300">Nombre</label>

            <input

              formControlName="name"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

          </div>



          <div class="grid gap-4 sm:grid-cols-2">

            <div>

              <label class="mb-2 block text-sm text-gray-300">Tu coste real (€) *</label>

              <input

                type="number"

                step="0.01"

                formControlName="real_cost"

                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

              />

              <p class="mt-1 text-xs text-gray-500">Lo que te cuesta a ti el producto</p>

            </div>

            <div>

              <label class="mb-2 block text-sm text-gray-300">Valor de mercado (€)</label>

              <input

                type="number"

                step="0.01"

                formControlName="retail_value"

                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

              />

            </div>

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Descripción</label>

            <textarea

              formControlName="description"

              rows="3"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            ></textarea>

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Fotos del producto</label>

            <input

              type="file"

              accept="image/*"

              multiple

              class="w-full text-sm text-gray-400"

              (change)="onImagesSelected($event)"

            />

            @if (selectedImages().length > 0) {

              <div class="mt-3 flex flex-wrap gap-2">

                @for (preview of imagePreviews(); track $index) {

                  <img [src]="preview" alt="Vista previa" class="h-16 w-16 rounded-lg object-cover ring-1 ring-white/10" />

                }

              </div>

            }

          </div>



          <div>

            <label class="mb-2 block text-sm text-gray-300">Bits estimados antes del cierre</label>

            <input

              type="number"

              formControlName="estimated_bits"

              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-gold/50"

            />

            <p class="mt-1 text-xs text-gray-500">Cuántas pujas esperas. Ajusta hasta que el margen encaje.</p>

          </div>



          @if (marginPreview(); as preview) {

            <div class="rounded-xl border border-gold/30 bg-gold/5 p-4">

              <p class="mb-3 text-xs font-bold uppercase tracking-wider text-gold">

                Previsión de ganancia · margen semanal 17–25%

              </p>



              @if (preview.is_range_valid) {

                <div class="mb-4 grid gap-3 sm:grid-cols-3">

                  <div class="rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 p-3 text-center">

                    <p class="text-[10px] uppercase tracking-wider text-gray-400">Ganancia mín.</p>

                    <p class="font-display text-xl font-black text-neon-emerald">

                      {{ preview.strategy.projected_profit_min | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                    </p>

                    <p class="text-xs text-gray-500">{{ preview.strategy.projected_margin_min | number: '1.0-1' }}%</p>

                  </div>

                  <div class="rounded-xl border border-gold/40 bg-gold/10 p-3 text-center">

                    <p class="text-[10px] uppercase tracking-wider text-gray-400">Ganancia objetivo</p>

                    <p class="font-display text-2xl font-black text-gold-light">

                      {{ preview.strategy.projected_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                    </p>

                    <p class="text-xs text-gold/80">{{ preview.strategy.projected_margin_percent | number: '1.0-1' }}%</p>

                  </div>

                  <div class="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 p-3 text-center">

                    <p class="text-[10px] uppercase tracking-wider text-gray-400">Ganancia máx.</p>

                    <p class="font-display text-xl font-black text-neon-cyan">

                      {{ preview.strategy.projected_profit_max | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                    </p>

                    <p class="text-xs text-gray-500">{{ preview.strategy.projected_margin_max | number: '1.0-1' }}%</p>

                  </div>

                </div>



                <p class="font-display text-lg font-bold text-white">

                  Cierra a ~{{ preview.strategy.recommended_customer_price_target | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                  con {{ preview.strategy.recommended_bits_target }} bits

                </p>

                <p class="mt-2 text-xs text-gray-400">

                  Rol:

                  <span class="font-semibold text-white">

                    {{ preview.strategy.product_role === 'margin_carrier' ? 'Generador de margen' : 'Producto gancho' }}

                  </span>

                  · Rango bits: {{ preview.strategy.recommended_bits_min }}–{{ preview.strategy.recommended_bits_max }}

                </p>



                <div class="mt-4 grid gap-3 sm:grid-cols-2">

                  <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">

                    <p class="text-[10px] uppercase tracking-wider text-gray-500">PVP mostrado</p>

                    <p class="font-display text-lg font-bold text-white">

                      {{ preview.strategy.recommended_retail_value | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}

                    </p>

                  </div>

                  <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">

                    <p class="text-[10px] uppercase tracking-wider text-gray-500">Precio de salida</p>

                    <p class="font-display text-lg font-bold text-white">

                      {{ preview.strategy.recommended_starting_price | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                    </p>

                  </div>

                </div>

                <p class="mt-3 text-xs text-gray-400">{{ preview.strategy.strategy_note }}</p>

              } @else {

                <p class="text-sm text-amber-200">

                  Con tantos bits superas el margen máximo. Reduce los bits estimados o sube el coste.

                </p>

              }

            </div>

          }



          @if (successMessage()) {

            <p class="rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm text-neon-emerald">

              {{ successMessage() }}

            </p>

          }

          @if (errorMessage()) {

            <p class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">

              {{ errorMessage() }}

            </p>

          }



          <button type="submit" class="btn-neon-primary w-full py-3" [disabled]="form.invalid || submitting()">

            {{ submitting() ? 'Guardando...' : 'Guardar producto y estrategia' }}

          </button>

        </form>

      </section>



      <section class="glass-card p-6">

        <h2 class="mb-6 font-display text-xl font-bold text-white">Productos ({{ products().length }})</h2>



        @if (products().length === 0) {

          <p class="text-sm text-gray-400">Aún no hay productos. Crea el primero a la izquierda.</p>

        } @else {

          <div class="space-y-3">

            @for (product of products(); track product.id) {

              <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">

                <div class="flex items-start justify-between gap-4">

                  <div class="min-w-0 flex-1">

                    <p class="truncate font-semibold text-white">{{ product.name }}</p>

                    <p class="text-sm text-gray-400">

                      Coste: {{ product.real_cost | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                      @if (product.retail_value) {

                        · PVP: {{ product.retail_value | currency: 'EUR' : 'symbol' : '1.0-0' : 'es' }}

                      }

                    </p>

                    @if (product.metadata?.strategy; as strategy) {

                      <p class="mt-2 text-sm text-neon-emerald">

                        Ganancia prevista:

                        <span class="font-bold">

                          {{ strategy.projected_profit | currency: 'EUR' : 'symbol' : '1.2-2' : 'es' }}

                        </span>

                        ({{ strategy.projected_margin_percent | number: '1.0-1' }}%)

                      </p>

                    }

                    <span class="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-gray-400">

                      {{ product.status }}

                    </span>

                  </div>

                  <button

                    type="button"

                    class="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"

                    (click)="deleteProduct(product)"

                  >

                    Eliminar

                  </button>

                </div>



                @if (product.image_urls.length) {

                  <div class="mt-3 flex flex-wrap gap-2">

                    @for (url of product.image_urls; track url) {

                      <img [src]="url" [alt]="product.name" class="h-20 w-20 rounded-lg object-cover ring-1 ring-white/10" />

                    }

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

export class AdminProductsPageComponent implements OnInit {

  private readonly adminService = inject(AdminService);

  private readonly formBuilder = inject(FormBuilder);



  readonly products = signal<AdminProduct[]>([]);

  readonly marginPreview = signal<MarginPreview | null>(null);

  readonly submitting = signal(false);

  readonly successMessage = signal('');

  readonly errorMessage = signal('');

  readonly selectedImages = signal<File[]>([]);

  readonly imagePreviews = signal<string[]>([]);



  readonly form = this.formBuilder.nonNullable.group({

    name: ['', Validators.required],

    real_cost: [0, [Validators.required, Validators.min(0.01)]],

    retail_value: [0],

    description: [''],

    estimated_bits: [500, [Validators.min(0)]],

  });



  ngOnInit(): void {

    this.loadProducts();

    this.form.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {

      this.updateMarginPreview();

    });

    this.updateMarginPreview();

  }



  onImagesSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    const files = Array.from(input.files ?? []).slice(0, 10);

    this.selectedImages.set(files);

    this.imagePreviews.set(files.map((file) => URL.createObjectURL(file)));

  }



  submit(): void {

    if (this.form.invalid || this.submitting()) return;



    this.submitting.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');



    const raw = this.form.getRawValue();

    this.adminService

      .createProduct({

        name: raw.name,

        real_cost: raw.real_cost,

        retail_value: raw.retail_value || undefined,

        description: raw.description || undefined,

        estimated_bits: raw.estimated_bits,

        status: 'published',

        images: this.selectedImages(),

      })

      .subscribe({

        next: () => {

          this.submitting.set(false);

          this.successMessage.set('Producto guardado con estrategia de margen. Ahora prográmalo en Subastas.');

          this.form.reset({ name: '', real_cost: 0, retail_value: 0, description: '', estimated_bits: 500 });

          this.selectedImages.set([]);

          this.imagePreviews.set([]);

          this.loadProducts();

        },

        error: (err) => {

          this.submitting.set(false);

          this.errorMessage.set(err?.error?.message ?? 'Error al crear el producto.');

        },

      });

  }



  deleteProduct(product: AdminProduct): void {

    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    this.adminService.deleteProduct(product.id).subscribe({ next: () => this.loadProducts() });

  }



  private loadProducts(): void {

    this.adminService.getProducts().subscribe({

      next: (products) => this.products.set(products),

    });

  }



  private updateMarginPreview(): void {

    const realCost = this.form.controls.real_cost.value;

    if (!realCost || realCost <= 0) {

      this.marginPreview.set(null);

      return;

    }



    this.adminService

      .previewMargin({

        real_cost: realCost,

        bits_consumed: this.form.controls.estimated_bits.value,

        retail_value: this.form.controls.retail_value.value || undefined,

        min_margin_percent: 17,

        max_margin_percent: 25,

      })

      .subscribe({

        next: (preview) => {

          this.marginPreview.set(preview);

          if (!this.form.controls.retail_value.value) {

            this.form.controls.retail_value.setValue(preview.strategy.recommended_retail_value, {

              emitEvent: false,

            });

          }

        },

        error: () => this.marginPreview.set(null),

      });

  }

}


