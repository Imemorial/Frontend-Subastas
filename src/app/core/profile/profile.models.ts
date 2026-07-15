import { AuthUser } from '../auth/auth.models';

export interface ProfileUpdatePayload {
  name: string;
  last_name: string | null;
}

export interface UpdateEmailPayload {
  email: string;
  current_password: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface WalletTransaction {
  id: number;
  type: string;
  status: string;
  bits_delta: number;
  amount_eur: number;
  completed_at: string | null;
  created_at: string;
}

export interface ProfileUpdateResponse {
  message: string;
  user: AuthUser;
}

export interface TransactionsResponse {
  data: WalletTransaction[];
}

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  bit_purchase: 'Compra de Bits',
  bid_debit: 'Puja en subasta',
  product_payment: 'Pago de producto',
  refund: 'Reembolso',
  admin_adjustment: 'Recarga / ajuste',
};
