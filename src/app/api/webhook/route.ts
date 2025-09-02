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
  GenericData
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

function verifyPaddleSignature(rawBody: string, signature: string, secret: string): boolean {
  // Parse the signature header - Paddle Billing format: ts=timestamp;h1=hash
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
  
  if (!timestamp || !hash) {
    return false;
  }
  
  // Create the signed payload: timestamp + ':' + raw body
  const payload = timestamp + ':' + rawBody;
  
  // Compute the expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  // Compare signatures using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'), 
    Buffer.from(hash, 'hex')
  );
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
    if (!verifyPaddleSignature(body, signatureHeader, webhookSecret)) {
      console.error('Signature verification failed');
      console.log('Signature header:', signatureHeader);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: PaddleWebhookEvent = JSON.parse(body);

    console.log(`Received Paddle webhook: ${event.event_type} (ID: ${event.event_id})`);

    switch (event.event_type) {
      // Customer events
      case 'customer.created':
      case 'customer.updated': {
        const customerData = event.data as CustomerData;
        const payload = {
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
        }
        break;
      }

      // Subscription events
      case 'subscription.created':
      case 'subscription.activated': {
        const data = event.data as SubscriptionData;
        const payload = {
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
        }
        break;
      }

      case 'subscription.updated': {
        const data = event.data as SubscriptionData;
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
          .update(payload)
          .eq('subscription_id', data.id);
        if (error) {
          console.error(`Error on ${event.event_type}:`, error.message);
        }
        break;
      }

      case 'subscription.trialing':
      case 'subscription.past_due':
      case 'subscription.paused':
      case 'subscription.resumed':
      case 'subscription.canceled': {
        const data = event.data as SubscriptionData;
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
          .update(subscriptionUpdatePayload)
          .eq('subscription_id', data.id);
        if (error) {
          console.error(`Error updating subscription status to ${subscriptionUpdatePayload.subscription_status}:`, error.message);
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
        const amount = data.details?.totals?.grand_total
          ? parseInt(data.details.totals.grand_total.amount, 10)
          : null;

        const payload = {
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
          .update(payload)
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
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: message,
      },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 29,
};