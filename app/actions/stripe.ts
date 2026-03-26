'use server'

import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

export async function startCheckoutSession(productId: string, programId: string) {
  console.log('[v0] startCheckoutSession called with:', { productId, programId })
  
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    console.log('[v0] Product not found:', productId)
    throw new Error(`Product with id "${productId}" not found`)
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('[v0] Auth result:', { userId: user?.id, email: user?.email, authError })
  
  if (!user) {
    console.log('[v0] User not authenticated')
    throw new Error('User not authenticated')
  }

  console.log('[v0] Creating Stripe checkout session for user:', user.id)

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    customer_email: user.email,
    metadata: {
      userId: user.id,
      programId: programId,
      productId: productId,
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  })

  console.log('[v0] Stripe session created:', session.id)
  return session.client_secret
}

export async function verifyPaymentAndCreateSubscription(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Retrieve the checkout session to verify payment
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  
  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed')
  }

  const programId = session.metadata?.programId
  if (!programId) {
    throw new Error('Program ID not found in session metadata')
  }

  // Create subscription in database
  const { error: subError } = await supabase.from('wf-subscriptions').upsert({
    user_id: user.id,
    program_id: programId,
    plan_tier: 'individual',
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    amount_cents: session.amount_total,
    currency: session.currency,
  }, { onConflict: 'user_id,program_id' })

  if (subError) {
    console.error('Error creating subscription:', subError)
    throw new Error('Failed to create subscription')
  }

  // Create or update enrollment
  const { error: enrollError } = await supabase.from('wf-enrollments').upsert({
    user_id: user.id,
    program_id: programId,
    status: 'active',
    current_day: 1,
    started_at: new Date().toISOString(),
  }, { onConflict: 'user_id,program_id' })

  if (enrollError) {
    console.error('Error creating enrollment:', enrollError)
    throw new Error('Failed to create enrollment')
  }

  return { success: true, programId }
}
