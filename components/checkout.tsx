'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  productId: string
  programId: string
  onComplete?: () => void
}

export default function Checkout({ productId, programId, onComplete }: CheckoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setIsLoading(true)
        console.log('[v0] initializeCheckout: calling /api/stripe/create-session')
        
        const res = await fetch('/api/stripe/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, programId }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to create checkout session')
        }

        const data = await res.json()
        const { clientSecret, sessionId } = data
        
        if (!clientSecret && !sessionId) {
          throw new Error('No session information received from server')
        }

        console.log('[v0] Session created, redirecting to Stripe checkout')

        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Stripe failed to load')
        }

        // For embedded_page mode, redirect to Stripe-hosted checkout using sessionId
        // The API now returns sessionId directly for embedded_page mode
        const id = sessionId || clientSecret?.split('_secret_')[0]
        
        if (!id) {
          throw new Error('Could not determine session ID')
        }

        // Redirect to Stripe checkout
        const result = await stripe.redirectToCheckout({
          sessionId: id,
        })

        if (result?.error) {
          throw new Error(result.error.message)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize checkout'
        console.error('[v0] checkout error:', err)
        setError(message)
        setIsLoading(false)
      }
    }

    initializeCheckout()
  }, [productId, programId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
        </div>
        <p className="text-muted-foreground">Loading secure checkout...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10">
          <svg className="size-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground">Something went wrong</h3>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
      </div>
      <p className="text-muted-foreground">Redirecting to secure checkout...</p>
    </div>
  )
}
