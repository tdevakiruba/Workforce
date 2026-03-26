import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, programId } = await req.json()

    console.log('[v0] POST /api/stripe/create-session:', { productId, programId })

    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      console.log('[v0] Product not found:', productId)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[v0] Auth check:', { userId: user?.id, email: user?.email, authError })

    if (!user) {
      console.log('[v0] User not authenticated')
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
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
    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error('[v0] Create session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
