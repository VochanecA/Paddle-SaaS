// // src/app/api/ai/chat/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { AIMessage } from '@/lib/ai';

// interface ChatRequest {
//   messages: AIMessage[];
//   model?: string;
//   maxTokens?: number;
//   temperature?: number;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { messages, model, maxTokens, temperature }: ChatRequest = await req.json();

//     if (!process.env.OPENROUTER_API_KEY) {
//       return NextResponse.json(
//         { error: 'Server is not configured with an OpenRouter API key.' },
//         { status: 500 }
//       );
//     }

//     const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         'Content-Type': 'application/json',
//         'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourapp.vercel.app',
//         'X-Title': 'AI Service',
//       },
//       body: JSON.stringify({
//         model: model ?? 'deepseek/deepseek-chat-v3.1:free',
//         messages,
//         max_tokens: maxTokens ?? 1000,
//         temperature: temperature ?? 0.7,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       return NextResponse.json(
//         { error: `OpenRouter API error: ${response.status} - ${errorText}` },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();

//     return NextResponse.json({
//       content: data.choices[0]?.message?.content ?? 'No response generated',
//       usage: data.usage ?? null,
//     });
//   } catch (error) {
//     console.error('API /api/ai/chat error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/ai/chat/route.ts
// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { AIMessage } from '@/lib/ai';

// Define interfaces for type safety
interface ChatRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

interface SubscriptionDebugInfo {
  userId: string;
  userEmail?: string;
  customerId?: string;
  subscriptionsFound: number;
  subscriptions?: Array<{
    subscription_id: string;
    subscription_status: string;
    created_at: string;
  }>;
}

/**
 * Utility function to verify if a user has an active subscription
 * @param userId - The user's ID to check
 * @param supabase - Supabase client instance
 * @returns Promise<boolean> - True if user has an active subscription
 */
async function hasActiveSubscription(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<boolean> {
  try {
    // Get user's email to find the customer record
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not found:', userError);
      return false;
    }
    
    // Get customer by email (matching SubscriptionManager approach)
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', user.email)
      .single();

    if (customerError || !customer) {
      console.error('Customer not found:', customerError);
      return false;
    }

    // Get subscriptions for this customer
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', customer.customer_id);

    if (subscriptionsError) {
      console.error('Subscriptions query error:', subscriptionsError);
      return false;
    }

    // Log subscription details for debugging
    console.log('User subscriptions:', {
      userId,
      customerId: customer.customer_id,
      subscriptions: subscriptions || [],
    });

    // Check for active or trialing subscriptions
    const activeSubscriptions = subscriptions?.filter(
      (sub): sub is typeof sub & { subscription_status: 'active' | 'trialing' } =>
        sub.subscription_status === 'active' || sub.subscription_status === 'trialing'
    ) || [];

    return activeSubscriptions.length > 0;
  } catch (err) {
    console.error('Subscription check failed:', err);
    return false;
  }
}

/**
 * POST handler for AI chat endpoint
 * Processes chat messages through OpenRouter API
 * Requires authentication and active subscription
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ChatResponse | { error: string; debug?: SubscriptionDebugInfo }>> {
  try {
    // Initialize Supabase client with cookies
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify active subscription
    const subscribed = await hasActiveSubscription(user.id, supabase);
    
    if (!subscribed) {
      // Get more debug info for the subscription check
      try {
        // Get user's email
        const { data: { user: userData } } = await supabase.auth.getUser();
        
        // Get customer record
        const { data: customer } = await supabase
          .from('customers')
          .select('customer_id')
          .eq('email', userData?.email)
          .single();
          
        // Get all subscriptions for this customer
        const { data: allSubscriptions } = await supabase
          .from('subscriptions')
          .select('subscription_id, subscription_status, created_at')
          .eq('customer_id', customer?.customer_id || '');
          
        const debugInfo: SubscriptionDebugInfo = {
          userId: user.id,
          userEmail: userData?.email,
          customerId: customer?.customer_id,
          subscriptionsFound: allSubscriptions?.length || 0,
          subscriptions: allSubscriptions || undefined,
        };
          
        return NextResponse.json(
          { 
            error: 'Subscription required',
            debug: debugInfo,
          },
          { status: 403 }
        );
      } catch (debugError) {
        console.error('Debug info collection failed:', debugError);
        return NextResponse.json(
          { error: 'Subscription required' },
          { status: 403 }
        );
      }
    }

    // Parse and validate request body
    const body: ChatRequest = await req.json();
    const { messages, model, temperature, maxTokens } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Verify OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'Server is not configured with an OpenRouter API key.' },
        { status: 500 }
      );
    }

    // Call OpenRouter API
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourapp.vercel.app',
          'X-Title': 'AI Service',
        },
        body: JSON.stringify({
  //* 'deepseek/deepseek-chat-v3.1:free',
/*           z-ai/glm-4.5-air:free",
            tngtech/deepseek-r1t2-chimera:free
            tngtech/deepseek-r1t-chimera:free
            deepseek/deepseek-chat-v3-0324:free
            deepseek/deepseek-r1-0528:free */
// deepseek/deepseek-r1-0528:free
// minimax/minimax-m2:free
 model: model ?? 'minimax/minimax-m2:free',

          messages,
          max_tokens: maxTokens ?? 1000,
          temperature: temperature ?? 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      content: data.choices[0]?.message?.content ?? 'No response generated',
      usage: data.usage ?? null,
    });
  } catch (error) {
    console.error('API /api/ai/chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}