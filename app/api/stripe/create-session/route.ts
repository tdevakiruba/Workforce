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

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()

    // Create Supabase client with proper cookie handling for API routes
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
              // Ignore cookie setting errors
            }
          },
        },
      }
    )

    // Get the authenticated user if available, but don't require it
    let user = null
    let userEmail = undefined
    
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        user = authUser
        userEmail = authUser.email ?? undefined
      }
    } catch {
      // User not authenticated - allow checkout to proceed anyway
    }

    // If no authenticated user, use email from request body if provided
    // For now, we'll proceed without email for unauthenticated users

    // Create Checkout Session with embedded_page mode (new Stripe API as of March 25, 2026)
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      redirect_on_completion: 'never',
      ...(userEmail && { customer_email: userEmail }),
      metadata: {
        ...(user && { userId: user.id }),
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
      sessionId: session.id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
