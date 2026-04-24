import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FrameworksClient } from "./frameworks-client"

export const dynamic = "force-dynamic"

export default async function FrameworksPage({
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
  // Use the enrollment's current_day (advanced by the progress API when all
  // actions for a day are completed), matching the journey page behaviour.
  const currentDay = Math.min(enrollment.current_day ?? 1, totalDays)

  // Fetch curriculum days with their IDs
  const { data: days } = await supabase
    .from("wf-curriculum_days")
    .select("id, day_number, title, theme")
    .eq("program_id", program.id)
    .order("day_number")

  const curriculum = (days ?? []).map((d) => ({
    day_number: d.day_number,
    title: d.title,
    key_theme: d.theme,
  }))

  // Fetch sections and exercises to get total count per day
  const dayIds = (days ?? []).map((d) => d.id)
  
  const { data: sections } = dayIds.length
    ? await supabase
        .from("wf-curriculum_sections")
        .select("id, day_id")
        .in("day_id", dayIds)
    : { data: [] as { id: string; day_id: string }[] }

  const sectionIds = (sections ?? []).map((s) => s.id)

  const { data: exercises } = sectionIds.length
    ? await supabase
        .from("wf-curriculum_exercises")
        .select("id, section_id")
        .in("section_id", sectionIds)
    : { data: [] as { id: string; section_id: string }[] }

  // Build a map from day_id to exercise count
  const sectionToDayId = new Map<string, string>()
  for (const sec of sections ?? []) {
    sectionToDayId.set(sec.id, sec.day_id)
  }

  const dayIdToNumber = new Map<string, number>()
  for (const d of days ?? []) {
    dayIdToNumber.set(d.id, d.day_number)
  }

  // Count total exercises per day_number
  const totalExercisesPerDay: Record<number, number> = {}
  for (const ex of exercises ?? []) {
    const dayId = sectionToDayId.get(ex.section_id)
    if (dayId) {
      const dayNum = dayIdToNumber.get(dayId)
      if (dayNum !== undefined) {
        totalExercisesPerDay[dayNum] = (totalExercisesPerDay[dayNum] ?? 0) + 1
      }
    }
  }

  // Fetch user action completions per day
  const { data: userActions } = await supabase
    .from("wf-user_actions")
    .select("day_number, completed")
    .eq("enrollment_id", enrollment.id)

  // Count completed actions per day
  const completedActionsPerDay: Record<number, number> = {}
  for (const a of userActions ?? []) {
    if (a.completed) {
      completedActionsPerDay[a.day_number] = (completedActionsPerDay[a.day_number] ?? 0) + 1
    }
  }

  // Build completion map with actual totals from curriculum
  const completionMap: Record<number, { total: number; done: number }> = {}
  for (const d of days ?? []) {
    const dayNum = d.day_number
    completionMap[dayNum] = {
      total: totalExercisesPerDay[dayNum] ?? 0,
      done: completedActionsPerDay[dayNum] ?? 0,
    }
  }

  return (
    <FrameworksClient
      program={{
        slug: program.slug,
        name: program.name,
        badgeColor: program.color ?? "#00c892",
        signalAcronym: program.badge ?? "",
        totalDays,
      }}
      currentDay={currentDay}
      curriculum={curriculum}
      completionMap={completionMap}
      phases={[]}
    />
  )
}
