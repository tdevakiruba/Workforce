import { Suspense } from 'react'
import { PaymentSuccessContent } from './payment-success-content'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e14] via-[#1a1f2e] to-[#0f1419] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center shadow-2xl">
            <div className="mb-6 flex justify-center">
              <div className="relative size-20">
                <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-emerald-500 animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
