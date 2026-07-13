import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AdminAuction,
  AdminProduct,
  CreateAuctionPayload,
  WinnerShowcase,
  CreateWinnerShowcasePayload,
  CreateProductPayload,
  MarginEvaluation,
  MarginPreview,
  PaginatedResponse,
  WeeklyMarginReport,
  WeeklySchedulePlan,
} from './admin-api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/admin`;

  getProducts(): Observable<AdminProduct[]> {
    return this.http
      .get<PaginatedResponse<AdminProduct>>(`${this.baseUrl}/products`)
      .pipe(map((r) => r.data));
  }

  createProduct(payload: CreateProductPayload): Observable<AdminProduct> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('real_cost', String(payload.real_cost));
    if (payload.description) formData.append('description', payload.description);
    if (payload.retail_value != null) formData.append('retail_value', String(payload.retail_value));
    if (payload.sku) formData.append('sku', payload.sku);
    if (payload.status) formData.append('status', payload.status);
    if (payload.estimated_bits != null) formData.append('estimated_bits', String(payload.estimated_bits));
    payload.images?.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    return this.http
      .post<{ product: AdminProduct }>(`${this.baseUrl}/products`, formData)
      .pipe(map((r) => r.product));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete(`${this.baseUrl}/products/${id}`).pipe(map(() => void 0));
  }

  addProductImages(id: number, images: File[]): Observable<AdminProduct> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    return this.http
      .patch<{ product: AdminProduct }>(`${this.baseUrl}/products/${id}`, formData)
      .pipe(map((r) => r.product));
  }

  getAuctions(): Observable<AdminAuction[]> {
    return this.http
      .get<PaginatedResponse<AdminAuction>>(`${this.baseUrl}/auctions`)
      .pipe(map((r) => r.data));
  }

  createAuction(payload: CreateAuctionPayload): Observable<AdminAuction> {
    return this.http
      .post<{ auction: AdminAuction }>(`${this.baseUrl}/auctions`, payload)
      .pipe(map((r) => r.auction));
  }

  activateAuction(id: number): Observable<AdminAuction> {
    return this.http
      .post<{ auction: AdminAuction }>(`${this.baseUrl}/auctions/${id}/activate`, {})
      .pipe(map((r) => r.auction));
  }

  pauseAuction(id: number): Observable<AdminAuction> {
    return this.http
      .post<{ auction: AdminAuction }>(`${this.baseUrl}/auctions/${id}/pause`, {})
      .pipe(map((r) => r.auction));
  }

  resumeAuction(id: number): Observable<AdminAuction> {
    return this.http
      .post<{ auction: AdminAuction }>(`${this.baseUrl}/auctions/${id}/resume`, {})
      .pipe(map((r) => r.auction));
  }

  getWeeklyMargin(): Observable<WeeklyMarginReport> {
    return this.http.get<WeeklyMarginReport>(`${this.baseUrl}/analytics/weekly-margin`);
  }

  getWeeklySchedule(): Observable<WeeklySchedulePlan> {
    return this.http.get<WeeklySchedulePlan>(`${this.baseUrl}/analytics/weekly-schedule`);
  }

  balanceWeekly(): Observable<WeeklyMarginReport> {
    return this.http
      .post<{ report: WeeklyMarginReport }>(`${this.baseUrl}/analytics/balance-weekly`, {})
      .pipe(map((r) => r.report));
  }

  previewMargin(params: {
    real_cost: number;
    bits_consumed?: number;
    retail_value?: number;
    min_margin_percent?: number;
    max_margin_percent?: number;
  }): Observable<MarginPreview> {
    return this.http.post<MarginPreview>(`${this.baseUrl}/analytics/margin-preview`, params);
  }

  getAuctionMargin(id: number): Observable<{ evaluation: MarginEvaluation; closing_range: MarginPreview }> {
    return this.http.get<{ evaluation: MarginEvaluation; closing_range: MarginPreview }>(
      `${this.baseUrl}/auctions/${id}/margin`,
    );
  }

  getWinnerShowcases(): Observable<WinnerShowcase[]> {
    return this.http
      .get<PaginatedResponse<WinnerShowcase>>(`${this.baseUrl}/winner-showcases`)
      .pipe(map((r) => r.data));
  }

  createWinnerShowcase(payload: CreateWinnerShowcasePayload): Observable<WinnerShowcase> {
    const formData = new FormData();
    formData.append('winner_name', payload.winner_name);
    formData.append('product_name', payload.product_name);
    formData.append('final_price', String(payload.final_price));
    formData.append('retail_value', String(payload.retail_value));
    if (payload.short_description) formData.append('short_description', payload.short_description);
    if (payload.sort_order != null) formData.append('sort_order', String(payload.sort_order));
    if (payload.is_active != null) formData.append('is_active', payload.is_active ? '1' : '0');
    if (payload.image) formData.append('image', payload.image);

    return this.http
      .post<{ showcase: WinnerShowcase }>(`${this.baseUrl}/winner-showcases`, formData)
      .pipe(map((r) => r.showcase));
  }

  updateWinnerShowcase(id: number, payload: Partial<CreateWinnerShowcasePayload>): Observable<WinnerShowcase> {
    const formData = new FormData();
    if (payload.winner_name) formData.append('winner_name', payload.winner_name);
    if (payload.product_name) formData.append('product_name', payload.product_name);
    if (payload.short_description !== undefined) formData.append('short_description', payload.short_description);
    if (payload.final_price != null) formData.append('final_price', String(payload.final_price));
    if (payload.retail_value != null) formData.append('retail_value', String(payload.retail_value));
    if (payload.sort_order != null) formData.append('sort_order', String(payload.sort_order));
    if (payload.is_active != null) formData.append('is_active', payload.is_active ? '1' : '0');
    if (payload.image) formData.append('image', payload.image);

    return this.http
      .patch<{ showcase: WinnerShowcase }>(`${this.baseUrl}/winner-showcases/${id}`, formData)
      .pipe(map((r) => r.showcase));
  }

  deleteWinnerShowcase(id: number): Observable<void> {
    return this.http.delete(`${this.baseUrl}/winner-showcases/${id}`).pipe(map(() => void 0));
  }
}
