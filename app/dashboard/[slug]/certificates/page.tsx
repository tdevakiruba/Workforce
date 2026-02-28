import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CertificatesClient } from "./certificates-client"

export const dynamic = "force-dynamic"

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/signin")

  const { data: program } = await supabase
    .from("wf-programs")
    .select("id, slug, name, color, badge, duration")
    .eq("slug", slug)
    .single()

  if (!program) redirect("/dashboard")

  const { data: enrollment } = await supabase
    .from("wf-enrollments")
    .select("id, current_day, started_at")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  if (!enrollment) redirect(`/programs/${slug}`)

  const durationMatch = program.duration?.match(/(\d+)/)
  const totalDays = durationMatch ? parseInt(durationMatch[1], 10) : 21
  const currentDay = Math.min(enrollment.current_day ?? 1, totalDays)

  // Fetch phases -- actual DB columns: title, description, day_range, sort_order
  const { data: phases } = await supabase
    .from("wf-program_phases")
    .select("title, description, day_range, sort_order")
    .eq("program_id", program.id)
    .order("sort_order")

  // Parse "Days X-Y" string into { start, end }
  function parseDays(dayRange: string | null): { start: number; end: number } {
    const match = dayRange?.match(/(\d+)\s*-\s*(\d+)/)
    if (match) return { start: parseInt(match[1], 10), end: parseInt(match[2], 10) }
    const single = dayRange?.match(/(\d+)/)
    if (single) return { start: parseInt(single[1], 10), end: parseInt(single[1], 10) }
    return { start: 1, end: totalDays }
  }

  // Build certificates from phases
  const certificates = (phases ?? []).map((phase, idx) => {
    const { start, end } = parseDays(phase.day_range)
    const isEarned = currentDay > end
    return {
      id: `phase-${idx + 1}`,
      title: `${phase.title} Mastery`,
      phaseName: phase.title,
      phaseLetter: (phase.title ?? "P")[0], // First letter of title as badge letter
      description: phase.description ?? `Phase ${idx + 1}: ${phase.title} (${phase.day_range})`,
      daysLabel: phase.day_range ?? `Days ${start}-${end}`,
      isEarned,
      earnedDate: isEarned && enrollment.started_at ? new Date(enrollment.started_at).toISOString() : null,
      phaseNumber: idx + 1,
    }
  })

  // Program completion certificate
  const programComplete = currentDay >= totalDays
  certificates.push({
    id: "program-complete",
    title: `${program.name} -- Program Completion`,
    phaseName: "Program Completion",
    phaseLetter: "W",
    description: `Successfully completed the entire ${totalDays}-day ${program.name} program.`,
    daysLabel: `Days 1-${totalDays}`,
    isEarned: programComplete,
    earnedDate: programComplete && enrollment.started_at ? new Date(enrollment.started_at).toISOString() : null,
    phaseNumber: (phases?.length ?? 0) + 1,
  })

  const userName = user.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ""}`.trim()
    : user.email?.split("@")[0] ?? "Participant"

  return (
    <CertificatesClient
      program={{
        slug: program.slug,
        name: program.name,
        badgeColor: program.color ?? "#00c892",
        badge: program.badge ?? "WFR",
        totalDays,
      }}
      enrollmentId={enrollment.id}
      currentDay={currentDay}
      certificates={certificates}
      userName={userName}
      userEmail={user.email ?? ""}
    />
  )
}
