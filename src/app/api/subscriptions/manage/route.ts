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

    // KORISTITE PRAVI SECRET KEY
    const paddleApiKey = process.env.PADDLE_API_KEY;
    if (!paddleApiKey) {
      console.error('PADDLE_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('🔑 Using API Key:', paddleApiKey.substring(0, 20) + '...');

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

    // Probajte različite Paddle V2 endpoint-e
    const paddleMethod = 'PATCH';
    const paddleUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}`;

    let paddleBody: Record<string, unknown> = {};

    switch (action) {
      case 'pause':
        paddleBody = { paused: true };
        break;

      case 'cancel':
        paddleBody = {
          status: 'canceled',
          effective_from: immediate ? 'immediately' : 'next_billing_period',
        };
        break;

      case 'resume':
        paddleBody = { paused: false };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Log request details for debugging
    console.log('🚀 Paddle API Request:', {
      url: paddleUrl,
      method: paddleMethod,
      body: paddleBody,
      subscriptionId,
      action,
      immediate,
      api_key: paddleApiKey.substring(0, 10) + '...'
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
      console.error('Fetch error:', fetchError);
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
      console.error('JSON parse error:', responseText);
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
      console.error('❌ Paddle API Error:', {
        status: response.status,
        error: responseData.error,
        url: paddleUrl,
        method: paddleMethod
      });

      // Ako PATCH ne radi, probajte sa POST i specifičnim endpointima
      if (response.status === 403 || response.status === 404) {
        console.log('🔄 Trying alternative Paddle V2 endpoints...');
        
        let altUrl: string;
        const altMethod = 'POST';
        let altBody: Record<string, unknown> = {};

        switch (action) {
          case 'pause':
            altUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}/pause`;
            altBody = {};
            break;
          case 'cancel':
            altUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}/cancel`;
            altBody = {
              effective_from: immediate ? 'immediately' : 'next_billing_period',
            };
            break;
          case 'resume':
            altUrl = `${paddleBaseUrl}/subscriptions/${subscriptionId}/resume`;
            altBody = {};
            break;
          default:
            altUrl = paddleUrl;
            altBody = paddleBody;
        }

        console.log('🔄 Alternative request:', { altUrl, altMethod, altBody });

        const altResponse = await fetch(altUrl, {
          method: altMethod,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${paddleApiKey}`,
          },
          body: JSON.stringify(altBody),
        });

        const altResponseText = await altResponse.text();
        const altResponseData = altResponseText ? JSON.parse(altResponseText) : {};

        if (!altResponse.ok) {
          console.error('❌ Alternative endpoint also failed:', {
            status: altResponse.status,
            error: altResponseData.error
          });
          
          return NextResponse.json(
            {
              error: `Failed to ${action} subscription with Paddle`,
              details: altResponseData.error?.detail || `HTTP ${altResponse.status}`,
              paddle_error: altResponseData.error,
              request_id: altResponseData.meta?.request_id || 'unknown',
            },
            { status: altResponse.status }
          );
        }

        console.log(`✅ Subscription ${action} successful via alternative endpoint`);
        return NextResponse.json({
          success: true,
          message: `Subscription ${action} successful`,
          data: altResponseData.data,
          request_id: altResponseData.meta?.request_id
        });
      }

      return NextResponse.json(
        {
          error: `Failed to ${action} subscription with Paddle`,
          details: responseData.error?.detail || `HTTP ${response.status}`,
          paddle_error: responseData.error,
          request_id: responseData.meta?.request_id || 'unknown',
        },
        { status: response.status }
      );
    }

    console.log(`✅ Subscription ${action} successful:`, responseData.data);

    return NextResponse.json({
      success: true,
      message: `Subscription ${action} successful`,
      data: responseData.data,
      request_id: responseData.meta?.request_id
    });

  } catch (error: unknown) {
    console.error('Subscription management error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30;