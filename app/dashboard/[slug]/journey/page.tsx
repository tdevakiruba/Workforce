import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JourneyClient } from "./journey-client"

export const dynamic = "force-dynamic"

export default async function JourneyPage({
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
    .from("programs")
    .select("id, slug, name, color, badge, duration")
    .eq("slug", slug)
    .single()

  if (!program) redirect("/dashboard")

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, current_day, started_at")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  if (!enrollment) redirect(`/programs/${slug}`)

  // Calculate current day – use the enrollment's current_day (advanced by the
  // progress API when all actions for a day are completed). Fall back to
  // date-based calculation only when current_day is not set.
  const durationMatch = program.duration?.match(/(\d+)/)
  const totalDays = durationMatch ? parseInt(durationMatch[1], 10) : 21
  const currentDay = Math.min(enrollment.current_day ?? 1, totalDays)

  // Fetch curriculum days with nested sections and exercises
  const { data: curriculumDays } = await supabase
    .from("curriculum_days")
    .select(`
      id, day_number, title, theme,
      day_objective, lesson_flow,
      key_teaching_quote, behaviors_instilled,
      end_of_day_outcomes, facilitator_close,
      curriculum_sections (
        id, sort_order, section_type, title, content,
        curriculum_exercises (
          id, sort_order, question, question_type, options, thinking_prompts
        )
      )
    `)
    .eq("program_id", program.id)
    .order("day_number")

  // Sort nested sections and exercises by sort_order
  const curriculum = (curriculumDays ?? []).map((day) => ({
    ...day,
    curriculum_sections: (day.curriculum_sections ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((section: { curriculum_exercises?: { sort_order: number }[] }) => ({
        ...section,
        curriculum_exercises: (section.curriculum_exercises ?? [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
      })),
  }))

  // Fetch user action progress
  const { data: userActions } = await supabase
    .from("user_actions")
    .select("day_number, action_index, completed")
    .eq("enrollment_id", enrollment.id)

  // Fetch user section progress
  const { data: userSectionProgress } = await supabase
    .from("user_section_progress")
    .select("section_id, completed")
    .eq("enrollment_id", enrollment.id)

  // Fetch saved exercise/artifact responses for portfolio
  const { data: userResponses } = await supabase
    .from("user_exercise_responses")
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
      curriculum={curriculum}
      userActions={userActions ?? []}
      userSectionProgress={userSectionProgress ?? []}
      userResponses={userResponses ?? []}
    />
  )
}
