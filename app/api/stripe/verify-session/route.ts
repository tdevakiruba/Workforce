import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { sessionId } = await request.json()

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    // Don't require user auth here - Stripe provides the user ID via metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const programId = session.metadata?.programId
    const userId = session.metadata?.userId

    if (!programId || !userId) {
      return NextResponse.json({ error: 'Program ID or User ID not found in session' }, { status: 400 })
    }

    // Create Supabase client to write subscription data
    const supabase = await createClient()

    // Create subscription in database
    const { error: subError } = await supabase.from('wf-subscriptions').upsert({
      user_id: userId,
      program_id: programId,
      plan_tier: 'individual',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      amount_cents: session.amount_total,
      currency: session.currency,
    }, { onConflict: 'user_id,program_id' })

    if (subError) {
      console.error('Error creating subscription:', subError)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    // Create enrollment
    const { error: enrollError } = await supabase.from('wf-enrollments').upsert({
      user_id: userId,
      program_id: programId,
      status: 'active',
      current_day: 1,
      started_at: new Date().toISOString(),
    }, { onConflict: 'user_id,program_id' })

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError)
    }

    return NextResponse.json({ success: true, programId })
  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 })
  }
}
