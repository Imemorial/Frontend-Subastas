export interface ApiProduct {
  id: number;
  name: string;
  image_url: string | null;
  image_urls?: string[];
  retail_value: number | null;
  real_cost?: number;
}
export interface ApiUserRef {
  id: number;
  name: string;
}

export interface ApiAuction {
  id: number;
  status: string;
  current_price: number;
  bid_increment: number;
  remaining_seconds: number;
  total_bids: number;
  scheduled_at?: string | null;
  ended_at?: string | null;
  product: ApiProduct;
  last_bidder?: ApiUserRef | null;
  winner?: ApiUserRef | null;
}
