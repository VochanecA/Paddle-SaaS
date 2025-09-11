import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
//import type { Database } from '@/lib/types';

interface ManageSubscriptionRequest {
  subscriptionId: string;
  action: 'pause' | 'cancel' | 'resume';
  immediate?: boolean;
}

interface PaddleApiResponse {
  data?: unknown;
  error?: {
    code: string;
    detail: string;
    type: string;
  };
  meta?: {
    request_id: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { subscriptionId, action, immediate = false }: ManageSubscriptionRequest = body;

    if (!subscriptionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId and action are required' },
        { status: 400 }
      );
    }

    if (!['pause', 'cancel', 'resume'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: pause, cancel, resume' },
        { status: 400 }
      );
    }

    // Verify environment variables
    const paddleApiKey = process.env.PADDLE_API_KEY;
    if (!paddleApiKey) {
      console.error('PADDLE_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const paddleBaseUrl = process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox'
      ? 'https://sandbox-api.paddle.com'
      : 'https://api.paddle.com';

    // Log request details for debugging
    console.log('Paddle Request:', {
      url: `${paddleBaseUrl}/subscriptions/${subscriptionId}/${action}`,
      headers: { Authorization: `Bearer ${paddleApiKey}` },
      body: { subscriptionId, action, immediate },
    });

    // Pass the cookies instance to your Supabase client
    const supabase = createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this subscription
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', user.email!)
      .single();

    if (customerError || !customer) {
      console.error('Customer lookup failed:', customerError);
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .eq('customer_id', customer.customer_id)
      .single();

    if (subscriptionError || !subscription) {
      console.error('Subscription lookup failed:', subscriptionError);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Perform the action with Paddle API
    let paddleUrl: string;
    let paddleBody: Record<string, unknown> = {};

    switch (action) {
      case 'pause':
        paddleUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}/pause`;
        paddleBody = {};
        break;

      case 'cancel':
        paddleUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}/cancel`;
        paddleBody = {
          effective_from: immediate ? 'immediately' : 'next_billing_period',
        };
        break;

      case 'resume':
        paddleUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}/resume`;
        paddleBody = {};
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    let response;
    try {
      response = await fetch(paddleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${paddleApiKey}`,
        },
        body: JSON.stringify(paddleBody),
      });
    } catch (fetchError) {
      console.error('Fetch error:', {
        error: fetchError,
        requestUrl: paddleUrl,
        requestBody: paddleBody,
        headers: { Authorization: `Bearer ${paddleApiKey}` },
      });
      return NextResponse.json(
        {
          error: 'Failed to connect to Paddle API',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        },
        { status: 500 }
      );
    }

    const responseData: PaddleApiResponse = await response.json();

    if (!response.ok) {
      console.error('Paddle API error:', {
        status: response.status,
        responseData,
        requestUrl: paddleUrl,
        requestBody: paddleBody,
        headers: { Authorization: `Bearer ${paddleApiKey}` },
      });
      return NextResponse.json(
        {
          error: 'Failed to manage subscription with Paddle',
          details: responseData.error?.detail || `HTTP ${response.status}`,
          request_id: responseData.meta?.request_id || 'unknown',
        },
        { status: response.status }
      );
    }

    console.log(`Subscription ${action} successful:`, subscriptionId);

    return NextResponse.json({
      success: true,
      message: `Subscription ${action} successful`,
      data: responseData.data,
    });

  } catch (error: unknown) {
    console.error('Subscription management error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30;