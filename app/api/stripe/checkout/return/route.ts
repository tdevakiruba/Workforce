import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      // Redirect to success page with session ID
      return NextResponse.redirect(
        new URL(`/dashboard?payment_success=true&session_id=${sessionId}`, request.url)
      )
    } else {
      // Payment not completed
      return NextResponse.redirect(
        new URL(`/dashboard?payment_success=false&session_id=${sessionId}`, request.url)
      )
    }
  } catch (error) {
    console.error('[v0] Return URL handler error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
