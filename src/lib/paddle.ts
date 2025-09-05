import { initializePaddle, type Paddle } from '@paddle/paddle-js';

// Paddle Billing v2 API response interfaces
interface PaddleError {
  code: string;
  detail: string;
  documentation_url?: string;
}

interface PaddleErrorResponse {
  error: PaddleError;
}

interface PaddleSuccessResponse<T = unknown> {
  data: T;
}

interface Subscription {
  id: string;
  status: string;
  items: Array<{
    price: {
      id: string;
    };
    quantity: number;
  }>;
  next_billed_at?: string;
  started_at?: string;
  created_at: string;
  updated_at: string;
}

interface CancelSubscriptionResponse {
  id: string;
  status: string;
  scheduled_change?: {
    action: string;
    effective_at: string;
  };
}

// Union type for API response
type PaddleApiResponse<T = unknown> = PaddleSuccessResponse<T> | PaddleErrorResponse;

// Configuration options for cancellation
export interface CancelSubscriptionOptions {
  effectiveFrom?: 'immediately' | 'next_billing_period' | 'at_period_end';
}

let paddleInstance: Paddle | null = null;

export const getPaddle = async (): Promise<Paddle> => {
  if (paddleInstance) {
    return paddleInstance;
  }

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!clientToken) {
    throw new Error('Paddle client token is not configured');
  }

  const result = await initializePaddle({
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
    token: clientToken,
  });

  if (!result) {
    throw new Error('Failed to initialize Paddle: initialization returned undefined');
  }

  paddleInstance = result;
  return paddleInstance;
};

export const openCheckout = async (priceId: string, email: string, customerId?: string): Promise<void> => {
  const paddle = await getPaddle();
  await paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: customerId ? { id: customerId } : { email },
    settings: {
      successUrl: `${window.location.origin}/account?checkout_success=true`,
    },
  });
};

// Server-side Paddle API functions for v2
const PADDLE_API_URL = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
  ? 'https://api.paddle.com'
  : 'https://api.sandbox.paddle.com';

const PADDLE_API_VERSION = '2024-01-01';

const getApiKey = (): string => {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error('Paddle API key is not configured');
  }
  return apiKey;
};

export const paddleAPI = async <T = unknown>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<PaddleSuccessResponse<T>> => {
  const apiKey = getApiKey();
  const url = `${PADDLE_API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Paddle-Version': PADDLE_API_VERSION,
      ...options.headers,
    },
    ...options,
  });

  const responseText = await response.text();
  let responseData: PaddleApiResponse<T>;

  try {
    responseData = JSON.parse(responseText) as PaddleApiResponse<T>;
  } catch (parseError) {
    console.error('Failed to parse Paddle response:', responseText);
    throw new Error(`Invalid JSON response from Paddle: ${responseText}`);
  }

  if (!response.ok) {
    const errorResponse = responseData as PaddleErrorResponse;
    console.error('Paddle API error:', {
      status: response.status,
      error: errorResponse.error,
      endpoint,
    });

    throw new Error(
      errorResponse.error?.detail || 
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return responseData as PaddleSuccessResponse<T>;
};

export const pauseSubscription = async (subscriptionId: string): Promise<PaddleSuccessResponse> => {
  return paddleAPI(`/subscriptions/${subscriptionId}/pause`, {
    method: 'POST',
    body: JSON.stringify({
      effective_from: 'next_billing_period',
    }),
  });
};


export const resumeSubscription = async (subscriptionId: string): Promise<PaddleSuccessResponse> => {
  return paddleAPI(`/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'active',
    }),
  });
};

// Additional v2 API helper functions
export const getSubscription = async (subscriptionId: string): Promise<PaddleSuccessResponse<Subscription>> => {
  return paddleAPI<Subscription>(`/subscriptions/${subscriptionId}`);
};

interface ListSubscriptionsFilters {
  status?: string;
  customer_id?: string;
  price_id?: string;
}

export const listSubscriptions = async (
  filters?: ListSubscriptionsFilters
): Promise<PaddleSuccessResponse<Subscription[]>> => {
  const queryParams = filters ? new URLSearchParams(
    Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString() : '';

  return paddleAPI<Subscription[]>(`/subscriptions${queryParams ? `?${queryParams}` : ''}`);
};

// Vercel edge runtime optimization
export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

// Utility function to check if running on Vercel
export const isVercel = (): boolean => {
  return process.env.VERCEL === '1';
};