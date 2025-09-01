export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          customer_id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          customer_id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          canceled_at: string | null;
          paused_at: string | null;
          started_at: string | null;
          first_billed_at: string | null;
          subscription_id: string;
          subscription_status: string;
          price_id: string | null;
          product_id: string | null;
          scheduled_change: string | null;
          customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          canceled_at?: string | null;
          paused_at?: string | null;
          started_at?: string | null;
          first_billed_at?: string | null;
          subscription_id: string;
          subscription_status: string;
          price_id?: string | null;
          product_id?: string | null;
          scheduled_change?: string | null;
          customer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          canceled_at?: string | null;
          paused_at?: string | null;
          started_at?: string | null;
          first_billed_at?: string | null;
          subscription_id?: string;
          subscription_status?: string;
          price_id?: string | null;
          product_id?: string | null;
          scheduled_change?: string | null;
          customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          transaction_id: string;
          subscription_id: string | null;
          customer_id: string;
          status: string;
          amount: number | null;
          currency_code: string | null;
          billed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          transaction_id: string;
          subscription_id?: string | null;
          customer_id: string;
          status: string;
          amount?: number | null;
          currency_code?: string | null;
          billed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          transaction_id?: string;
          subscription_id?: string | null;
          customer_id?: string;
          status?: string;
          amount?: number | null;
          currency_code?: string | null;
          billed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Customer = Database['public']['Tables']['customers']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];

export interface CustomerData {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionData {
  id: string;
  status: string;
  customer_id: string;
  items?: Array<{
    price?: {
      id?: string;
      product_id?: string;
    };
  }>;
  scheduled_change?: {
    action: string;
    effective_at: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface TransactionData {
  id: string;
  subscription_id?: string;
  customer_id: string;
  status: string;
  currency_code?: string;
  billed_at?: string;
  created_at?: string;
  updated_at?: string;
  details?: {
    totals?: {
      grand_total?: {
        amount: string;
      };
    };
  };
}

export interface AddressData {
  customer_id: string;
}

export interface BusinessData {
  customer_id: string;
}

export interface GenericData {
  id: string;
}

export type PaddleWebhookData =
  | CustomerData
  | SubscriptionData
  | TransactionData
  | AddressData
  | BusinessData
  | GenericData;

export interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: PaddleWebhookData;
}
