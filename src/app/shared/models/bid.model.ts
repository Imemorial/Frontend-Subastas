export interface LiveBid {
  id: number;
  auctionId: number;
  userName: string;
  userAvatarUrl: string;
  amount: number;
  placedAt: Date;
  isNew?: boolean;
}
