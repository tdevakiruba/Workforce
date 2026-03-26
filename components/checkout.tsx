'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startCheckoutSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  productId: string
  programId: string
  onComplete?: () => void
}

export default function Checkout({ productId, programId, onComplete }: CheckoutProps) {
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    try {
      setLoading(true)
      console.log('[v0] fetchClientSecret: calling startCheckoutSession with:', { productId, programId })
      const clientSecret = await startCheckoutSession(productId, programId)
      console.log('[v0] fetchClientSecret: received clientSecret:', clientSecret?.substring(0, 20) + '...')
      if (!clientSecret) {
        throw new Error('Failed to create checkout session - no client secret returned')
      }
      return clientSecret
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session'
      console.error('[v0] fetchClientSecret error:', err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [productId, programId])

  const handleComplete = useCallback(async () => {
    try {
      setIsComplete(true)
      onComplete?.()
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        window.location.href = `/dashboard/${programId}`
      }, 2000)
    } catch (err) {
      console.error('[v0] Completion error:', err)
    }
  }, [onComplete, programId])

  if (loading) {
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
          onClick={() => { 
            setError(null)
            setIsComplete(false) 
          }}
          className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#00c892]/10">
          <svg className="size-8 text-[#00c892]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground">Payment Successful!</h3>
        <p className="mt-2 text-muted-foreground">Redirecting to your dashboard...</p>
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
