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
/* Certificate canvas renderer – professional AI Workforce credential */
/* ------------------------------------------------------------------ */
const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const NAVY = "#0F172A"
const COMPETENCIES = [
  "AI-enabled workflow operation",
  "Decision framing under ambiguity",
  "Ethical AI usage & validation",
  "Business impact translation",
  "Leadership influence in hybrid teams",
]
const CREDENTIAL_ABILITIES = [
  "Interpret and validate AI output",
  "Escalate risk responsibly",
  "Translate AI insights into business impact",
  "Communicate at executive level",
  "Operate as a high-trust performer in AI-enabled organizations",
]

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
  const CX = W / 2
  const accent = data.color

  // Helper: draw centered text
  function centerText(text: string, x: number, y: number) {
    ctx!.textAlign = "center"
    ctx!.fillText(text, x, y)
  }

  // ---- Background ----
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, W, H)

  // Subtle geometric AI grid pattern
  ctx.strokeStyle = `${accent}06`
  ctx.lineWidth = 1
  for (let gx = 0; gx < W; gx += 60) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
  }
  for (let gy = 0; gy < H; gy += 60) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
  }

  // Outer border
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  ctx.strokeRect(28, 28, W - 56, H - 56)

  // Inner border
  ctx.strokeStyle = `${accent}25`
  ctx.lineWidth = 1
  ctx.strokeRect(38, 38, W - 76, H - 76)

  // Top accent bar
  ctx.fillStyle = accent
  ctx.fillRect(28, 28, W - 56, 6)

  // Corner ornaments
  const cs = 14
  ;[
    [42, 42], [W - 42 - cs, 42], [42, H - 42 - cs], [W - 42 - cs, H - 42 - cs],
  ].forEach(([x, y]) => { ctx.fillStyle = accent; ctx.fillRect(x, y, cs, cs) })

  // ---- Header: Logo side + title ----
  let Y = 80

  // Shield logo circle
  ctx.beginPath()
  ctx.arc(120, Y + 22, 26, 0, Math.PI * 2)
  ctx.fillStyle = `${accent}12`
  ctx.fill()
  ctx.beginPath()
  ctx.arc(120, Y + 22, 26, 0, Math.PI * 2)
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = accent
  ctx.font = `bold 22px ${FONT}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("W", 120, Y + 23)
  ctx.textBaseline = "alphabetic"

  // Right header text
  ctx.textAlign = "right"
  ctx.fillStyle = NAVY
  ctx.font = `800 18px ${FONT}`
  ctx.fillText("WORKFORCE READY\u2122", W - 80, Y + 14)
  ctx.fillStyle = "#6B7280"
  ctx.font = `500 11px ${FONT}`
  ctx.fillText("AI Workforce Readiness Certification", W - 80, Y + 34)
  ctx.textAlign = "center"

  // Thin teal divider
  Y = 130
  ctx.beginPath()
  ctx.moveTo(80, Y)
  ctx.lineTo(W - 80, Y)
  ctx.strokeStyle = accent
  ctx.lineWidth = 1.5
  ctx.stroke()

  // ---- CERTIFICATE OF COMPLETION ----
  Y = 168
  ctx.fillStyle = "#9CA3AF"
  ctx.font = `600 11px ${FONT}`
  ctx.letterSpacing = "6px"
  centerText("DIGITAL CREDENTIAL", CX, Y)
  ctx.letterSpacing = "0px"

  Y = 206
  ctx.fillStyle = NAVY
  ctx.font = `800 22px ${FONT}`
  ctx.letterSpacing = "10px"
  centerText("CERTIFICATE OF COMPLETION", CX, Y)
  ctx.letterSpacing = "0px"

  // ---- "This certifies that" ----
  Y = 248
  ctx.fillStyle = "#6B7280"
  ctx.font = `500 14px ${FONT}`
  centerText("This certifies that", CX, Y)

  // ---- Recipient Name ----
  Y = 296
  ctx.fillStyle = NAVY
  ctx.font = `700 46px ${FONT}`
  centerText(data.userName, CX, Y)

  // Line under name
  ctx.beginPath()
  ctx.moveTo(CX - 180, Y + 16)
  ctx.lineTo(CX + 180, Y + 16)
  ctx.strokeStyle = `${accent}35`
  ctx.lineWidth = 1
  ctx.stroke()

  // ---- "has successfully completed the" ----
  Y = 340
  ctx.fillStyle = "#6B7280"
  ctx.font = `500 13px ${FONT}`
  centerText("has successfully completed the", CX, Y)

  // ---- Program title ----
  Y = 374
  ctx.fillStyle = accent
  ctx.font = `700 24px ${FONT}`
  centerText(data.type === "program" ? "21-Day AI Workforce Accelerator" : data.title, CX, Y)

  ctx.fillStyle = "#6B7280"
  ctx.font = `500 13px ${FONT}`
  centerText("and demonstrated competency in:", CX, Y + 28)

  // ---- Competency list (left column) ----
  const compY = Y + 56
  const compItems = data.type === "program" ? COMPETENCIES : COMPETENCIES.slice(0, 3)
  ctx.textAlign = "left"
  compItems.forEach((item, i) => {
    const iy = compY + i * 22
    ctx.fillStyle = accent
    ctx.font = `700 10px ${FONT}`
    ctx.fillText("\u2022", CX - 200, iy)
    ctx.fillStyle = "#374151"
    ctx.font = `500 12px ${FONT}`
    ctx.fillText(item, CX - 186, iy)
  })
  ctx.textAlign = "center"

  // ---- Mastery path / phases ----
  let phaseBlockEnd = compY + compItems.length * 22 + 16

  if (data.type === "program" && data.phases && data.phases.length > 0) {
    const pY = phaseBlockEnd + 6
    ctx.fillStyle = "#9CA3AF"
    ctx.font = `600 10px ${FONT}`
    ctx.letterSpacing = "3px"
    centerText("MASTERY PATH COMPLETED", CX, pY)
    ctx.letterSpacing = "0px"

    const phaseCount = data.phases.length
    const phaseWidth = 260
    const gap = 20
    const totalW = phaseCount * phaseWidth + (phaseCount - 1) * gap
    const startX = (W - totalW) / 2

    data.phases.forEach((phase, i) => {
      const x = startX + i * (phaseWidth + gap)
      const y = pY + 14

      ctx.fillStyle = `${accent}08`
      ctx.beginPath()
      ctx.roundRect(x, y, phaseWidth, 68, 8)
      ctx.fill()
      ctx.strokeStyle = `${accent}25`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(x, y, phaseWidth, 68, 8)
      ctx.stroke()

      // Circle with number
      ctx.beginPath()
      ctx.arc(x + 28, y + 34, 14, 0, Math.PI * 2)
      ctx.fillStyle = accent
      ctx.fill()
      ctx.fillStyle = "#FFFFFF"
      ctx.font = `bold 13px ${FONT}`
      ctx.textBaseline = "middle"
      ctx.textAlign = "center"
      ctx.fillText(phase.letter ?? String(i + 1), x + 28, y + 35)
      ctx.textBaseline = "alphabetic"

      ctx.textAlign = "left"
      ctx.fillStyle = NAVY
      ctx.font = `600 12px ${FONT}`
      ctx.fillText(phase.name, x + 50, y + 30)
      ctx.fillStyle = "#6B7280"
      ctx.font = `400 10px ${FONT}`
      ctx.fillText(phase.days ?? "", x + 50, y + 48)
      ctx.textAlign = "center"
    })

    phaseBlockEnd = pY + 14 + 68 + 14
  } else if (data.type === "phase" && data.phaseName) {
    const pY = phaseBlockEnd + 6
    ctx.fillStyle = "#9CA3AF"
    ctx.font = `600 10px ${FONT}`
    ctx.letterSpacing = "3px"
    centerText(`PHASE ${data.phaseNumber} OF ${data.totalPhases}`, CX, pY)
    ctx.letterSpacing = "0px"

    const boxW = 360
    const boxX = (W - boxW) / 2
    const boxY = pY + 14
    ctx.fillStyle = `${accent}08`
    ctx.beginPath()
    ctx.roundRect(boxX, boxY, boxW, 68, 8)
    ctx.fill()
    ctx.strokeStyle = `${accent}25`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(boxX, boxY, boxW, 68, 8)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(boxX + 32, boxY + 34, 16, 0, Math.PI * 2)
    ctx.fillStyle = accent
    ctx.fill()
    ctx.fillStyle = "#FFFFFF"
    ctx.font = `bold 14px ${FONT}`
    ctx.textBaseline = "middle"
    ctx.fillText(data.phaseLetter ?? String(data.phaseNumber), boxX + 32, boxY + 35)
    ctx.textBaseline = "alphabetic"

    ctx.textAlign = "left"
    ctx.fillStyle = NAVY
    ctx.font = `600 13px ${FONT}`
    ctx.fillText(data.phaseName, boxX + 58, boxY + 30)
    ctx.fillStyle = "#6B7280"
    ctx.font = `400 11px ${FONT}`
    ctx.fillText(data.subtitle, boxX + 58, boxY + 50)
    ctx.textAlign = "center"

    phaseBlockEnd = boxY + 68 + 14
  }

  // ---- Credential Statement ----
  const csY = phaseBlockEnd + 8
  ctx.fillStyle = "#9CA3AF"
  ctx.font = `600 10px ${FONT}`
  ctx.letterSpacing = "3px"
  centerText("CREDENTIAL STATEMENT", CX, csY)
  ctx.letterSpacing = "0px"

  ctx.fillStyle = "#374151"
  ctx.font = `italic 11px ${FONT}`
  centerText(
    "Certified to operate in AI-enabled organizations under hybrid human-machine systems.",
    CX,
    csY + 20
  )

  // ---- Bottom metadata: 4 columns ----
  const metaY = H - 168

  // Divider above metadata
  ctx.beginPath()
  ctx.moveTo(80, metaY - 14)
  ctx.lineTo(W - 80, metaY - 14)
  ctx.strokeStyle = "#E5E7EB"
  ctx.lineWidth = 1
  ctx.stroke()

  const cols = [
    { label: "DATE ISSUED", value: data.issuedDate },
    { label: "CREDENTIAL LEVEL", value: "AI-Enabled Professional" },
    { label: "DELIVERY MODE", value: "Applied Simulation + Capstone" },
    { label: "CREDENTIAL ID", value: data.credentialId },
  ]

  cols.forEach((col, i) => {
    const cx = 80 + (i * (W - 160)) / (cols.length - 1) + (i === 0 ? 60 : i === cols.length - 1 ? -60 : 0)
    ctx.fillStyle = "#9CA3AF"
    ctx.font = `600 9px ${FONT}`
    ctx.letterSpacing = "2px"
    ctx.textAlign = "center"
    ctx.fillText(col.label, cx, metaY)
    ctx.letterSpacing = "0px"
    ctx.fillStyle = "#374151"
    ctx.font = `500 12px ${FONT}`
    ctx.fillText(col.value, cx, metaY + 20)
  })

  // ---- Footer ----
  const fY = H - 80
  ctx.beginPath()
  ctx.moveTo(80, fY)
  ctx.lineTo(W - 80, fY)
  ctx.strokeStyle = "#E5E7EB"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "#9CA3AF"
  ctx.font = `500 10px ${FONT}`
  ctx.textAlign = "center"
  centerText(
    "This digital credential verifies that the above-named individual has completed the required mastery path.",
    CX,
    fY + 22
  )
  centerText(
    `Issued by ${data.issuer} | Credential ID: ${data.credentialId} | Verify at workforce.transformerhub.com`,
    CX,
    fY + 40
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
