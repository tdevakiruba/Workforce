import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await request.json()

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const programId = session.metadata?.programId

    if (!programId) {
      return NextResponse.json({ error: 'Program ID not found' }, { status: 400 })
    }

    // Verify the user matches
    if (session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 })
    }

    // Create subscription in database
    const { error: subError } = await supabase.from('wf-subscriptions').upsert({
      user_id: user.id,
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
      user_id: user.id,
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
