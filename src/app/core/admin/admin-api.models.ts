export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_urls: string[];
  real_cost: number;
  retail_value: number | null;
  sku: string | null;
  status: 'draft' | 'published' | 'archived';
  metadata?: ProductAuctionMetadata | null;
  created_at: string;
}

export interface ProductAuctionMetadata {
  estimated_bits?: number;
  strategy?: MarginStrategy;
  closing_preview?: MarginPreview;
  saved_at?: string;
}

export interface MarginStrategy {
  recommended_customer_price_target: number;
  recommended_bits_target: number;
  recommended_bits_min: number;
  recommended_bits_max: number;
  recommended_retail_value: number;
  recommended_starting_price: number;
  product_role: 'margin_carrier' | 'attractor' | 'unknown';
  suggested_bid_increment: number;
  strategy_note: string;
  weekly_margin_target_min?: number;
  weekly_margin_target_max?: number;
  current_estimated_bits_viable?: boolean;
  projected_revenue?: number;
  projected_profit?: number;
  projected_margin_percent?: number;
  projected_profit_min?: number;
  projected_profit_max?: number;
  projected_margin_min?: number;
  projected_margin_max?: number;
}

export interface AdminAuction {
  id: number;
  status: string;
  starting_price: number;
  current_price: number;
  bid_increment: number;
  remaining_seconds: number;
  total_bids: number;
  bits_consumed: number;
  closure_allowed: boolean;
  min_margin_percent: number;
  max_margin_percent: number;
  scheduled_at: string | null;
  ends_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  product: AdminProduct | null;
}

export interface WeeklyMarginReport {
  iso_year: number;
  iso_week: number;
  margin_percent: number;
  target_min_margin: number;
  target_max_margin: number;
  is_within_target: boolean;
  adjustment_factor: number;
  metrics: {
    auctions_ended: number;
    total_bits_consumed: number;
    total_bit_revenue: number;
    total_closing_prices: number;
    total_real_cost: number;
    total_revenue: number;
    net_profit: number;
  };
}

export interface WeeklySchedulePlan {
  iso_year: number;
  iso_week: number;
  target_min_margin: number;
  target_max_margin: number;
  actual: WeeklyMarginReport;
  scheduled: ScheduledAuctionPlanItem[];
  combined: {
    auctions_ended: number;
    auctions_scheduled: number;
    total_real_cost: number;
    total_revenue: number;
    net_profit: number;
    margin_percent: number;
    is_within_target: boolean;
  };
}

export interface ScheduledAuctionPlanItem {
  auction_id: number;
  product_id: number;
  product_name: string;
  real_cost: number;
  scheduled_at: string | null;
  planned_bits: number;
  planned_closing_price: number;
  product_role: string;
  projection: {
    bit_revenue: number;
    closing_price: number;
    total_revenue: number;
    net_profit: number;
    margin_percent: number;
  };
  is_margin_viable: boolean;
}

export interface MarginPreview {
  bit_value_eur: number;
  bits_consumed: number;
  bit_revenue: number;
  real_cost: number;
  min_margin_percent: number;
  max_margin_percent: number;
  min_total_revenue: number;
  max_total_revenue: number;
  closing_price_floor: number;
  closing_price_ceiling: number;
  is_range_valid: boolean;
  formula: string;
  strategy: MarginStrategy;
}

export interface MarginEvaluation {
  bit_revenue: number;
  closing_price_revenue: number;
  total_revenue: number;
  real_cost: number;
  net_profit: number;
  margin_percent: number;
  can_close: boolean;
  should_extend_timer: boolean;
  reason: string | null;
}

export interface WinnerShowcase {
  id: number;
  winner_name: string;
  product_name: string;
  short_description: string | null;
  image_url: string | null;
  final_price: number;
  retail_value: number;
  discount_percent: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateWinnerShowcasePayload {
  winner_name: string;
  product_name: string;
  short_description?: string;
  final_price: number;
  retail_value: number;
  sort_order?: number;
  is_active?: boolean;
  image?: File;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  real_cost: number;
  retail_value?: number;
  sku?: string;
  status?: string;
  estimated_bits?: number;
  images?: File[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  real_cost?: number;
  retail_value?: number;
  sku?: string;
  status?: string;
  estimated_bits?: number;
  images?: File[];
}

export interface CreateAuctionPayload {
  product_id: number;
  starting_price?: number;
  bid_increment?: number;
  initial_timer_seconds?: number;
  timer_extension_seconds?: number;
  min_margin_percent?: number;
  max_margin_percent?: number;
  start_immediately?: boolean;
  scheduled_at?: string;
  planned_bits?: number;
  planned_closing_price?: number;
}
