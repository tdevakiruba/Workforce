'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programSlug = searchParams.get('program')
  
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<{ programId: string } | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!programSlug) {
        setError('No program specified')
        setIsVerifying(false)
        return
      }

      try {
        // Check if the user has an active subscription for this program
        const res = await fetch('/api/subscription', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to verify subscription')
          setIsVerifying(false)
          return
        }

        // Find active subscription for this program
        const activeSub = data.subscriptions?.find(
          (sub: any) => sub.program?.slug === programSlug && sub.status === 'active'
        )

        if (activeSub) {
          setSubscription({ programId: activeSub.program_id })
          setIsVerifying(false)
        } else {
          setError('No active subscription found')
          setIsVerifying(false)
        }
      } catch (err) {
        console.error('[payment-success] Verification error:', err)
        setError('Failed to verify subscription')
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [programSlug])

  const dashboardUrl = programSlug 
    ? `/dashboard/${programSlug}/overview?start=day-1`
    : '/dashboard'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e14] via-[#1a1f2e] to-[#0f1419] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center shadow-2xl">
          {isVerifying ? (
            <>
              {/* Loading state */}
              <div className="mb-6 flex justify-center">
                <div className="relative size-20">
                  <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Processing Your Payment
              </h1>
              <p className="text-white/60">
                We&apos;re verifying your transaction. This usually takes a few seconds...
              </p>
            </>
          ) : error ? (
            <>
              {/* Error state */}
              <div className="mb-6 flex justify-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                  <svg className="size-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-white/60 mb-6">
                {error}
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full bg-white text-[#0a0e14] hover:bg-white/90"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Link href="/support">Contact Support</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/30 blur-xl" />
                  <div className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                    <CheckCircle className="size-12 text-emerald-400 animate-bounce" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-3">
                Payment Successful! 🎉
              </h1>
              
              <p className="text-white/70 mb-2">
                Welcome to your 21 Days of
              </p>
              <p className="text-xl font-semibold text-emerald-400 mb-6">
                Career Acceleration
              </p>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-8">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white mb-1">
                      You now have access to:
                    </p>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>✓ Full 21-day curriculum</li>
                      <li>✓ Day-1 content & first action</li>
                      <li>✓ Digital completion credential</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full mb-3 h-12 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Link href={dashboardUrl} className="flex items-center justify-center gap-2">
                  Go to Dashboard - Access Day 1
                  <ArrowRight className="size-5" />
                </Link>
              </Button>

              <p className="text-xs text-white/40">
                A confirmation email has been sent to your email address.
              </p>
            </>
          )}
        </div>

        {/* Footer message */}
        <p className="mt-8 text-center text-sm text-white/40">
          {isVerifying ? (
            'Verifying your subscription...'
          ) : error ? (
            'Need help? Contact our support team.'
          ) : (
            'Ready to start your acceleration journey!'
          )}
        </p>
      </div>
    </div>
  )
}

