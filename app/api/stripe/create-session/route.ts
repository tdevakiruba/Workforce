import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, programId } = await req.json()

    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Initialize Supabase client with SSR for API routes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let userId: string | undefined
    let userEmail: string | undefined

    // Try to get authenticated user, but don't require it
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll()
              },
              setAll(cookiesToSet) {
                try {
                  cookiesToSet.forEach(({ name, value, options }) =>
                    cookieStore.set(name, value, options)
                  )
                } catch {
                  // Ignore cookie setting errors in read-only context
                }
              },
            },
          }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
          userEmail = user.email ?? undefined
        }
      } catch {
        // Ignore auth errors - allow checkout without auth
      }
    }

    // Create Checkout Session - works with or without authenticated user
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      ...(userEmail && { customer_email: userEmail }),
      metadata: {
        ...(userId && { userId }),
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

    return NextResponse.json({
      clientSecret: session.client_secret,
    })
  } catch (error) {
    console.error('[v0] Create session error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
