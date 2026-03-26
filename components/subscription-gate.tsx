'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Sparkles, Zap, Award, Brain, Target, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Checkout from '@/components/checkout'

interface SubscriptionGateProps {
  program: {
    id: string
    slug: string
    name: string
    color?: string
  }
  userName?: string
}

const FEATURES = [
  'Full 21-day curriculum with AI-powered scenarios',
  'Daily keynotes & implementation guides',
  '5 action steps per day with real-world artifacts',
  'Progress tracking & achievement streaks',
  'Digital completion credential for LinkedIn',
  'Access to peer community discussions',
]

export function SubscriptionGate({ program, userName }: SubscriptionGateProps) {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const accentColor = program.color || '#00c892'

  const handleCheckoutComplete = () => {
    // Redirect to dashboard after successful payment
    setTimeout(() => {
      router.push(`/dashboard/${program.slug}/overview`)
      router.refresh()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e14] to-background">
      {/* Hero section */}
      <div className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 size-80 rounded-full bg-[#00c892]/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[#00a5ff]/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Lock icon */}
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <Lock className="size-10 text-white/60" />
            </div>
          </div>

          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Invest in Your Future
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
            {userName ? `Welcome back, ${userName.split(' ')[0]}! ` : ''}
            Invest in your 21 Days of Career Acceleration to become an AI-Ready Professional!
          </p>

          {/* Value proposition badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Zap, text: '21 Days' },
              { icon: Target, text: '5 Daily Actions' },
              { icon: Award, text: 'Verified Credential' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
              >
                <item.icon className="size-4" style={{ color: accentColor }} />
                <span className="text-sm font-medium text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left column - Features */}
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex size-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Sparkles className="size-6" style={{ color: accentColor }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-card-foreground">
                  21 DAYS - ACCELERATION PROGRAM
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your Career Acceleration Journey
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 
                    className="mt-0.5 size-5 shrink-0" 
                    style={{ color: accentColor }} 
                  />
                  <span className="text-base text-card-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Price display */}
            <div className="mt-8 rounded-2xl border bg-muted/30 p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl font-extrabold text-foreground">$59</span>
                <span className="text-lg text-muted-foreground line-through">$79</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                One-time payment. Lifetime access to your 21 Days of Career Acceleration Journey.
              </p>
            </div>

            {/* Testimonial */}
            <div className="mt-6 rounded-2xl border bg-muted/20 p-5">
              <p className="text-sm italic text-muted-foreground">
                &ldquo;The 21 Days of Career Acceleration format was perfect. I built real habits around networking and communication that I still use every day.&rdquo;
              </p>
              <p className="mt-3 text-sm font-semibold text-foreground">
                Daniel Osei, Junior Analyst
              </p>
            </div>
          </div>

          {/* Right column - Checkout or CTA */}
          <div className="rounded-3xl border border-border bg-card p-8">
            {showCheckout ? (
              <div>
                <h2 className="mb-4 text-xl font-bold text-card-foreground">
                  Complete Your Purchase
                </h2>
                <Checkout
                  productId="career-acceleration-21-days"
                  programId={program.id}
                  onComplete={handleCheckoutComplete}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div
                  className="mb-6 flex size-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <Brain className="size-10" style={{ color: accentColor }} />
                </div>

                <h2 className="text-2xl font-bold text-card-foreground">
                  Ready to Transform Your Career?
                </h2>
                <p className="mt-3 max-w-sm text-muted-foreground">
                  Join thousands of professionals who have accelerated their careers with our proven 21-day system.
                </p>

                <Button
                  size="lg"
                  className="mt-8 h-14 rounded-xl px-10 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl"
                  style={{ backgroundColor: accentColor }}
                  onClick={() => setShowCheckout(true)}
                >
                  Start Your Journey - $59
                </Button>

                <p className="mt-4 text-sm text-muted-foreground">
                  Secure payment powered by Stripe
                </p>

                {/* Trust badges */}
                <div className="mt-8 flex items-center justify-center gap-6 border-t pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="size-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4" />
                    <span>7-day Guarantee</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
