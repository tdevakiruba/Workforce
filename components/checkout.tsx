'use client'

import { useEffect, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  productId: string
  programId: string
  onComplete?: () => void
}

export default function Checkout({ productId, programId, onComplete }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSecret = async () => {
      try {
        console.log("[v0-checkout] Fetching client secret for:", { productId, programId })
        
        const res = await fetch('/api/stripe/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, programId }),
        })

        console.log("[v0-checkout] Response status:", res.status)

        if (!res.ok) {
          const data = await res.json()
          console.error("[v0-checkout] API error:", data)
          throw new Error(data.error || `HTTP ${res.status}: Failed to create checkout session`)
        }

        const data = await res.json()
        const { clientSecret: secret } = data
        
        console.log("[v0-checkout] Received client secret:", secret ? "YES" : "NO")
        
        if (!secret) {
          throw new Error('No client secret in response')
        }

        setClientSecret(secret)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create checkout session'
        console.error("[v0-checkout] Error:", message, err)
        setError(message)
      }
    }

    fetchSecret()
  }, [productId, programId])

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

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
        </div>
        <p className="text-muted-foreground">Loading secure checkout...</p>
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          clientSecret,
          onComplete: () => {
            // Extract session ID from clientSecret (format: cs_test_xxx_secret_yyy)
            const sessionId = clientSecret.split('_secret_')[0]
            if (onComplete) {
              onComplete()
            }
          },
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
