// lib/dodo.ts
export interface DodoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  interval_count?: number;
  trial_period_days?: number;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface DodoSubscription {
  id: string;
  product_id: string;
  customer_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionParams {
  product_id: string;
  customer_id: string;
  payment_method_id?: string;
  trial_period_days?: number;
  metadata?: Record<string, string>;
}

class DodoPayments {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Remove the /v1 prefix since it might be causing issues
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making request to:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Request failed:', error);
      
      // If it's a network error, provide a more helpful message
      if (error instanceof Error && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the payment service. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  // Products - try different endpoint paths
  async getProducts(): Promise<DodoProduct[]> {
    try {
      // First try without /v1 prefix
      return await this.request<DodoProduct[]>('/products');
    } catch (error) {
      console.log('First attempt failed, trying with /v1 prefix');
      // If that fails, try with /v1 prefix
      return await this.request<DodoProduct[]>('/v1/products');
    }
  }

  async getProduct(id: string): Promise<DodoProduct> {
    try {
      return await this.request<DodoProduct>(`/products/${id}`);
    } catch (error) {
      return await this.request<DodoProduct>(`/v1/products/${id}`);
    }
  }

  // Subscriptions - try different endpoint paths
  async getSubscriptions(): Promise<DodoSubscription[]> {
    try {
      // First try without /v1 prefix
      return await this.request<DodoSubscription[]>('/subscriptions');
    } catch (error) {
      console.log('First attempt failed, trying with /v1 prefix');
      // If that fails, try with /v1 prefix
      return await this.request<DodoSubscription[]>('/v1/subscriptions');
    }
  }

  async getSubscription(id: string): Promise<DodoSubscription> {
    try {
      return await this.request<DodoSubscription>(`/subscriptions/${id}`);
    } catch (error) {
      return await this.request<DodoSubscription>(`/v1/subscriptions/${id}`);
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<DodoSubscription> {
    try {
      return await this.request<DodoSubscription>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (error) {
      return await this.request<DodoSubscription>('/v1/subscriptions', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    }
  }

  async cancelSubscription(id: string): Promise<DodoSubscription> {
    try {
      return await this.request<DodoSubscription>(`/subscriptions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return await this.request<DodoSubscription>(`/v1/subscriptions/${id}`, {
        method: 'DELETE',
      });
    }
  }
}

// Initialize Dodo Payments client
export function initializeDodoPayments() {
  const apiKey = process.env.NEXT_PUBLIC_DODO_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_DODO_BASE_URL || 'https://api.dodopayments.com';
  
  console.log('Initializing Dodo Payments with:', { 
    hasApiKey: !!apiKey, 
    baseUrl,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
  });

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_DODO_API_KEY environment variable is not set');
  }

  return new DodoPayments(apiKey, baseUrl);
}

// Export the class for direct usage if needed
export { DodoPayments };