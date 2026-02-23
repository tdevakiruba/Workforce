"use client"

import { Award, Lock, Download, CheckCircle2, Linkedin, Mail, Shield, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState, useCallback } from "react"

interface Certificate {
  id: string
  title: string
  phaseName: string
  phaseLetter: string
  description: string
  daysLabel: string
  isEarned: boolean
  earnedDate: string | null
  phaseNumber: number
}

interface CertificatesClientProps {
  program: {
    slug: string
    name: string
    badgeColor: string
    badge: string
    totalDays: number
  }
  enrollmentId: string
  currentDay: number
  certificates: Certificate[]
  userName: string
  userEmail: string
}

/* ------------------------------------------------------------------ */
/* Certificate canvas renderer – draws a professional credential      */
/* ------------------------------------------------------------------ */
function drawCertificate(
  canvas: HTMLCanvasElement,
  data: {
    userName: string
    title: string
    subtitle: string
    credentialId: string
    issuedDate: string
    issuer: string
    programName: string
    color: string
    phases?: { name: string; letter: string; days: string; description: string }[]
    phaseName?: string
    phaseLetter?: string
    phaseNumber?: number
    totalPhases?: number
    type: string
  }
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const W = 1600
  const H = 1130
  canvas.width = W
  canvas.height = H

  // ---- Background ----
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, W, H)

  // Outer border
  ctx.strokeStyle = data.color
  ctx.lineWidth = 4
  ctx.strokeRect(24, 24, W - 48, H - 48)

  // Inner subtle border
  ctx.strokeStyle = `${data.color}30`
  ctx.lineWidth = 1
  ctx.strokeRect(36, 36, W - 72, H - 72)

  // Top accent bar
  ctx.fillStyle = data.color
  ctx.fillRect(24, 24, W - 48, 8)

  // Corner ornaments (small squares)
  const corners = [
    [40, 40],
    [W - 56, 40],
    [40, H - 56],
    [W - 56, H - 56],
  ]
  corners.forEach(([x, y]) => {
    ctx.fillStyle = data.color
    ctx.fillRect(x, y, 16, 16)
  })

  // ---- Issuer Header ----
  ctx.fillStyle = "#374151"
  ctx.font = "600 13px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.letterSpacing = "6px"
  ctx.fillText("ISSUED BY", W / 2, 90)
  ctx.letterSpacing = "0px"

  ctx.fillStyle = data.color
  ctx.font = "800 32px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText(data.issuer.toUpperCase(), W / 2, 128)

  // Decorative line under issuer
  ctx.beginPath()
  ctx.moveTo(W / 2 - 100, 145)
  ctx.lineTo(W / 2 + 100, 145)
  ctx.strokeStyle = data.color
  ctx.lineWidth = 2
  ctx.stroke()

  // ---- Shield icon (drawn as circle with letter) ----
  const shieldY = 200
  ctx.beginPath()
  ctx.arc(W / 2, shieldY, 40, 0, Math.PI * 2)
  ctx.fillStyle = `${data.color}15`
  ctx.fill()
  ctx.beginPath()
  ctx.arc(W / 2, shieldY, 40, 0, Math.PI * 2)
  ctx.strokeStyle = data.color
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = data.color
  ctx.font = "bold 28px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(data.type === "program" ? "W" : (data.phaseLetter ?? "C"), W / 2, shieldY + 2)
  ctx.textBaseline = "alphabetic"

  // ---- Certificate Type Label ----
  ctx.fillStyle = "#6B7280"
  ctx.font = "600 12px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.letterSpacing = "5px"
  ctx.fillText("DIGITAL CREDENTIAL", W / 2, 268)
  ctx.letterSpacing = "0px"

  // ---- Title ----
  ctx.fillStyle = "#111827"
  ctx.font = "800 18px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.letterSpacing = "8px"
  ctx.fillText("CERTIFICATE OF MASTERY", W / 2, 310)
  ctx.letterSpacing = "0px"

  // ---- Awarded To ----
  ctx.fillStyle = "#6B7280"
  ctx.font = "500 14px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText("This credential is awarded to", W / 2, 360)

  // ---- Recipient Name ----
  ctx.fillStyle = "#111827"
  ctx.font = "700 48px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText(data.userName, W / 2, 420)

  // Decorative line under name
  ctx.beginPath()
  ctx.moveTo(W / 2 - 200, 440)
  ctx.lineTo(W / 2 + 200, 440)
  ctx.strokeStyle = `${data.color}40`
  ctx.lineWidth = 1
  ctx.stroke()

  // ---- Mastery path / achievement description ----
  ctx.fillStyle = "#374151"
  ctx.font = "500 15px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText("for demonstrating professional mastery in", W / 2, 475)

  ctx.fillStyle = data.color
  ctx.font = "700 28px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText(data.title, W / 2, 520)

  ctx.fillStyle = "#6B7280"
  ctx.font = "500 14px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText(data.subtitle, W / 2, 555)

  // ---- Mastery Path Details ----
  if (data.type === "program" && data.phases && data.phases.length > 0) {
    ctx.fillStyle = "#374151"
    ctx.font = "600 12px 'Inter', 'Helvetica Neue', Arial, sans-serif"
    ctx.letterSpacing = "3px"
    ctx.fillText("MASTERY PATH COMPLETED", W / 2, 600)
    ctx.letterSpacing = "0px"

    const phaseCount = data.phases.length
    const phaseWidth = 200
    const totalWidth = phaseCount * phaseWidth + (phaseCount - 1) * 24
    const startX = (W - totalWidth) / 2

    data.phases.forEach((phase, i) => {
      const x = startX + i * (phaseWidth + 24)
      const y = 620

      // Phase box
      ctx.fillStyle = `${data.color}08`
      ctx.beginPath()
      ctx.roundRect(x, y, phaseWidth, 80, 8)
      ctx.fill()
      ctx.strokeStyle = `${data.color}30`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(x, y, phaseWidth, 80, 8)
      ctx.stroke()

      // Phase letter circle
      ctx.beginPath()
      ctx.arc(x + 30, y + 40, 16, 0, Math.PI * 2)
      ctx.fillStyle = data.color
      ctx.fill()
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 14px 'Inter', 'Helvetica Neue', Arial, sans-serif"
      ctx.textBaseline = "middle"
      ctx.fillText(phase.letter ?? String(i + 1), x + 30, y + 41)
      ctx.textBaseline = "alphabetic"

      // Phase name
      ctx.fillStyle = "#111827"
      ctx.font = "600 13px 'Inter', 'Helvetica Neue', Arial, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(phase.name, x + 54, y + 36)

      // Phase days
      ctx.fillStyle = "#6B7280"
      ctx.font = "400 11px 'Inter', 'Helvetica Neue', Arial, sans-serif"
      ctx.fillText(phase.days ?? "", x + 54, y + 55)

      ctx.textAlign = "center"
    })
  } else if (data.type === "phase" && data.phaseName) {
    // Single phase details
    ctx.fillStyle = "#374151"
    ctx.font = "600 12px 'Inter', 'Helvetica Neue', Arial, sans-serif"
    ctx.letterSpacing = "3px"
    ctx.fillText(`PHASE ${data.phaseNumber} OF ${data.totalPhases}`, W / 2, 600)
    ctx.letterSpacing = "0px"

    ctx.fillStyle = `${data.color}08`
    const boxW = 400
    const boxX = (W - boxW) / 2
    ctx.beginPath()
    ctx.roundRect(boxX, 618, boxW, 82, 8)
    ctx.fill()
    ctx.strokeStyle = `${data.color}30`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(boxX, 618, boxW, 82, 8)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(boxX + 40, 659, 20, 0, Math.PI * 2)
    ctx.fillStyle = data.color
    ctx.fill()
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 16px 'Inter', 'Helvetica Neue', Arial, sans-serif"
    ctx.textBaseline = "middle"
    ctx.fillText(data.phaseLetter ?? String(data.phaseNumber), boxX + 40, 660)
    ctx.textBaseline = "alphabetic"

    ctx.fillStyle = "#111827"
    ctx.font = "600 16px 'Inter', 'Helvetica Neue', Arial, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(data.phaseName, boxX + 72, 652)
    ctx.fillStyle = "#6B7280"
    ctx.font = "400 12px 'Inter', 'Helvetica Neue', Arial, sans-serif"
    const desc = data.phases?.[0]?.description ?? ""
    const maxW = boxW - 84
    const truncDesc = desc.length > 60 ? desc.slice(0, 57) + "..." : desc
    ctx.fillText(truncDesc, boxX + 72, 675)
    ctx.textAlign = "center"
  }

  // ---- Bottom section: columns ----
  const bottomY = data.type === "program" ? 740 : 740

  // Left: Date
  ctx.fillStyle = "#9CA3AF"
  ctx.font = "600 10px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.letterSpacing = "2px"
  ctx.textAlign = "center"
  ctx.fillText("DATE ISSUED", W / 4, bottomY)
  ctx.letterSpacing = "0px"
  ctx.fillStyle = "#374151"
  ctx.font = "500 15px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText(data.issuedDate, W / 4, bottomY + 24)

  // Line
  ctx.beginPath()
  ctx.moveTo(W / 4 - 80, bottomY + 36)
  ctx.lineTo(W / 4 + 80, bottomY + 36)
  ctx.strokeStyle = "#E5E7EB"
  ctx.lineWidth = 1
  ctx.stroke()

  // Center: Program
  ctx.fillStyle = "#9CA3AF"
  ctx.font = "600 10px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.letterSpacing = "2px"
  ctx.fillText("PROGRAM", W / 2, bottomY)
  ctx.letterSpacing = "0px"
  ctx.fillStyle = "#374151"
  ctx.font = "500 15px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText(data.programName, W / 2, bottomY + 24)

  ctx.beginPath()
  ctx.moveTo(W / 2 - 80, bottomY + 36)
  ctx.lineTo(W / 2 + 80, bottomY + 36)
  ctx.strokeStyle = "#E5E7EB"
  ctx.lineWidth = 1
  ctx.stroke()

  // Right: Credential ID
  ctx.fillStyle = "#9CA3AF"
  ctx.font = "600 10px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.letterSpacing = "2px"
  ctx.fillText("CREDENTIAL ID", (3 * W) / 4, bottomY)
  ctx.letterSpacing = "0px"
  ctx.fillStyle = "#374151"
  ctx.font = "500 13px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.fillText(data.credentialId, (3 * W) / 4, bottomY + 24)

  ctx.beginPath()
  ctx.moveTo((3 * W) / 4 - 80, bottomY + 36)
  ctx.lineTo((3 * W) / 4 + 80, bottomY + 36)
  ctx.strokeStyle = "#E5E7EB"
  ctx.lineWidth = 1
  ctx.stroke()

  // ---- Footer ----
  // Divider
  ctx.beginPath()
  ctx.moveTo(60, H - 110)
  ctx.lineTo(W - 60, H - 110)
  ctx.strokeStyle = "#E5E7EB"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "#9CA3AF"
  ctx.font = "500 11px 'Inter', 'Helvetica Neue', Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(
    `This digital credential verifies that the above-named individual has completed the required mastery path.`,
    W / 2,
    H - 78
  )
  ctx.fillText(
    `Issued by ${data.issuer} | Credential ID: ${data.credentialId} | Verify at workforce.transformerhub.com`,
    W / 2,
    H - 58
  )
}

/* ------------------------------------------------------------------ */
/* Main client component                                              */
/* ------------------------------------------------------------------ */
export function CertificatesClient({
  program,
  enrollmentId,
  currentDay,
  certificates,
  userName,
  userEmail,
}: CertificatesClientProps) {
  const earnedCount = certificates.filter((c) => c.isEarned).length
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = useCallback(
    async (cert: Certificate) => {
      setDownloading(cert.id)
      try {
        const phaseParam = cert.id === "program-complete" ? "program" : String(cert.phaseNumber)
        const res = await fetch(
          `/api/certificate?enrollmentId=${enrollmentId}&phase=${phaseParam}`
        )
        if (!res.ok) {
          const err = await res.json()
          alert(err.error ?? "Failed to generate certificate")
          return
        }
        const { certificate: data } = await res.json()

        const canvas = canvasRef.current
        if (!canvas) return

        drawCertificate(canvas, data)

        // Convert to PNG blob and download
        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${data.credentialId}-certificate.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, "image/png")
      } finally {
        setDownloading(null)
      }
    },
    [enrollmentId]
  )

  const handleLinkedIn = useCallback((cert: Certificate) => {
    const certTitle = encodeURIComponent(cert.title)
    const issuer = encodeURIComponent("Transformer Hub")
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certTitle}&organizationName=${issuer}&certUrl=${encodeURIComponent("https://workforce.transformerhub.com")}`
    window.open(url, "_blank", "noopener,noreferrer")
  }, [])

  const handleEmail = useCallback(
    (cert: Certificate) => {
      const subject = encodeURIComponent(`Digital Credential: ${cert.title}`)
      const body = encodeURIComponent(
        `I have earned the "${cert.title}" digital credential, issued by Transformer Hub.\n\nProgram: ${program.name}\nCredential: ${cert.title}\n${cert.description}\n\nVerify at: https://workforce.transformerhub.com\n\n--\n${userName}`
      )
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    },
    [program.name, userName]
  )

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hidden canvas for rendering certificates */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">
          Digital Credentials
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Earn professional credentials as you progress through {program.name}.
          Complete each phase to unlock its digital badge -- downloadable, shareable on LinkedIn, or emailable.
        </p>
      </div>

      {/* Progress summary */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border bg-card p-5">
        <div
          className="flex size-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${program.badgeColor}15` }}
        >
          <Shield className="size-6" style={{ color: program.badgeColor }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-card-foreground">
            {earnedCount} of {certificates.length} Credentials Earned
          </h3>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${certificates.length > 0 ? (earnedCount / certificates.length) * 100 : 0}%`,
                backgroundColor: program.badgeColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Credential cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
              cert.isEarned
                ? "bg-card shadow-sm ring-1 ring-inset"
                : "bg-muted/30 opacity-70"
            }`}
            style={
              cert.isEarned
                ? { borderColor: `${program.badgeColor}40`, ringColor: `${program.badgeColor}20` }
                : undefined
            }
          >
            {/* Credential badge visual */}
            <div
              className="relative flex items-center justify-center py-10"
              style={{
                backgroundColor: cert.isEarned
                  ? `${program.badgeColor}08`
                  : undefined,
              }}
            >
              {cert.isEarned ? (
                <div className="flex flex-col items-center">
                  {/* Badge circle */}
                  <div className="relative">
                    <div
                      className="flex size-20 items-center justify-center rounded-full shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${program.badgeColor}, ${program.badgeColor}CC)`,
                      }}
                    >
                      <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/30">
                        <span className="text-2xl font-extrabold text-white">
                          {cert.phaseLetter}
                        </span>
                      </div>
                    </div>
                    {/* Checkmark overlay */}
                    <div
                      className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-white"
                      style={{ backgroundColor: program.badgeColor }}
                    >
                      <CheckCircle2 className="size-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-bold tracking-widest"
                      style={{ color: program.badgeColor }}
                    >
                      CREDENTIAL EARNED
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/50">
                    <Lock className="size-7 text-muted-foreground/40" />
                  </div>
                  <span className="mt-3 text-[10px] font-bold tracking-widest text-muted-foreground">
                    LOCKED
                  </span>
                </div>
              )}
            </div>

            {/* Credential info */}
            <div className="flex flex-1 flex-col border-t p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-card-foreground">
                  {cert.title}
                </h3>
                {cert.isEarned && (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                    style={{ backgroundColor: program.badgeColor }}
                  >
                    {cert.daysLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                {cert.description}
              </p>

              {cert.isEarned ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <Award className="mr-1 size-3" />
                    Issued to {userName} by Transformer Hub
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-xs"
                      onClick={() => handleDownload(cert)}
                      disabled={downloading === cert.id}
                    >
                      <Download className="mr-1 size-3" />
                      {downloading === cert.id ? "Generating..." : "Download"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-xs"
                      onClick={() => handleLinkedIn(cert)}
                    >
                      <Linkedin className="mr-1 size-3" />
                      LinkedIn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-xs"
                      onClick={() => handleEmail(cert)}
                    >
                      <Mail className="mr-1 size-3" />
                      Email
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Lock className="size-2.5" />
                  Complete this phase to unlock your credential
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="mt-8 rounded-xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <h4 className="text-xs font-bold text-card-foreground">
              About Your Digital Credentials
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Each credential is a professional digital badge issued by Transformer Hub verifying your mastery of the {program.name} program.
              Download as a high-resolution image, add directly to your LinkedIn profile, or share via email.
              Each credential includes a unique verification ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
