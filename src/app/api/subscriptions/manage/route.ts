import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pauseSubscription, cancelSubscription, resumeSubscription } from '@/lib/paddle';
import { cookies } from 'next/headers'; // Import the cookies function

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, action } = await request.json();
    
    if (!subscriptionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    // Perform the action
    let result;
    switch (action) {
      case 'pause':
        result = await pauseSubscription(subscriptionId);
        break;
      case 'cancel':
        result = await cancelSubscription(subscriptionId);
        break;
      case 'resume':
        result = await resumeSubscription(subscriptionId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log(`Subscription ${action} successful:`, subscriptionId);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Subscription management error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Internal server error' }, 
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
