'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
  Brain,
  Target,
  ShieldCheck,
  RefreshCw,
  Lock,
} from 'lucide-react'
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
  /** true when the user previously had a subscription that is now expired or inactive */
  isExpired?: boolean
}

const FEATURES = [
  'Full 21-day curriculum with AI-powered scenarios',
  'Daily keynotes & implementation guides',
  '5 action steps per day with real-world artifacts',
  'Progress tracking & achievement streaks',
  'Digital completion credential for LinkedIn',
  'Access to peer community discussions',
]

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Secure checkout' },
  { icon: CheckCircle2, label: '7-day guarantee' },
  { icon: Lock, label: 'Encrypted payment' },
]

export function SubscriptionGate({
  program,
  userName,
  isExpired = false,
}: SubscriptionGateProps) {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const accent = program.color || '#00c892'

  const firstName = userName?.split(' ')[0]

  const handleCheckoutComplete = () => {
    setTimeout(() => {
      router.push(`/dashboard/${program.slug}/overview`)
      router.refresh()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-serif text-lg font-bold text-white">
            21 DAYS - ACCELERATION PROGRAM
          </span>
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: `${accent}40`, color: accent }}
          >
            {isExpired ? 'Renewal Required' : 'Get Access'}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero headline */}
        <div className="mb-12 text-center">
          {isExpired ? (
            <>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5">
                <RefreshCw className="size-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">
                  {firstName ? `${firstName}, your` : 'Your'} access has expired
                </span>
              </div>
              <h1 className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Renew Your Journey
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-white/60">
                Invest in your <span className="font-semibold text-white">21 Days of Career Acceleration</span> to become an AI-Ready Professional!
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5" style={{ borderColor: `${accent}30`, backgroundColor: `${accent}10` }}>
                <Sparkles className="size-4" style={{ color: accent }} />
                <span className="text-sm font-medium" style={{ color: accent }}>
                  {firstName ? `Welcome, ${firstName}` : 'Start your journey'}
                </span>
              </div>
              <h1 className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Invest in Your{' '}
                <span style={{ color: accent }}>Career Acceleration</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-white/60">
                Invest in your <span className="font-semibold text-white">21 Days of Career Acceleration</span> to become an AI-Ready Professional!
              </p>
            </>
          )}

          {/* Stat pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Zap, text: '21 Days' },
              { icon: Target, text: '5 Daily Actions' },
              { icon: Award, text: 'Verified Credential' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
              >
                <item.icon className="size-4" style={{ color: accent }} />
                <span className="text-sm font-medium text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column card layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — Features + Pricing */}
          <div className="flex flex-col gap-6">
            {/* Features card */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${accent}18` }}
                >
                  <Brain className="size-5" style={{ color: accent }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    What&apos;s included
                  </p>
                  <h2 className="text-base font-bold text-white">
                    Everything you need to accelerate
                  </h2>
                </div>
              </div>

              <ul className="space-y-3.5">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0"
                      style={{ color: accent }}
                    />
                    <span className="text-sm leading-relaxed text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing card */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    {isExpired ? 'Renewal price' : 'One-time investment'}
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="font-serif text-5xl font-extrabold text-white">$59</span>
                    <span className="text-xl text-white/30 line-through">$79</span>
                  </div>
                  <p className="mt-1.5 text-sm text-white/50">
                    Lifetime access &bull; No recurring fees
                  </p>
                </div>
                <div
                  className="rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: `${accent}20`, color: accent }}
                >
                  Save $20
                </div>
              </div>

              {/* Social proof */}
              <blockquote className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
                <p className="text-sm italic leading-relaxed text-white/50">
                  &ldquo;The 21 Days of Career Acceleration format was perfect. I built real habits around networking and communication that I still use every day.&rdquo;
                </p>
                <footer className="mt-3 text-sm font-semibold text-white/70">
                  Daniel Osei, Junior Analyst
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Right — Checkout or CTA */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
            {showCheckout ? (
              <div>
                <h2 className="mb-1 text-xl font-bold text-white">
                  Complete your purchase
                </h2>
                <p className="mb-6 text-sm text-white/50">
                  Secure payment via Stripe
                </p>
                <Checkout
                  productId="career-acceleration-21-days"
                  programId={program.id}
                  onComplete={handleCheckoutComplete}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col">
                {/* Icon */}
                <div
                  className="mb-8 flex size-16 items-center justify-center rounded-2xl self-start"
                  style={{ backgroundColor: `${accent}15` }}
                >
                  {isExpired ? (
                    <RefreshCw className="size-8" style={{ color: accent }} />
                  ) : (
                    <Zap className="size-8" style={{ color: accent }} />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white">
                  {isExpired
                    ? 'Pick up where you left off'
                    : 'Ready to transform your career?'}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {isExpired
                    ? 'Renew your access and continue your 21 Days of Career Acceleration Journey. Your progress is still saved.'
                    : 'Join thousands of professionals who have accelerated their careers with our proven AI-ready framework.'}
                </p>

                {/* CTA button */}
                <Button
                  size="lg"
                  className="mt-8 h-14 w-full rounded-xl text-base font-bold text-[#0a0e14] shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
                  style={{ backgroundColor: accent }}
                  onClick={() => setShowCheckout(true)}
                >
                  {isExpired ? 'Renew Access — $59' : 'Start Your Journey — $59'}
                </Button>

                <p className="mt-3 text-center text-xs text-white/30">
                  Secure payment powered by Stripe
                </p>

                {/* Trust badges */}
                <div className="mt-auto border-t border-white/[0.06] pt-6">
                  <div className="flex items-center justify-center gap-6">
                    {TRUST_BADGES.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 text-xs text-white/40"
                      >
                        <Icon className="size-3.5" />
                        <span>{label}</span>
                      </div>
                    ))}
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
