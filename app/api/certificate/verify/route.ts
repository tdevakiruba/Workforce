import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/certificate/verify?id=...
 *
 * Public endpoint to verify a certificate by its credential ID.
 * Returns certificate details if valid, or an error if not found.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const credentialId = searchParams.get("id")

  if (!credentialId) {
    return NextResponse.json({ error: "Missing credential ID" }, { status: 400 })
  }

  const supabase = await createClient()

  // Look up the certificate
  const { data: certificate, error } = await supabase
    .from("wf-certificates")
    .select(`
      id,
      credential_id,
      certificate_type,
      phase_number,
      phase_name,
      recipient_name,
      issued_at,
      program_id,
      enrollment_id
    `)
    .eq("credential_id", credentialId.toUpperCase())
    .maybeSingle()

  if (error) {
    console.error("[v0][verify-certificate] Database error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }

  if (!certificate) {
    return NextResponse.json({ 
      verified: false,
      error: "Certificate not found" 
    }, { status: 404 })
  }

  // Fetch program details
  const { data: program } = await supabase
    .from("wf-programs")
    .select("name, slug, color, badge, duration")
    .eq("id", certificate.program_id)
    .single()

  // Fetch phase details if it's a phase certificate
  let phaseDetails = null
  if (certificate.certificate_type === "phase" && certificate.phase_number) {
    const { data: phases } = await supabase
      .from("wf-program_phases")
      .select("title, description, day_range")
      .eq("program_id", certificate.program_id)
      .order("sort_order")

    if (phases && phases[certificate.phase_number - 1]) {
      phaseDetails = phases[certificate.phase_number - 1]
    }
  }

  return NextResponse.json({
    verified: true,
    certificate: {
      credentialId: certificate.credential_id,
      recipientName: certificate.recipient_name,
      certificateType: certificate.certificate_type,
      phaseNumber: certificate.phase_number,
      phaseName: certificate.phase_name || phaseDetails?.title,
      phaseDescription: phaseDetails?.description,
      phaseDays: phaseDetails?.day_range,
      issuedAt: certificate.issued_at,
      program: program ? {
        name: program.name,
        slug: program.slug,
        color: program.color,
        badge: program.badge,
        duration: program.duration,
      } : null,
    },
  })
}
