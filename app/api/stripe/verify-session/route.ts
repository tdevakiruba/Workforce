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

  console.log('[v0][verify-session] API called with sessionId:', sessionId)

  if (!sessionId) {
    console.log('[v0][verify-session] Error: No session ID provided')
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    console.log('[v0][verify-session] Retrieving Stripe session...')
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log('[v0][verify-session] Stripe session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      metadata: session.metadata,
    })

    if (session.payment_status !== 'paid') {
      console.log('[v0][verify-session] Error: Payment status is not paid:', session.payment_status)
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const programId = session.metadata?.programId
    const userId = session.metadata?.userId

    console.log('[v0][verify-session] Metadata extracted:', { userId, programId })

    if (!programId || !userId) {
      console.log('[v0][verify-session] Error: Missing programId or userId in metadata')
      return NextResponse.json({ error: 'Program ID or User ID not found in session' }, { status: 400 })
    }

    console.log('[v0][verify-session] Creating subscription for user:', userId, 'program:', programId, 'amount:', session.amount_total)

    // Check if subscription already exists
    const { data: existingSub } = await supabaseAdmin
      .from('wf-subscriptions')
      .select('id, status, current_period_end')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .maybeSingle()

    console.log('[v0][verify-session] Existing subscription:', existingSub)

    // Create or update subscription in database using admin client to bypass RLS
    const now = new Date()
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    
    let subData, subError

    if (existingSub) {
      // Update existing subscription (renewal case)
      console.log('[v0][verify-session] Updating existing subscription:', existingSub.id)
      const { data, error } = await supabaseAdmin
        .from('wf-subscriptions')
        .update({
          plan_tier: 'individual',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: oneYearFromNow.toISOString(),
          amount_cents: session.amount_total,
          currency: session.currency,
          updated_at: now.toISOString(),
        })
        .eq('id', existingSub.id)
        .select()
      
      subData = data
      subError = error
    } else {
      // Create new subscription
      console.log('[v0][verify-session] Creating new subscription')
      const { data, error } = await supabaseAdmin
        .from('wf-subscriptions')
        .insert({
          user_id: userId,
          program_id: programId,
          plan_tier: 'individual',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: oneYearFromNow.toISOString(),
          amount_cents: session.amount_total,
          currency: session.currency,
        })
        .select()
      
      subData = data
      subError = error
    }

    console.log('[v0][verify-session] Subscription result:', { subData, subError })

    if (subError) {
      console.error('[v0][verify-session] Error creating subscription:', subError)
      return NextResponse.json({ error: `Failed to create subscription: ${subError.message}` }, { status: 500 })
    }

    console.log('[v0][verify-session] Subscription created successfully:', subData)

    // Create enrollment using admin client
    const enrollmentPayload = {
      user_id: userId,
      program_id: programId,
      status: 'active',
      current_day: 1,
      started_at: new Date().toISOString(),
    }

    console.log('[v0][verify-session] Creating enrollment with payload:', enrollmentPayload)

    const { error: enrollError } = await supabaseAdmin.from('wf-enrollments').upsert(enrollmentPayload, { onConflict: 'user_id,program_id' })

    if (enrollError) {
      console.error('[v0][verify-session] Error creating enrollment:', enrollError)
    } else {
      console.log('[v0][verify-session] Enrollment created successfully')
    }

    console.log('[v0][verify-session] Payment verification complete - returning success')
    return NextResponse.json({ success: true, programId })
  } catch (error) {
    console.error('[v0][verify-session] Unexpected error:', error)
    return NextResponse.json({ error: `Failed to verify session: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}
