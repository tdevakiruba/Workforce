import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/certificate?enrollmentId=...&phase=...
 *
 * Returns JSON with all the data needed to render and download
 * a certificate on the client side.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const enrollmentId = searchParams.get("enrollmentId")
  const phaseParam = searchParams.get("phase") // "1", "2", "3", or "program"

  if (!enrollmentId || !phaseParam) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, current_day, started_at, completed_at, program_id, user_id")
    .eq("id", enrollmentId)
    .eq("user_id", user.id)
    .single()

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
  }

  // Fetch program
  const { data: program } = await supabase
    .from("programs")
    .select("id, slug, name, duration, color, badge")
    .eq("id", enrollment.program_id)
    .single()

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 })
  }

  const durationMatch = program.duration?.match(/(\d+)/)
  const totalDays = durationMatch ? parseInt(durationMatch[1], 10) : 21
  const currentDay = Math.min(enrollment.current_day ?? 1, totalDays)

  // Fetch phases
  const { data: phases } = await supabase
    .from("program_phases")
    .select("name, letter, days, description, sort_order")
    .eq("program_id", program.id)
    .order("sort_order")

  if (!phases || phases.length === 0) {
    return NextResponse.json({ error: "No phases found" }, { status: 404 })
  }

  // Parse phase days (e.g. "Days 1-7" → { start: 1, end: 7 })
  function parseDays(daysStr: string | null): { start: number; end: number } {
    const match = daysStr?.match(/(\d+)\s*-\s*(\d+)/)
    if (match) return { start: parseInt(match[1], 10), end: parseInt(match[2], 10) }
    const single = daysStr?.match(/(\d+)/)
    if (single) return { start: parseInt(single[1], 10), end: parseInt(single[1], 10) }
    return { start: 1, end: totalDays }
  }

  // Determine what's being certified
  const userName = user.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ""}`.trim()
    : user.email?.split("@")[0] ?? "Participant"

  const issuedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Generate a credential ID
  const credentialId = `TH-${program.badge ?? "WFR"}-${enrollmentId.slice(0, 8).toUpperCase()}-${phaseParam.toUpperCase()}`

  if (phaseParam === "program") {
    // Full program completion
    if (currentDay < totalDays) {
      return NextResponse.json({ error: "Program not yet completed" }, { status: 403 })
    }

    return NextResponse.json({
      certificate: {
        type: "program",
        credentialId,
        userName,
        programName: program.name,
        title: `${program.name} -- Program Completion`,
        subtitle: `Successfully completed the entire ${totalDays}-day ${program.name} program`,
        issuedDate,
        issuer: "Transformer Hub",
        totalDays,
        color: program.color ?? "#00c892",
        phases: phases.map((p) => ({
          name: p.name,
          letter: p.letter,
          days: p.days,
          description: p.description,
        })),
      },
    })
  }

  // Phase-specific certificate
  const phaseIndex = parseInt(phaseParam, 10) - 1
  if (phaseIndex < 0 || phaseIndex >= phases.length) {
    return NextResponse.json({ error: "Invalid phase" }, { status: 400 })
  }

  const phase = phases[phaseIndex]
  const { end: dayEnd } = parseDays(phase.days)

  if (currentDay <= dayEnd) {
    return NextResponse.json({ error: "Phase not yet completed" }, { status: 403 })
  }

  return NextResponse.json({
    certificate: {
      type: "phase",
      credentialId,
      userName,
      programName: program.name,
      title: `${phase.name} Mastery`,
      subtitle: `Completed Phase ${phaseIndex + 1}: ${phase.name} (${phase.days})`,
      issuedDate,
      issuer: "Transformer Hub",
      totalDays,
      color: program.color ?? "#00c892",
      phaseName: phase.name,
      phaseLetter: phase.letter,
      phaseDays: phase.days,
      phaseDescription: phase.description,
      phaseNumber: phaseIndex + 1,
      totalPhases: phases.length,
    },
  })
}
