'use client'

import { useState } from 'react'
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
  onComplete?: () => void
}

export default function Checkout({ productId, programId, onComplete }: CheckoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = async () => {
    try {
      console.log("[v0] fetchClientSecret: starting request to /api/stripe/create-session")
      const res = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, programId }),
      })

      console.log("[v0] fetchClientSecret: response status", res.status)

      if (!res.ok) {
        const data = await res.json()
        console.log("[v0] fetchClientSecret: error response", { status: res.status, data })
        
        // If authentication is required, redirect to sign in
        if (res.status === 401 || data.code === 'AUTH_REQUIRED') {
          const currentPath = window.location.pathname
          console.log("[v0] fetchClientSecret: redirecting to signin from", currentPath)
          router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`)
          throw new Error('Please sign in to continue with your purchase')
        }
        
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const data = await res.json()
      const { clientSecret } = data
      
      console.log("[v0] fetchClientSecret: received clientSecret", { clientSecret: clientSecret ? 'present' : 'missing' })
      
      if (!clientSecret) {
        throw new Error('No client secret received from server')
      }

      setIsLoading(false)
      return clientSecret
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session'
      console.log("[v0] fetchClientSecret: error", message)
      setError(message)
      throw err
    }
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

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete: onComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
