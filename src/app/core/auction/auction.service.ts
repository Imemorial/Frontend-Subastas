import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuctionSummary } from '../../shared/models/auction.model';
import { ApiAuction } from './auction-api.models';

interface FeaturedWinnerApi {
  id: number;
  winner_name: string;
  product_name: string;
  short_description: string | null;
  image_url: string | null;
  final_price: number;
  retail_value: number;
  discount_percent: number;
}

export interface RecentWin {
  id: number;
  productName: string;
  productImageUrl: string;
  retailValue: number;
  finalPrice: number;
  winnerName: string;
  winnerAvatarUrl: string;
  totalBids: number;
  endedAt: Date | null;
  discountPercent: number;
  shortDescription?: string | null;
}

export interface UpcomingAuction {
  id: number;
  productName: string;
  productImageUrl: string;
  retailValue: number;
  scheduledAt: Date | null;
  currentPrice: number;
}

const PRODUCT_PLACEHOLDER_IMAGES: Record<string, string> = {
  'PlayStation 5 Slim':
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=450&fit=crop',
  'iPhone 15 Pro Max 256GB':
    'https://images.unsplash.com/photo-1695048133142-1c204c0e8b2f?w=600&h=450&fit=crop',
  'MacBook Air M3 15"':
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=450&fit=crop',
  'AirPods Pro 2':
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=450&fit=crop',
  'Nintendo Switch OLED':
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=450&fit=crop',
  'Samsung Galaxy S24 Ultra':
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=450&fit=crop',
  'iPad Air M2':
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=450&fit=crop',
};

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/auctions`;

  getActiveAuctions(): Observable<AuctionSummary[]> {
    return this.http.get<{ data: ApiAuction[] }>(this.baseUrl).pipe(
      map((response) =>
        response.data
          .filter((auction) => auction.product != null)
          .map((auction) => this.toAuctionSummary(auction)),
      ),
    );
  }

  getRecentWins(): Observable<RecentWin[]> {
    return this.http
      .get<{ data: ApiAuction[] }>(`${this.baseUrl}/recent-wins`)
      .pipe(
        map((response) =>
          response.data
            .filter((auction) => auction.product != null)
            .map((auction) => this.toRecentWin(auction)),
        ),
      );
  }

  getFeaturedWinners(): Observable<RecentWin[]> {
    return this.http
      .get<{ data: FeaturedWinnerApi[] }>(`${environment.apiUrl}/v1/winner-showcases`)
      .pipe(map((response) => response.data.map((item) => this.toFeaturedWin(item))));
  }

  getHomeWinners(): Observable<RecentWin[]> {
    return this.getFeaturedWinners().pipe(
      switchMap((featured) => (featured.length > 0 ? of(featured) : this.getRecentWins())),
      catchError(() => this.getRecentWins()),
    );
  }

  getUpcomingAuctions(): Observable<UpcomingAuction[]> {
    return this.http
      .get<{ data: ApiAuction[] }>(`${this.baseUrl}/upcoming`)
      .pipe(
        map((response) =>
          response.data
            .filter((auction) => auction.product != null)
            .map((auction) => ({
              id: auction.id,
              productName: auction.product.name,
              productImageUrl: this.resolveProductImage(auction.product),
              retailValue: auction.product.retail_value ?? 0,
              scheduledAt: auction.scheduled_at ? new Date(auction.scheduled_at) : null,
              currentPrice: auction.current_price,
            })),
        ),
      );
  }

  private toAuctionSummary(auction: ApiAuction): AuctionSummary {
    const retailValue = auction.product.retail_value ?? 0;

    return {
      id: auction.id,
      product: {
        id: auction.product.id,
        name: auction.product.name,
        imageUrl: this.resolveProductImage(auction.product),
        retailValue,
        realCost: auction.product.real_cost,
      },
      currentPrice: auction.current_price,
      bidIncrement: auction.bid_increment,
      remainingSeconds: auction.remaining_seconds,
      totalBids: auction.total_bids,
      status: auction.status as AuctionSummary['status'],
      scheduledAt: auction.scheduled_at ?? null,
      lastBidder: auction.last_bidder
        ? {
            id: auction.last_bidder.id,
            name: auction.last_bidder.name,
            avatarUrl: this.avatarUrl(auction.last_bidder.name),
          }
        : null,
      discountPercent: this.discountPercent(retailValue, auction.current_price),
    };
  }

  private toRecentWin(auction: ApiAuction): RecentWin {
    const retailValue = auction.product.retail_value ?? 0;
    const winnerName = auction.winner?.name ?? 'Ganador';

    return {
      id: auction.id,
      productName: auction.product.name,
      productImageUrl: this.resolveProductImage(auction.product),
      retailValue,
      finalPrice: auction.current_price,
      winnerName,
      winnerAvatarUrl: this.avatarUrl(winnerName),
      totalBids: auction.total_bids,
      endedAt: auction.ended_at ? new Date(auction.ended_at) : null,
      discountPercent: this.discountPercent(retailValue, auction.current_price),
    };
  }

  private toFeaturedWin(item: FeaturedWinnerApi): RecentWin {
    const imageUrl =
      item.image_url ??
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop';

    return {
      id: item.id,
      productName: item.product_name,
      productImageUrl: imageUrl,
      retailValue: item.retail_value,
      finalPrice: item.final_price,
      winnerName: item.winner_name,
      winnerAvatarUrl: item.image_url ?? this.avatarUrl(item.winner_name),
      totalBids: 0,
      endedAt: null,
      discountPercent: item.discount_percent,
      shortDescription: item.short_description,
    };
  }

  private resolveProductImage(product: ApiAuction['product']): string {
    const urls = product.image_urls ?? [];
    if (urls.length > 0) {
      return urls[0];
    }

    if (product.image_url) {
      return product.image_url;
    }

    return (
      PRODUCT_PLACEHOLDER_IMAGES[product.name] ??
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop'
    );
  }

  private avatarUrl(name: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  }

  private discountPercent(retailValue: number, finalPrice: number): number {
    if (retailValue <= 0) {
      return 0;
    }

    return Math.max(0, Math.round((1 - finalPrice / retailValue) * 100));
  }
}
