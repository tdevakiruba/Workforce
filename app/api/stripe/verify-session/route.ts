import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    console.log('[v0][verify-session] Creating subscription for user:', userId, 'program:', programId, 'amount:', session.amount_total)

    // Create subscription in database using admin client to bypass RLS
    const { data: subData, error: subError } = await supabaseAdmin.from('wf-subscriptions').upsert({
      user_id: userId,
      program_id: programId,
      plan_tier: 'individual',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      amount_cents: session.amount_total,
      currency: session.currency,
    }, { onConflict: 'user_id,program_id' }).select()

    console.log('[v0][verify-session] Subscription upsert result:', { subData, subError })

    if (subError) {
      console.error('[v0][verify-session] Error creating subscription:', subError)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    // Create enrollment using admin client
    const { error: enrollError } = await supabaseAdmin.from('wf-enrollments').upsert({
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
