import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JourneyClient } from "./journey-client"

export const dynamic = "force-dynamic"

export default async function JourneyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ day?: string }>
}) {
  const { slug } = await params
  const { day: dayParam } = await searchParams
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

  // Calculate total days from program duration
  const durationMatch = program.duration?.match(/(\d+)/)
  const totalDays = durationMatch ? parseInt(durationMatch[1], 10) : 21

  // Fetch curriculum days, sections, and exercises separately
  // (nested FK joins don't work with hyphenated table names in Supabase JS)
  const { data: curriculumDays } = await supabase
    .from("wf-curriculum_days")
    .select("id, day_number, title, theme, day_objective, lesson_flow, key_teaching_quote, behaviors_instilled, end_of_day_outcomes, facilitator_close")
    .eq("program_id", program.id)
    .order("day_number")

  const dayIds = (curriculumDays ?? []).map((d) => d.id)

  const { data: sections } = dayIds.length
    ? await supabase
        .from("wf-curriculum_sections")
        .select("id, day_id, sort_order, section_type, title, content")
        .in("day_id", dayIds)
        .order("sort_order")
    : { data: [] as any[] }

  const sectionIds = (sections ?? []).map((s) => s.id)

  const { data: exercises } = sectionIds.length
    ? await supabase
        .from("wf-curriculum_exercises")
        .select("id, section_id, sort_order, question, question_type, options, thinking_prompts")
        .in("section_id", sectionIds)
        .order("sort_order")
    : { data: [] as any[] }

  // Assemble nested structure
  const exercisesBySection = new Map<string, any[]>()
  for (const ex of exercises ?? []) {
    const arr = exercisesBySection.get(ex.section_id) ?? []
    arr.push(ex)
    exercisesBySection.set(ex.section_id, arr)
  }

  const sectionsByDay = new Map<string, any[]>()
  for (const sec of sections ?? []) {
    const arr = sectionsByDay.get(sec.day_id) ?? []
    arr.push({ ...sec, curriculum_exercises: exercisesBySection.get(sec.id) ?? [] })
    sectionsByDay.set(sec.day_id, arr)
  }

  const curriculum = (curriculumDays ?? []).map((day) => ({
    ...day,
    curriculum_sections: (sectionsByDay.get(day.id) ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }))

  // Fetch user action progress
  const { data: userActions } = await supabase
    .from("wf-user_actions")
    .select("day_number, action_index, completed")
    .eq("enrollment_id", enrollment.id)

  // Calculate total exercises per day and completed actions per day
  const sectionToDayId = new Map<string, string>()
  for (const sec of sections ?? []) sectionToDayId.set(sec.id, sec.day_id)

  const dayIdToNumber = new Map<string, number>()
  for (const d of curriculumDays ?? []) dayIdToNumber.set(d.id, d.day_number)

  const totalExercisesPerDay: Record<number, number> = {}
  for (const ex of exercises ?? []) {
    const dayId = sectionToDayId.get(ex.section_id)
    if (dayId) {
      const dayNum = dayIdToNumber.get(dayId)
      if (dayNum !== undefined) totalExercisesPerDay[dayNum] = (totalExercisesPerDay[dayNum] ?? 0) + 1
    }
  }

  const completedActionsPerDay: Record<number, number> = {}
  for (const a of userActions ?? []) {
    if (a.completed) completedActionsPerDay[a.day_number] = (completedActionsPerDay[a.day_number] ?? 0) + 1
  }

  // Find the first incomplete day (effective current day)
  let firstIncompleteDay = totalDays + 1
  const sortedDays = [...(curriculumDays ?? [])].sort((a, b) => a.day_number - b.day_number)
  for (const d of sortedDays) {
    const dayNum = d.day_number
    const total = totalExercisesPerDay[dayNum] ?? 0
    const done = completedActionsPerDay[dayNum] ?? 0
    if (total === 0 || done < total) {
      firstIncompleteDay = dayNum
      break
    }
  }

  // The current day is the first incomplete day (or totalDays if all complete)
  const currentDay = Math.min(firstIncompleteDay, totalDays)

  // Allow viewing a specific day via query parameter, but don't allow viewing future days
  const requestedDay = dayParam ? parseInt(dayParam, 10) : currentDay
  const initialDay = Math.min(requestedDay, currentDay)

  // Fetch user section progress
  const { data: userSectionProgress } = await supabase
    .from("wf-user_section_progress")
    .select("section_id, completed")
    .eq("enrollment_id", enrollment.id)

  // Fetch saved exercise/artifact responses for portfolio
  const { data: userResponses } = await supabase
    .from("wf-user_exercise_responses")
    .select("exercise_id, section_id, day_number, response_text")
    .eq("enrollment_id", enrollment.id)

  return (
    <JourneyClient
      program={{
        slug: program.slug,
        name: program.name,
        badgeColor: program.color ?? "#00c892",
        signalAcronym: program.badge ?? "",
        totalDays,
      }}
      enrollmentId={enrollment.id}
      currentDay={currentDay}
      initialDay={initialDay}
      curriculum={curriculum}
      userActions={userActions ?? []}
      userSectionProgress={userSectionProgress ?? []}
      userResponses={userResponses ?? []}
    />
  )
}
