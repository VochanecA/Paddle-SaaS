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
//   GenericData,
//   Database
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
//   started_at?: string | null;
//   paused_at?: string | null;
//   canceled_at?: string | null;
// }

// interface CustomerUpdatePayload {
//   updated_at: string;
// }

// // Ensure customer exists
// async function ensureCustomerExists(
//   supabase: ReturnType<typeof createClient>, 
//   customerId: string, 
//   occurredAt: string
// ): Promise<void> {
//   const { data: existingCustomer, error: checkError } = await supabase
//     .from('customers')
//     .select('customer_id')
//     .eq('customer_id', customerId)
//     .single();

//   if (checkError && checkError.code !== 'PGRST116') {
//     console.error('Error checking customer existence:', checkError.message);
//     return;
//   }

//   if (!existingCustomer) {
//     console.log(`Creating missing customer record: ${customerId}`);
//     const { error: insertError } = await supabase
//       .from('customers')
//       .insert({
//         customer_id: customerId,
//         email: '',
//         created_at: occurredAt,
//         updated_at: occurredAt,
//       } as Database['public']['Tables']['customers']['Insert']);

//     if (insertError) {
//       console.error('Error creating customer record:', insertError.message);
//     } else {
//       console.log(`Created customer record: ${customerId}`);
//     }
//   }
// }

// // Verify Paddle webhook signature
// function verifyPaddleSignature(rawBody: string, signature: string, secret: string): boolean {
//   if (signature.includes('ts=') && signature.includes('h1=')) {
//     const parts = signature.split(';');
//     let timestamp = '';
//     let hash = '';
//     for (const part of parts) {
//       const [key, value] = part.split('=');
//       if (key === 'ts') timestamp = value;
//       else if (key === 'h1') hash = value;
//     }
//     if (timestamp && hash) {
//       const payload = timestamp + ':' + rawBody;
//       const expectedSignature = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
//       try {
//         return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(hash, 'hex'));
//       } catch {
//         return false;
//       }
//     }
//   }

//   if (signature.length === 64 && /^[a-f0-9]+$/i.test(signature)) {
//     const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
//     try {
//       return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(signature, 'hex'));
//     } catch {
//       return false;
//     }
//   }

//   if (signature.startsWith('sha256=')) {
//     const hash = signature.replace('sha256=', '');
//     const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
//     try {
//       return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(hash, 'hex'));
//     } catch {
//       return false;
//     }
//   }

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

//     if (!verifyPaddleSignature(body, signatureHeader, webhookSecret)) {
//       console.error('Signature verification failed');
//       return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
//     }

//     const event: PaddleWebhookEvent = JSON.parse(body);
//     console.log(`Received Paddle webhook: ${event.event_type} (ID: ${event.event_id})`);

//     switch (event.event_type) {
//       // Customer events
//       case 'customer.created':
//       case 'customer.updated': {
//         const customerData = event.data as CustomerData;
// const payload: Database['public']['Tables']['customers']['Insert'] = {
//   customer_id: customerData.id,
//   email: customerData.email ?? '',
//   created_at: event.occurred_at, // Use webhook timestamp
//   updated_at: event.occurred_at, // Fallback to webhook timestamp
// };

//         const { error } = await supabase.from('customers').upsert(payload, { onConflict: 'customer_id' });
//         if (error) console.error(`Error on ${event.event_type}:`, error.message);
//         break;
//       }

//       // Subscription events
//       case 'subscription.created':
//       case 'subscription.activated': {
//         const data = event.data as SubscriptionData;
//         await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);

//         const payload: Database['public']['Tables']['subscriptions']['Insert'] = {
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
//           started_at: new Date().toISOString(),
//           paused_at: null,
//           canceled_at: null,
//         };

//         const { error } = await supabase.from('subscriptions').upsert(payload, { onConflict: 'subscription_id' });
//         if (error) console.error(`Error on ${event.event_type}:`, error.message);
//         break;
//       }

//       case 'subscription.updated':
//       case 'subscription.trialing':
//       case 'subscription.past_due':
//       case 'subscription.paused':
//       case 'subscription.resumed':
//       case 'subscription.canceled': {
//         const data = event.data as SubscriptionData;
//         await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);

//         const now = new Date().toISOString();
//         const normalizedStatus: SubscriptionUpdatePayload['subscription_status'] =
//           event.event_type === 'subscription.resumed' ? 'active' :
//           event.event_type === 'subscription.trialing' ? 'trialing' :
//           event.event_type === 'subscription.past_due' ? 'past_due' :
//           event.event_type === 'subscription.paused' ? 'paused' :
//           event.event_type === 'subscription.canceled' ? 'canceled' :
//           data.status as SubscriptionUpdatePayload['subscription_status'];

//         const payload: SubscriptionUpdatePayload & Partial<Database['public']['Tables']['subscriptions']['Update']> = {
//           subscription_status: normalizedStatus,
//           updated_at: data.updated_at ?? event.occurred_at,
//           scheduled_change: data.scheduled_change
//             ? `${data.scheduled_change.action} on ${new Date(data.scheduled_change.effective_at).toLocaleDateString()}`
//             : null,
//         };

//         if (data.items?.[0]?.price?.id) {
//           payload.price_id = data.items[0].price.id;
//           payload.product_id = data.items[0].price.product_id;
//         }

//         // Update timestamps according to status
//         switch (normalizedStatus) {
//           case 'active':
//           case 'trialing':
//             payload.started_at = payload.started_at ?? now;
//             payload.paused_at = null;
//             payload.canceled_at = null;
//             break;
//           case 'paused':
//             payload.paused_at = now;
//             break;
//           case 'canceled':
//             payload.canceled_at = now;
//             break;
//         }

//         const { error } = await supabase
//           .from('subscriptions')
//           .update(payload as Database['public']['Tables']['subscriptions']['Update'])
//           .eq('subscription_id', data.id);

//         if (error) console.error(`Error updating subscription ${data.id} with status ${normalizedStatus}:`, error.message);
//         break;
//       }

//       // Transaction events
//       case 'transaction.created':
//       case 'transaction.updated':
//       case 'transaction.billed':
//       case 'transaction.paid':
//       case 'transaction.completed':
//       case 'transaction.canceled':
//       case 'transaction.ready': {
//         const data = event.data as TransactionData;
//         await ensureCustomerExists(supabase, data.customer_id, event.occurred_at);

//         const amount = data.details?.totals?.grand_total
//           ? parseInt(data.details.totals.grand_total.amount, 10)
//           : null;

//         const payload: Database['public']['Tables']['transactions']['Insert'] = {
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

//         const { error } = await supabase.from('transactions').upsert(payload, { onConflict: 'transaction_id' });
//         if (error) console.error(`Error on ${event.event_type}:`, error.message);
//         break;
//       }

//       // Address & Business
//       case 'address.created':
//       case 'address.updated':
//       case 'business.created':
//       case 'business.updated': {
//         const data = event.data as AddressData | BusinessData;
//         const payload: CustomerUpdatePayload = { updated_at: event.occurred_at };
//         const { error } = await supabase
//           .from('customers')
//           .update(payload as Database['public']['Tables']['customers']['Update'])
//           .eq('customer_id', data.customer_id);
//         if (error) console.error(`Error updating customer due to ${event.event_type}:`, error.message);
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
//     const message = error instanceof Error ? error.message : 'Unknown error occurred';
//     return NextResponse.json({ error: 'Webhook processing failed', details: message }, { status: 500 });
//   }
// }

// // Vercel configuration
// export const runtime = 'nodejs';
// export const maxDuration = 29;

export interface TransactionTotals {
  grand_total?: {
    amount: string;
    currency_code: string;
  };
  subtotal?: {
    amount: string;
    currency_code: string;
  };
  tax?: {
    amount: string;
    currency_code: string;
  };
  discount?: {
    amount: string;
    currency_code: string;
  };
}

export interface TransactionDetails {
  totals?: TransactionTotals;
  line_items?: Array<{
    price_id: string;
    quantity: number;
    totals?: TransactionTotals;
  }>;
}

export interface TransactionData {
  id: string;
  status: string;
  customer_id: string;
  subscription_id?: string;
  currency_code?: string;
  billed_at?: string;
  created_at?: string;
  updated_at?: string;
  totals?: TransactionTotals;
  details?: TransactionDetails;
}

export interface CustomerData {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface SubscriptionData {
  id: string;
  status: string;
  customer_id: string;
  address_id?: string;
  business_id?: string;
  currency_code?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  first_billed_at?: string;
  next_billed_at?: string;
  paused_at?: string;
  canceled_at?: string;
  ended_at?: string;
  items: Array<{
    price: {
      id: string;
      product_id: string;
    };
    quantity: number;
  }>;
  scheduled_change?: {
    action: string;
    effective_at: string;
    resumed_at?: string;
  };
  discount?: {
    id: string;
  };
}

export interface AddressData {
  id: string;
  customer_id: string;
  description?: string;
  first_line?: string;
  second_line?: string;
  city?: string;
  postal_code?: string;
  region?: string;
  country_code: string;
  custom_data?: unknown;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessData {
  id: string;
  customer_id: string;
  name: string;
  company_number?: string;
  tax_identifier?: string;
  status: string;
  created_at: string;
  updated_at: string;
  contacts: Array<{
    name: string;
    email: string;
  }>;
}

export interface GenericData {
  id: string;
  [key: string]: unknown;
}

export interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  data: CustomerData | SubscriptionData | TransactionData | AddressData | BusinessData | GenericData;
}

// Database types (adjust based on your Supabase schema)
export interface Database {
  public: {
    Tables: {
      customers: {
        Insert: {
          customer_id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Update: {
          email?: string;
          updated_at: string;
        };
      };
      subscriptions: {
        Insert: {
          subscription_id: string;
          subscription_status: string;
          price_id?: string | null;
          product_id?: string | null;
          scheduled_change?: string | null;
          customer_id: string;
          created_at: string;
          updated_at: string;
          started_at?: string | null;
          paused_at?: string | null;
          canceled_at?: string | null;
        };
        Update: {
          subscription_status?: string;
          price_id?: string | null;
          product_id?: string | null;
          scheduled_change?: string | null;
          updated_at: string;
          started_at?: string | null;
          paused_at?: string | null;
          canceled_at?: string | null;
        };
      };
      transactions: {
        Insert: {
          transaction_id: string;
          subscription_id?: string | null;
          customer_id: string;
          status: string;
          amount?: number | null;
          currency_code?: string | null;
          billed_at?: string | null;
          created_at: string;
          updated_at: string;
        };
        Update: {
          status?: string;
          amount?: number | null;
          currency_code?: string | null;
          billed_at?: string | null;
          updated_at: string;
        };
      };
    };
  };
}