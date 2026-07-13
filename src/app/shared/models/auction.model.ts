export type AuctionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';

export interface AuctionProduct {
  id: number;
  name: string;
  imageUrl: string;
  retailValue: number;
  realCost?: number;
}

export interface AuctionBidder {
  id: number;
  name: string;
  avatarUrl: string;
}

export interface AuctionSummary {
  id: number;
  product: AuctionProduct;
  currentPrice: number;
  bidIncrement: number;
  remainingSeconds: number;
  totalBids: number;
  status: AuctionStatus;
  lastBidder: AuctionBidder | null;
  discountPercent?: number;
  scheduledAt?: string | null;
}

export interface TimerUpdateEvent {
  auctionId: number;
  remainingSeconds: number;
  endsAt?: string;
}

export interface BidPlacedEvent {
  auctionId: number;
  bidId: number;
  amount: number;
  user: AuctionBidder;
  placedAt: string;
  remainingSeconds: number;
}
