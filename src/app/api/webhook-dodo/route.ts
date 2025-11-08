// src/app/api/webhook-dodo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createHmac, timingSafeEqual } from 'crypto';

// Define interfaces for webhook event data
interface WebhookEvent {
  type: 'subscription.created' | 'subscription.canceled' | 'payment.succeeded' | 'payment.failed' | 'subscription.renewed';
  data: SubscriptionData | PaymentData;
  id: string;
  created_at: string;
}

interface SubscriptionData {
  id: string;
  customer_id: string;
  product_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

interface PaymentData {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed';
  customer_id: string;
  created_at: string;
}

// Define interface for customer record in Supabase
interface CustomerRecord {
  customer_id: string;
  email?: string;
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'none';
  updated_at: string;
}

// Define interface for webhook response
interface WebhookResponse {
  received: boolean;
  message?: string;
}

// This is your webhook secret. Store it securely in environment variables.
const WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET;

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse>> {
  try {
    // Get the signature from the request headers
    const signature = request.headers.get('dodo-signature');
    
    if (!signature) {
      return NextResponse.json(
        { received: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    // Get the raw body
    const body = await request.text();
    
    // Verify the signature
    const isValidSignature = verifySignature(body, signature, WEBHOOK_SECRET);
    
    if (!isValidSignature) {
      return NextResponse.json(
        { received: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    let event: WebhookEvent;
    try {
      event = JSON.parse(body) as WebhookEvent;
    } catch (parseError) {
      return NextResponse.json(
        { received: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data as SubscriptionData);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data as SubscriptionData);
        break;
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data as PaymentData);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.data as PaymentData);
        break;
      case 'subscription.renewed':
        await handleSubscriptionRenewed(event.data as SubscriptionData);
        break;
      default:
        console.log('Unhandled event type:', event.type);
        // Return success even for unhandled events to avoid duplicate sends
        return NextResponse.json({ received: true, message: 'Event received but not handled' });
    }

    return NextResponse.json({ received: true, message: 'Event processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { received: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Proper HMAC signature verification using ES6 imports
function verifySignature(payload: string, signature: string, secret: string | undefined): boolean {
  if (!secret) {
    console.error('Webhook secret is not configured');
    return false;
  }

  try {
    // Compute the HMAC
    const hmac = createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    const computedSignature = hmac.digest('hex');
    
    // Compare signatures using timingSafeEqual to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(computedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function handleSubscriptionCreated(data: SubscriptionData): Promise<void> {
  const supabase = createClient();
  
  const customerRecord: CustomerRecord = {
    customer_id: data.customer_id,
    email: data.customer_email,
    subscription_status: data.status,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('customers')
    .upsert(customerRecord, {
      onConflict: 'customer_id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Error updating customer on subscription created:', error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  console.log(`Subscription created for customer ${data.customer_id}`);
}

async function handleSubscriptionCanceled(data: SubscriptionData): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('customers')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', data.customer_id);

  if (error) {
    console.error('Error updating customer on subscription canceled:', error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  console.log(`Subscription canceled for customer ${data.customer_id}`);
}

async function handlePaymentSucceeded(data: PaymentData): Promise<void> {
  // Update customer status to active if payment succeeded
  const supabase = createClient();
  
  const { error } = await supabase
    .from('customers')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', data.customer_id);

  if (error) {
    console.error('Error updating customer on payment succeeded:', error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  console.log(`Payment succeeded for customer ${data.customer_id}, amount: ${data.amount} ${data.currency}`);
}

async function handlePaymentFailed(data: PaymentData): Promise<void> {
  // Update customer status to past_due if payment failed
  const supabase = createClient();
  
  const { error } = await supabase
    .from('customers')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', data.customer_id);

  if (error) {
    console.error('Error updating customer on payment failed:', error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  console.log(`Payment failed for customer ${data.customer_id}`);
}

async function handleSubscriptionRenewed(data: SubscriptionData): Promise<void> {
  // Update customer status and subscription period
  const supabase = createClient();
  
  const { error } = await supabase
    .from('customers')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', data.customer_id);

  if (error) {
    console.error('Error updating customer on subscription renewed:', error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  console.log(`Subscription renewed for customer ${data.customer_id}`);
}