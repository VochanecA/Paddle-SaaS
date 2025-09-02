import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | null = null;

export const getPaddle = async (): Promise<Paddle> => {
  if (!paddleInstance) {
    const result = await initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    });
    if (!result) {
      throw new Error('Failed to initialize Paddle: initialization returned undefined');
    }
    paddleInstance = result;
  }
  return paddleInstance;
};

export const openCheckout = async (priceId: string, email: string, customerId?: string) => {
  const paddle = await getPaddle();
  return paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: customerId ? { id: customerId } : { email },
    settings: {
      successUrl: `${window.location.origin}/account?checkout_success=true'`, // Use settings.successUrl
    },
  });
};

// Server-side Paddle API functions
const PADDLE_API_URL = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' 
  ? 'https://api.paddle.com' 
  : 'https://sandbox-api.paddle.com';

export const paddleAPI = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${PADDLE_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Paddle API error: ${response.statusText}`);
  }

  return response.json();
};

export const pauseSubscription = async (subscriptionId: string) => {
  return paddleAPI(`/subscriptions/${subscriptionId}/pause`, {
    method: 'POST',
    body: JSON.stringify({
      effective_from: 'next_billing_period',
    }),
  });
};

export const cancelSubscription = async (subscriptionId: string) => {
  return paddleAPI(`/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({
      effective_from: 'next_billing_period',
    }),
  });
};

export const resumeSubscription = async (subscriptionId: string) => {
  return paddleAPI(`/subscriptions/${subscriptionId}/resume`, {
    method: 'POST',
  });
};