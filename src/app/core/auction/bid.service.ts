import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface PlaceBidResponse {
  message: string;
  bid: {
    id: number;
    amount: number;
    bits_spent: number;
    bid_at: string;
    user?: {
      id: number;
      name: string;
    };
  };
  bit_balance: number;
}

@Injectable({ providedIn: 'root' })
export class BidService {
  private readonly http = inject(HttpClient);

  placeBid(auctionId: number, bitsCount = 1): Observable<PlaceBidResponse> {
    return this.http.post<PlaceBidResponse>(
      `${environment.apiUrl}/v1/auctions/${auctionId}/bids`,
      { bits_count: bitsCount },
    );
  }
}
