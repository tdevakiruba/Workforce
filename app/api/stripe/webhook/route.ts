import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // If STRIPE_WEBHOOK_SECRET is set, verify the signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId
      const programId = session.metadata?.programId

      if (userId && programId) {
        try {
          // Create subscription in database
          await supabaseAdmin.from('wf-subscriptions').upsert({
            user_id: userId,
            program_id: programId,
            plan_tier: 'individual',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            amount_cents: session.amount_total,
            currency: session.currency,
          }, { onConflict: 'user_id,program_id' })

          // Create enrollment
          await supabaseAdmin.from('wf-enrollments').upsert({
            user_id: userId,
            program_id: programId,
            status: 'active',
            current_day: 1,
            started_at: new Date().toISOString(),
          }, { onConflict: 'user_id,program_id' })

          console.log(`Successfully created subscription for user ${userId} in program ${programId}`)
        } catch (error) {
          console.error('Error creating subscription:', error)
          return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
