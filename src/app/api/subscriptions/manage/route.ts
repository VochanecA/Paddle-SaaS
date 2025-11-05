import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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

    // Pass the cookies instance to your Supabase client
    const supabase = createClient(cookies());

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
    // PADDLE V2 KORISTI DRUGAČIJE ENDPOINT-E!
    let paddleUrl: string;
    const paddleMethod: string = 'PATCH'; // Paddle V2 koristi PATCH za update
    let paddleBody: Record<string, unknown> = {};

    switch (action) {
      case 'pause':
        paddleUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}`;
        paddleBody = {
          status: 'paused' // Paddle V2: pause se radi preko status update
        };
        break;

      case 'cancel':
        paddleUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}`;
        paddleBody = {
          status: 'canceled',
          effective_from: immediate ? 'immediately' : 'next_billing_period',
        };
        break;

      case 'resume':
        paddleUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}`;
        paddleBody = {
          status: 'active' // Paddle V2: resume se radi preko status update
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Log request details for debugging
    console.log('Paddle Request Details:', {
      url: paddleUrl,
      method: paddleMethod,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paddleApiKey}` 
      },
      body: paddleBody,
      subscriptionId,
      action,
      immediate
    });

    let response;
    try {
      response = await fetch(paddleUrl, {
        method: paddleMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${paddleApiKey}`,
        },
        body: JSON.stringify(paddleBody),
      });
    } catch (fetchError) {
      console.error('Fetch error:', {
        error: fetchError,
        requestUrl: paddleUrl,
        requestBody: paddleBody,
        subscriptionId,
        action
      });
      return NextResponse.json(
        {
          error: 'Failed to connect to Paddle API',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        },
        { status: 500 }
      );
    }

    const responseText = await response.text();
    let responseData: PaddleApiResponse;

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('JSON parse error:', {
        responseText,
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        {
          error: 'Invalid response from Paddle API',
          details: 'Could not parse JSON response',
          responseText
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('Paddle API error response:', {
        status: response.status,
        statusText: response.statusText,
        responseData,
        requestUrl: paddleUrl,
        requestBody: paddleBody,
        subscriptionId,
        action
      });
      
      return NextResponse.json(
        {
          error: `Failed to ${action} subscription with Paddle`,
          details: responseData.error?.detail || responseData.error?.code || `HTTP ${response.status}: ${response.statusText}`,
          paddle_error: responseData.error,
          request_id: responseData.meta?.request_id || 'unknown',
        },
        { status: response.status }
      );
    }

    console.log(`✅ Subscription ${action} successful:`, {
      subscriptionId,
      responseData,
      request_id: responseData.meta?.request_id
    });

    return NextResponse.json({
      success: true,
      message: `Subscription ${action} successful`,
      data: responseData.data,
      request_id: responseData.meta?.request_id
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
        { 
          error: 'Internal server error', 
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
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