import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OverviewClient } from "./overview-client"

export const dynamic = "force-dynamic"

export default async function OverviewPage({
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

  // Get program
  const { data: program } = await supabase
    .from("wf-programs")
    .select("id, slug, name, tagline, color, badge, duration, audience, short_description")
    .eq("slug", slug)
    .single()

  if (!program) redirect("/dashboard")

  // Get enrollment (layout already ensures enrollment exists via auto-enroll)
  const { data: enrollment } = await supabase
    .from("wf-enrollments")
    .select("id, current_day, started_at, status")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  if (!enrollment) redirect("/dashboard")

  // Get subscription
  const { data: subscription } = await supabase
    .from("wf-subscriptions")
    .select("plan_tier, current_period_start, current_period_end")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  // Use the enrollment's current_day (advanced by the progress API when all
  // actions for a day are completed), matching the journey page behaviour.
  const durationMatch = program.duration?.match(/(\d+)/)
  const totalDays = durationMatch ? parseInt(durationMatch[1], 10) : 21
  const currentDay = Math.min(enrollment.current_day ?? 1, totalDays)

  // Get user actions completed
  const { count: actionsCompleted } = await supabase
    .from("wf-user_actions")
    .select("*", { count: "exact", head: true })
    .eq("enrollment_id", enrollment.id)
    .eq("completed", true)

  // Get streak
  const { data: streak } = await supabase
    .from("wf-user_streaks")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("enrollment_id", enrollment.id)
    .maybeSingle()

  // Get today's insight (title + theme for the daily quote tile)
  let dailyInsight: { title: string; keyTheme: string } | null = null
  const { data: dayData } = await supabase
    .from("wf-curriculum_days")
    .select("title, theme")
    .eq("program_id", program.id)
    .eq("day_number", currentDay)
    .maybeSingle()
  if (dayData) {
    dailyInsight = {
      title: dayData.title,
      keyTheme: dayData.theme ?? "",
    }
  }

  return (
    <OverviewClient
      program={{
        name: program.name,
        slug: program.slug,
        tagline: program.tagline,
        description: program.short_description,
        badgeColor: program.color ?? "#00c892",
        signalAcronym: program.badge ?? "",
        audience: program.audience,
        totalDays,
      }}
      enrollment={{
        currentDay,
        totalDays,
        progress: Math.round((currentDay / totalDays) * 100),
        startDate: enrollment.started_at,
        endDate: subscription?.current_period_end ?? null,
        planTier: subscription?.plan_tier ?? "individual",
      }}
      stats={{
        actionsCompleted: actionsCompleted ?? 0,
        currentStreak: streak?.current_streak ?? 0,
        longestStreak: streak?.longest_streak ?? 0,
        lastActivity: streak?.last_activity_date ?? null,
      }}
      phases={[]}
      dailyInsight={dailyInsight}
    />
  )
}
