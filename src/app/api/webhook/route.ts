// import { NextRequest, NextResponse } from 'next/server';
// import crypto from 'crypto';
// import { createClient } from '@/lib/supabase/client';
// import type {
//   PaddleWebhookEvent,
//   CustomerData,
//   SubscriptionData,
//   TransactionData,
//   AddressData,
//   BusinessData,
//   GenericData
// } from '@/lib/types';

// interface SubscriptionUpdatePayload {
//   subscription_status?: 
//     | 'trialing' 
//     | 'past_due' 
//     | 'paused' 
//     | 'active' 
//     | 'canceled';
//   scheduled_change?: string | null;
//   updated_at: string;
//   price_id?: string | null;
//   product_id?: string | null;
// }

// interface CustomerUpdatePayload {
//   updated_at: string;
// }

// function verifyPaddleSignature(rawBody: string, signature: string, secret: string): boolean {
//   console.log('Debug - Signature header:', signature);
//   console.log('Debug - Raw body length:', rawBody.length);
//   console.log('Debug - Secret length:', secret.length);
  
//   // Try different signature formats that Paddle might use
  
//   // Format 1: ts=timestamp;h1=hash (official format)
//   if (signature.includes('ts=') && signature.includes('h1=')) {
//     const parts = signature.split(';');
//     let timestamp = '';
//     let hash = '';
    
//     for (const part of parts) {
//       const [key, value] = part.split('=');
//       if (key === 'ts') {
//         timestamp = value;
//       } else if (key === 'h1') {
//         hash = value;
//       }
//     }
    
//     console.log('Debug - Format 1 - Parsed timestamp:', timestamp);
//     console.log('Debug - Format 1 - Parsed hash:', hash);
    
//     if (timestamp && hash) {
//       const payload = timestamp + ':' + rawBody;
//       const expectedSignature = crypto
//         .createHmac('sha256', secret)
//         .update(payload, 'utf8')
//         .digest('hex');
      
//       console.log('Debug - Format 1 - Expected signature:', expectedSignature);
//       console.log('Debug - Format 1 - Provided signature:', hash);
      
//       try {
//         return crypto.timingSafeEqual(
//           Buffer.from(expectedSignature, 'hex'), 
//           Buffer.from(hash, 'hex')
//         );
//       } catch (error) {
//         console.error('Debug - Format 1 - Error comparing signatures:', error);
//       }
//     }
//   }
  
//   // Format 2: Just the hash (some versions might use this)
//   if (signature.length === 64 && /^[a-f0-9]+$/i.test(signature)) {
//     console.log('Debug - Format 2 - Direct hash format');
//     const expectedSignature = crypto
//       .createHmac('sha256', secret)
//       .update(rawBody, 'utf8')
//       .digest('hex');
    
//     console.log('Debug - Format 2 - Expected signature:', expectedSignature);
//     console.log('Debug - Format 2 - Provided signature:', signature);
    
//     try {
//       return crypto.timingSafeEqual(
//         Buffer.from(expectedSignature, 'hex'), 
//         Buffer.from(signature, 'hex')
//       );
//     } catch (error) {
//       console.error('Debug - Format 2 - Error comparing signatures:', error);
//     }
//   }
  
//   // Format 3: sha256=hash (legacy format)
//   if (signature.startsWith('sha256=')) {
//     console.log('Debug - Format 3 - Legacy sha256 format');
//     const hash = signature.replace('sha256=', '');
//     const expectedSignature = crypto
//       .createHmac('sha256', secret)
//       .update(rawBody, 'utf8')
//       .digest('hex');
    
//     console.log('Debug - Format 3 - Expected signature:', expectedSignature);
//     console.log('Debug - Format 3 - Provided signature:', hash);
    
//     try {
//       return crypto.timingSafeEqual(
//         Buffer.from(expectedSignature, 'hex'), 
//         Buffer.from(hash, 'hex')
//       );
//     } catch (error) {
//       console.error('Debug - Format 3 - Error comparing signatures:', error);
//     }
//   }
  
//   console.log('Debug - No matching signature format found');
//   return false;
// }

// export async function POST(request: NextRequest): Promise<NextResponse> {
//   const supabase = createClient();

//   try {
//     const body = await request.text();
//     const signatureHeader = request.headers.get('paddle-signature');

//     if (!signatureHeader) {
//       return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
//     }

//     const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? '';
//     if (!webhookSecret) {
//       console.error('PADDLE_WEBHOOK_SECRET not set');
//       return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
//     }

//     // Verify the signature using Paddle Billing format
//     const isValidSignature = verifyPaddleSignature(body, signatureHeader, webhookSecret);
    
//     if (!isValidSignature) {
//       console.error('Signature verification failed');
//       console.log('Signature header:', signatureHeader);
//       console.log('Body preview:', body.substring(0, 200));
      
//       // For debugging purposes, you can temporarily comment out this return
//       // to see what events are coming through
//       return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
//     }

//     const event: PaddleWebhookEvent = JSON.parse(body);

//     console.log(`Received Paddle webhook: ${event.event_type} (ID: ${event.event_id})`);

//     switch (event.event_type) {
//       // Customer events
//       case 'customer.created':
//       case 'customer.updated': {
//         const customerData = event.data as CustomerData;
//         const payload = {
//           customer_id: customerData.id,
//           email: customerData.email ?? '',
//           created_at: customerData.created_at ?? event.occurred_at,
//           updated_at: customerData.updated_at ?? event.occurred_at,
//         };
//         const { error } = await supabase.from('customers').upsert(payload, {
//           onConflict: 'customer_id'
//         });
//         if (error) {
//           console.error(`Error on ${event.event_type}:`, error.message);
//         }
//         break;
//       }

//       // Subscription events
//       case 'subscription.created':
//       case 'subscription.activated': {
//         const data = event.data as SubscriptionData;
//         const payload = {
//           subscription_id: data.id,
//           subscription_status: data.status,
//           price_id: data.items?.[0]?.price?.id ?? null,
//           product_id: data.items?.[0]?.price?.product_id ?? null,
//           scheduled_change: data.scheduled_change
//             ? `${data.scheduled_change.action} on ${new Date(data.scheduled_change.effective_at).toLocaleDateString()}`
//             : null,
//           customer_id: data.customer_id,
//           created_at: data.created_at ?? event.occurred_at,
//           updated_at: data.updated_at ?? event.occurred_at,
//         };
//         const { error } = await supabase.from('subscriptions').upsert(payload, {
//           onConflict: 'subscription_id'
//         });
//         if (error) {
//           console.error(`Error on ${event.event_type}:`, error.message);
//         }
//         break;
//       }

//       case 'subscription.updated': {
//         const data = event.data as SubscriptionData;
//         const payload: SubscriptionUpdatePayload = {
//           subscription_status: data.status as SubscriptionUpdatePayload['subscription_status'],
//           updated_at: data.updated_at ?? event.occurred_at,
//           scheduled_change: data.scheduled_change
//             ? `${data.scheduled_change.action} on ${new Date(data.scheduled_change.effective_at).toLocaleDateString()}`
//             : null,
//         };

//         // If the price has changed, update the price_id and product_id
//         if (data.items?.[0]?.price?.id) {
//           payload.price_id = data.items[0].price.id;
//           payload.product_id = data.items[0].price.product_id;
//         }

//         const { error } = await supabase
//           .from('subscriptions')
//           .update(payload)
//           .eq('subscription_id', data.id);
//         if (error) {
//           console.error(`Error on ${event.event_type}:`, error.message);
//         }
//         break;
//       }

//       case 'subscription.trialing':
//       case 'subscription.past_due':
//       case 'subscription.paused':
//       case 'subscription.resumed':
//       case 'subscription.canceled': {
//         const data = event.data as SubscriptionData;
//         const subscriptionUpdatePayload: SubscriptionUpdatePayload = {
//           subscription_status:
//             event.event_type === 'subscription.resumed' ? 'active' :
//             event.event_type === 'subscription.trialing' ? 'trialing' :
//             event.event_type === 'subscription.past_due' ? 'past_due' :
//             event.event_type === 'subscription.paused' ? 'paused' :
//             'canceled',
//           updated_at: data.updated_at ?? event.occurred_at,
//           scheduled_change:
//             event.event_type === 'subscription.paused' && data.scheduled_change
//               ? `${data.scheduled_change.action} on ${new Date(data.scheduled_change.effective_at).toLocaleDateString()}`
//               : null,
//         };
//         const { error } = await supabase
//           .from('subscriptions')
//           .update(subscriptionUpdatePayload)
//           .eq('subscription_id', data.id);
//         if (error) {
//           console.error(`Error updating subscription status to ${subscriptionUpdatePayload.subscription_status}:`, error.message);
//         }
//         break;
//       }

//       // Transaction events
//       case 'transaction.created':
//       case 'transaction.updated':
//       case 'transaction.billed':
//       case 'transaction.paid':
//       case 'transaction.completed':
//       case 'transaction.canceled': {
//         const data = event.data as TransactionData;
//         const amount = data.details?.totals?.grand_total
//           ? parseInt(data.details.totals.grand_total.amount, 10)
//           : null;

//         const payload = {
//           transaction_id: data.id,
//           subscription_id: data.subscription_id ?? null,
//           customer_id: data.customer_id,
//           status: data.status,
//           amount,
//           currency_code: data.currency_code ?? null,
//           billed_at: data.billed_at ?? null,
//           created_at: data.created_at ?? event.occurred_at,
//           updated_at: data.updated_at ?? event.occurred_at,
//         };

//         const { error } = await supabase.from('transactions').upsert(payload, {
//           onConflict: 'transaction_id'
//         });
//         if (error) {
//           console.error(`Error on ${event.event_type}:`, error.message);
//         } else {
//           console.log(`Logged transaction event ${event.event_type}:`, data.id);
//         }

//         break;
//       }

//       // Payment method events - handle the event you're receiving
//       case 'payment_method.saved':
//       case 'payment_method.deleted': {
//         console.log(`Payment method event: ${event.event_type}`, event.data);
//         // You can add specific handling for payment method events here if needed
//         break;
//       }

//       // Address and Business events
//       case 'address.created':
//       case 'address.updated':
//       case 'business.created':
//       case 'business.updated': {
//         const data = event.data as AddressData | BusinessData;
//         const payload: CustomerUpdatePayload = {
//           updated_at: event.occurred_at,
//         };
//         const { error } = await supabase
//           .from('customers')
//           .update(payload)
//           .eq('customer_id', data.customer_id);
//         if (error) {
//           console.error(`Error updating customer due to ${event.event_type}:`, error.message);
//         }
//         break;
//       }

//       // Other events just logged
//       case 'discount.created':
//       case 'discount.updated':
//       case 'payout.created':
//       case 'payout.paid':
//       case 'price.created':
//       case 'price.updated':
//       case 'product.created':
//       case 'product.updated':
//       case 'report.created':
//       case 'report.updated': {
//         const data = event.data as GenericData;
//         console.log(`Logged event: ${event.event_type}, ID:`, data.id);
//         break;
//       }

//       default:
//         console.log('Unhandled Paddle event type:', event.event_type);
//         break;
//     }

//     return NextResponse.json({
//       success: true,
//       event_type: event.event_type,
//       event_id: event.event_id,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error: unknown) {
//     console.error('Webhook processing error:', error);
//     const message = error instanceof Error ? error.message : 'Unknown error';

//     return NextResponse.json(
//       {
//         error: 'Webhook processing failed',
//         details: message,
//       },
//       { status: 500 }
//     );
//   }
// }

// export const config = {
//   runtime: 'nodejs',
//   maxDuration: 29,
// };

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/client';
import type {
  PaddleWebhookEvent,
  CustomerData,
  SubscriptionData,
  TransactionData,
  AddressData,
  BusinessData,
  GenericData,
  Database
} from '@/lib/types';

interface SubscriptionUpdatePayload {
  subscription_status?: 
    | 'trialing' 
    | 'past_due' 
    | 'paused' 
    | 'active' 
    | 'canceled';
  scheduled_change?: string | null;
  updated_at: string;
  price_id?: string | null;
  product_id?: string | null;
}

interface CustomerUpdatePayload {
  updated_at: string;
}

// Helper function to ensure customer exists before creating related records
async function ensureCustomerExists(
  supabase: ReturnType<typeof createClient>, 
  customerId: string, 
  occurredAt: string
): Promise<void> {
  // Check if customer already exists
  const { data: existingCustomer, error: checkError } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('customer_id', customerId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking customer existence:', checkError.message);
    return;
  }

  // If customer doesn't exist, create a minimal record
  if (!existingCustomer) {
    console.log(`Creating missing customer record: ${customerId}`);
    const { error: insertError } = await supabase
      .from('customers')
      .insert({
        customer_id: customerId,
        email: '', // We'll update this when we get the customer.created webhook
        created_at: occurredAt,
        updated_at: occurredAt,
      } as Database['public']['Tables']['customers']['Insert']);

    if (insertError) {
      console.error('Error creating customer record:', insertError.message);
    } else {
      console.log(`Created customer record: ${customerId}`);
    }
  }
}

function verifyPaddleSignature(rawBody: string, signature: string, secret: string): boolean {
  // Try different signature formats that Paddle might use
  
  // Format 1: ts=timestamp;h1=hash (official format)
  if (signature.includes('ts=') && signature.includes('h1=')) {
    const parts = signature.split(';');
    let timestamp = '';
    let hash = '';
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') {
        timestamp = value;
      } else if (key === 'h1') {
        hash = value;
      }
    }
    
    if (timestamp && hash) {
      const payload = timestamp + ':' + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');
      
      try {
        return crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'hex'), 
          Buffer.from(hash, 'hex')
        );
      } catch (error) {
        console.error('Error comparing signatures:', error);
      }
    }
  }
  
  // Format 2: Just the hash (some versions might use this)
  if (signature.length === 64 && /^[a-f0-9]+$/i.test(signature)) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'), 
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      console.error('Error comparing signatures:', error);
    }
  }
  
  // Format 3: sha256=hash (legacy format)
  if (signature.startsWith('sha256=')) {
    const hash = signature.replace('sha256=', '');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'), 
        Buffer.from(hash, 'hex')
      );
    } catch (error) {
      console.error('Error comparing signatures:', error);
    }
  }
  
  return false;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();

  try {
    const body = await request.text();
    const signatureHeader = request.headers.get('paddle-signature');

    if (!signatureHeader) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? '';
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify the signature using Paddle Billing format
    const isValidSignature = verifyPaddleSignature(body, signatureHeader, webhookSecret);
    
    if (!isValidSignature) {
      console.error('Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: PaddleWebhookEvent = JSON.parse(body);

    console.log(`Received Paddle webhook: ${event.event_type} (ID: ${event.event_id})`);

    switch (event.event_type) {
      // Customer events
      case 'customer.created':
      case 'customer.updated': {
        const customerData = event.data as CustomerData;
        const payload: Database['public']['Tables']['customers']['Insert'] = {
          customer_id: customerData.id,
          email: customerData.email ?? '',
          created_at: customerData.created_at ?? event.occurred_at,
          updated_at: customerData.updated_at ?? event.occurred_at,
        };
        const { error } = await supabase.from('customers').upsert(payload, {
          onConflict: 'customer_id'
        });
        if (error) {
          console.error(`Error on ${event.event_type}:`, error.message);
        } else {
          console.log(`Customer ${event.event_type}: ${customerData.id}`);
        }
        break;
      }

      // Subscription events
      case 'subscription.created':
      case 'subscription.activated': {
        const data = event.data as SubscriptionData;
        
        // Ensure customer exists first
        await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);
        
        const payload: Database['public']['Tables']['subscriptions']['Insert'] = {
          subscription_id: data.id,
          subscription_status: data.status,
          price_id: data.items?.[0]?.price?.id ?? null,
          product_id: data.items?.[0]?.price?.product_id ?? null,
          scheduled_change: data.scheduled_change
            ? `${data.scheduled_change.action} on ${new Date(data.scheduled_change.effective_at).toLocaleDateString()}`
            : null,
          customer_id: data.customer_id,
          created_at: data.created_at ?? event.occurred_at,
          updated_at: data.updated_at ?? event.occurred_at,
        };
        const { error } = await supabase.from('subscriptions').upsert(payload, {
          onConflict: 'subscription_id'
        });
        if (error) {
          console.error(`Error on ${event.event_type}:`, error.message);
        } else {
          console.log(`Subscription ${event.event_type}: ${data.id}`);
        }
        break;
      }

      case 'subscription.updated': {
        const data = event.data as SubscriptionData;
        
        // Ensure customer exists first
        await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);
        
        const payload: SubscriptionUpdatePayload = {
          subscription_status: data.status as SubscriptionUpdatePayload['subscription_status'],
          updated_at: data.updated_at ?? event.occurred_at,
          scheduled_change: data.scheduled_change
            ? `${data.scheduled_change.action} on ${new Date(data.scheduled_change.effective_at).toLocaleDateString()}`
            : null,
        };

        // If the price has changed, update the price_id and product_id
        if (data.items?.[0]?.price?.id) {
          payload.price_id = data.items[0].price.id;
          payload.product_id = data.items[0].price.product_id;
        }

        const { error } = await supabase
          .from('subscriptions')
          .update(payload as Database['public']['Tables']['subscriptions']['Update'])
          .eq('subscription_id', data.id);
        if (error) {
          console.error(`Error on ${event.event_type}:`, error.message);
        } else {
          console.log(`Subscription updated: ${data.id}`);
        }
        break;
      }

      case 'subscription.trialing':
      case 'subscription.past_due':
      case 'subscription.paused':
      case 'subscription.resumed':
      case 'subscription.canceled': {
        const data = event.data as SubscriptionData;
        
        // Ensure customer exists first
        await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);
        
        const subscriptionUpdatePayload: SubscriptionUpdatePayload = {
          subscription_status:
            event.event_type === 'subscription.resumed' ? 'active' :
            event.event_type === 'subscription.trialing' ? 'trialing' :
            event.event_type === 'subscription.past_due' ? 'past_due' :
            event.event_type === 'subscription.paused' ? 'paused' :
            'canceled',
          updated_at: data.updated_at ?? event.occurred_at,
          scheduled_change:
            event.event_type === 'subscription.paused' && data.scheduled_change
              ? `${data.scheduled_change.action} on ${new Date(data.scheduled_change.effective_at).toLocaleDateString()}`
              : null,
        };
        const { error } = await supabase
          .from('subscriptions')
          .update(subscriptionUpdatePayload as Database['public']['Tables']['subscriptions']['Update'])
          .eq('subscription_id', data.id);
        if (error) {
          console.error(`Error updating subscription status to ${subscriptionUpdatePayload.subscription_status}:`, error.message);
        } else {
          console.log(`Subscription status updated to ${subscriptionUpdatePayload.subscription_status}: ${data.id}`);
        }
        break;
      }

      // Transaction events
      case 'transaction.created':
      case 'transaction.updated':
      case 'transaction.billed':
      case 'transaction.paid':
      case 'transaction.completed':
      case 'transaction.canceled': {
        const data = event.data as TransactionData;
        
        // Ensure customer exists first
        await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);
        
        const amount = data.details?.totals?.grand_total
          ? parseInt(data.details.totals.grand_total.amount, 10)
          : null;

        const payload: Database['public']['Tables']['transactions']['Insert'] = {
          transaction_id: data.id,
          subscription_id: data.subscription_id ?? null,
          customer_id: data.customer_id,
          status: data.status,
          amount,
          currency_code: data.currency_code ?? null,
          billed_at: data.billed_at ?? null,
          created_at: data.created_at ?? event.occurred_at,
          updated_at: data.updated_at ?? event.occurred_at,
        };

        const { error } = await supabase.from('transactions').upsert(payload, {
          onConflict: 'transaction_id'
        });
        if (error) {
          console.error(`Error on ${event.event_type}:`, error.message);
        } else {
          console.log(`Logged transaction event ${event.event_type}:`, data.id);
        }

        break;
      }

      // Handle transaction.ready event
      case 'transaction.ready': {
        const data = event.data as TransactionData;
        
        // Ensure customer exists first
        await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);
        
        const amount = data.details?.totals?.grand_total
          ? parseInt(data.details.totals.grand_total.amount, 10)
          : null;

        const payload: Database['public']['Tables']['transactions']['Insert'] = {
          transaction_id: data.id,
          subscription_id: data.subscription_id ?? null,
          customer_id: data.customer_id,
          status: data.status,
          amount,
          currency_code: data.currency_code ?? null,
          billed_at: data.billed_at ?? null,
          created_at: data.created_at ?? event.occurred_at,
          updated_at: data.updated_at ?? event.occurred_at,
        };

        const { error } = await supabase.from('transactions').upsert(payload, {
          onConflict: 'transaction_id'
        });
        if (error) {
          console.error(`Error on transaction.ready:`, error.message);
        } else {
          console.log(`Logged transaction ready event:`, data.id);
        }
        break;
      }

      // Payment method events - handle the event you're receiving
      case 'payment_method.saved':
      case 'payment_method.deleted': {
        console.log(`Payment method event: ${event.event_type}`, event.data);
        // You can add specific handling for payment method events here if needed
        break;
      }

      // Address and Business events
      case 'address.created':
      case 'address.updated':
      case 'business.created':
      case 'business.updated': {
        const data = event.data as AddressData | BusinessData;
        const payload: CustomerUpdatePayload = {
          updated_at: event.occurred_at,
        };
        const { error } = await supabase
          .from('customers')
          .update(payload as Database['public']['Tables']['customers']['Update'])
          .eq('customer_id', data.customer_id);
        if (error) {
          console.error(`Error updating customer due to ${event.event_type}:`, error.message);
        }
        break;
      }

      // Other events just logged
      case 'discount.created':
      case 'discount.updated':
      case 'payout.created':
      case 'payout.paid':
      case 'price.created':
      case 'price.updated':
      case 'product.created':
      case 'product.updated':
      case 'report.created':
      case 'report.updated': {
        const data = event.data as GenericData;
        console.log(`Logged event: ${event.event_type}, ID:`, data.id);
        break;
      }

      default:
        console.log('Unhandled Paddle event type:', event.event_type);
        break;
    }

    return NextResponse.json({
      success: true,
      event_type: event.event_type,
      event_id: event.event_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: message,
      },
      { status: 500 }
    );
  }
}

// Vercel configuration
export const runtime = 'nodejs';
export const maxDuration = 29;