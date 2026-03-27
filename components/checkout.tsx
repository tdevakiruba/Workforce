'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  productId: string
  programId: string
  programSlug: string
}

export default function Checkout({ productId, programId, programSlug }: CheckoutProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  // fetchClientSecret must be a stable callback
  const fetchClientSecret = async () => {
    const res = await fetch('/api/stripe/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        programId,
        programSlug,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      const message = data.error || `HTTP ${res.status}: Failed to create checkout session`
      setError(message)
      throw new Error(message)
    }

    const data = await res.json()
    if (!data.clientSecret) {
      const message = 'No client secret returned from server'
      setError(message)
      throw new Error(message)
    }

    // Store the session ID for use in onComplete
    sessionIdRef.current = data.sessionId

    return data.clientSecret as string
  }

  // Handle checkout completion - redirect to success page
  const handleComplete = () => {
    const sessionId = sessionIdRef.current
    router.push(`/payment-success?program=${programSlug}&session_id=${sessionId || ''}`)
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
          onClick={() => { setError(null) }}
          className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ 
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
