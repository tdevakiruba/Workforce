"use client"

import { useState, useEffect, use } from "react"
import { Shield, CheckCircle2, XCircle, Search, Calendar, Award, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface VerifiedCertificate {
  credentialId: string
  recipientName: string
  certificateType: "phase" | "program"
  phaseNumber: number | null
  phaseName: string | null
  phaseDescription: string | null
  phaseDays: string | null
  issuedAt: string
  program: {
    name: string
    slug: string
    color: string
    badge: string
    duration: string
  } | null
}

interface VerifyClientProps {
  searchParamsPromise: Promise<{ id?: string }>
}

export function VerifyClient({ searchParamsPromise }: VerifyClientProps) {
  const searchParams = use(searchParamsPromise)
  const [credentialId, setCredentialId] = useState(searchParams.id || "")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-verify if ID is provided in URL
  useEffect(() => {
    if (searchParams.id) {
      handleVerify(searchParams.id)
    }
  }, [searchParams.id])

  async function handleVerify(id?: string) {
    const idToVerify = id || credentialId.trim()
    if (!idToVerify) {
      setError("Please enter a credential ID")
      return
    }

    setIsVerifying(true)
    setVerified(null)
    setCertificate(null)
    setError(null)

    try {
      const res = await fetch(`/api/certificate/verify?id=${encodeURIComponent(idToVerify)}`)
      const data = await res.json()

      if (data.verified) {
        setVerified(true)
        setCertificate(data.certificate)
      } else {
        setVerified(false)
        setError(data.error || "Certificate not found")
      }
    } catch (err) {
      setVerified(false)
      setError("Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="https://workforceready.ai" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500">
              <span className="text-lg font-bold text-white">W</span>
            </div>
            <span className="text-lg font-bold text-foreground">WorkforceReady</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Title */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Shield className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Verify Certificate
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Enter a credential ID to verify its authenticity
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter credential ID (e.g., TH-WFR-A1B2C3D4-PROGRAM)"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              className="h-12 text-base"
            />
            <Button
              onClick={() => handleVerify()}
              disabled={isVerifying}
              className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600"
            >
              {isVerifying ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Search className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {verified === true && certificate && (
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
            {/* Verified Badge */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500">
                <CheckCircle2 className="size-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-600">Certificate Verified</h2>
                <p className="text-sm text-muted-foreground">This is an authentic credential</p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4 rounded-xl bg-card p-5 shadow-sm">
              {/* Recipient */}
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issued To</p>
                  <p className="text-lg font-semibold text-foreground">{certificate.recipientName}</p>
                </div>
              </div>

              {/* Credential */}
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credential</p>
                  <p className="text-lg font-semibold text-foreground">
                    {certificate.certificateType === "program"
                      ? `${certificate.program?.name} - Program Completion`
                      : `${certificate.phaseName} Mastery`}
                  </p>
                  {certificate.certificateType === "phase" && certificate.phaseDays && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Phase {certificate.phaseNumber}: {certificate.phaseDays}
                    </p>
                  )}
                </div>
              </div>

              {/* Program */}
              {certificate.program && (
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Program</p>
                    <p className="text-lg font-semibold text-foreground">{certificate.program.name}</p>
                    <p className="text-sm text-muted-foreground">{certificate.program.duration}</p>
                  </div>
                </div>
              )}

              {/* Issue Date */}
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(certificate.issuedAt)}</p>
                </div>
              </div>

              {/* Credential ID */}
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Credential ID</p>
                <p className="font-mono text-sm text-foreground">{certificate.credentialId}</p>
              </div>
            </div>

            {/* Issuer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Issued by</span>
              <span className="font-semibold text-foreground">Transformer Hub</span>
              <span>via</span>
              <Link href="https://workforceready.ai" className="font-semibold text-emerald-600 hover:underline">
                WorkforceReady
              </Link>
            </div>
          </div>
        )}

        {verified === false && (
          <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive">
                <XCircle className="size-7 text-white" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-destructive">Certificate Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                {error || "We could not find a certificate with this credential ID."}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Please double-check the credential ID and try again. If you believe this is an error,
                contact <a href="mailto:support@workforceready.ai" className="text-emerald-600 hover:underline">support@workforceready.ai</a>
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        {verified === null && !isVerifying && (
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-foreground">How to find your credential ID</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">1.</span>
                Look at the bottom of your downloaded certificate image
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">2.</span>
                Find the &quot;Credential ID&quot; field (format: TH-XXX-XXXXXXXX-XXX)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">3.</span>
                Enter the full ID above to verify
              </li>
            </ul>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WorkforceReady. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
