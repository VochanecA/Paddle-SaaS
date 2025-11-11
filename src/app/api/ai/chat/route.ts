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

interface SubscriptionCheckResult {
  hasAccess: boolean;
  debugInfo?: SubscriptionDebugInfo;
}

// Validation constants
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_TOKENS_LIMIT = 4000;

/**
 * Optimized subscription verification with single JOIN query
 * Returns both status and debug info in one call
 */
async function checkSubscriptionAccess(
  userId: string,
  userEmail: string,
  supabase: ReturnType<typeof createClient>
): Promise<SubscriptionCheckResult> {
  try {
    // Single optimized query with JOIN to get customer and subscriptions
    const { data, error } = await supabase
      .from('customers')
      .select(`
        customer_id,
        subscriptions (
          subscription_id,
          subscription_status,
          created_at
        )
      `)
      .eq('email', userEmail)
      .single();

    if (error || !data) {
      console.error('Customer lookup failed:', error);
      return {
        hasAccess: false,
        debugInfo: {
          userId,
          userEmail,
          customerId: undefined,
          subscriptionsFound: 0,
        },
      };
    }

    const subscriptions = Array.isArray(data.subscriptions) ? data.subscriptions : [];
    
    // Check for active or trialing subscriptions
    const hasActiveSubscription = subscriptions.some(
      sub => sub.subscription_status === 'active' || sub.subscription_status === 'trialing'
    );

    return {
      hasAccess: hasActiveSubscription,
      debugInfo: {
        userId,
        userEmail,
        customerId: data.customer_id,
        subscriptionsFound: subscriptions.length,
        subscriptions: subscriptions.map(sub => ({
          subscription_id: sub.subscription_id,
          subscription_status: sub.subscription_status,
          created_at: sub.created_at,
        })),
      },
    };
  } catch (err) {
    console.error('Subscription check failed:', err);
    return {
      hasAccess: false,
      debugInfo: {
        userId,
        userEmail,
        subscriptionsFound: 0,
      },
    };
  }
}

/**
 * Validate request payload
 */
function validateRequest(body: ChatRequest): string | null {
  if (!body.messages || !Array.isArray(body.messages)) {
    return 'Invalid messages format';
  }

  if (body.messages.length === 0) {
    return 'No messages provided';
  }

  if (body.messages.length > MAX_MESSAGES) {
    return `Too many messages (max: ${MAX_MESSAGES})`;
  }

  // Validate message content length
  for (const msg of body.messages) {
    if (msg.content && msg.content.length > MAX_MESSAGE_LENGTH) {
      return `Message exceeds maximum length (max: ${MAX_MESSAGE_LENGTH} chars)`;
    }
  }

  // Validate token limit
  if (body.maxTokens && body.maxTokens > MAX_TOKENS_LIMIT) {
    return `Token limit too high (max: ${MAX_TOKENS_LIMIT})`;
  }

  return null;
}

/**
 * POST handler for AI chat endpoint
 * Optimized with single DB query, validation, and error handling
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ChatResponse | { error: string; debug?: SubscriptionDebugInfo }>> {
  try {
    // Initialize Supabase client once
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Single authentication check - reuse user object
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body early for fail-fast
    const body: ChatRequest = await req.json();
    
    // Validate request before checking subscription
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Single optimized subscription check with debug info
    const subscriptionResult = await checkSubscriptionAccess(user.id, user.email, supabase);
    
    if (!subscriptionResult.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Subscription required',
          debug: subscriptionResult.debugInfo,
        },
        { status: 403 }
      );
    }

    // Verify OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'Server is not configured with an OpenRouter API key.' },
        { status: 500 }
      );
    }

    const { messages, model, temperature, maxTokens } = body;

    // Call OpenRouter API with optimized settings
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
          model: model ?? 'minimax/minimax-m2:free',
          messages,
          max_tokens: maxTokens ?? 1000,
          temperature: temperature ?? 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        error: errorText,
        userId: user.id,
      });
      
      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenRouter response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      content: data.choices[0].message.content,
      usage: data.usage ?? undefined,
    });
  } catch (error) {
    console.error('API /api/ai/chat error:', error);
    
    // Provide more specific error messages
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}