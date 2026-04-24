import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ProductDashboardShell } from "@/components/product-dashboard-shell"
import { SubscriptionGate } from "@/components/subscription-gate"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: program } = await supabase
    .from("wf-programs")
    .select("name")
    .eq("slug", slug)
    .maybeSingle()

  return {
    title: program ? `${program.name} | Dashboard` : "Dashboard",
  }
}

export default async function ProductDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/signin?redirect=/dashboard/" + slug)

  // Fetch program
  const { data: program } = await supabase
    .from("wf-programs")
    .select("id, slug, name, tagline, color, badge, duration, audience")
    .eq("slug", slug)
    .maybeSingle()

  if (!program) notFound()

  // Get user's profile for name
  const { data: profile } = await supabase
    .from("wf-profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()
  
  const userName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : user.email?.split('@')[0] || undefined

  // Fetch the most recent subscription for this user + program (any status)
  const { data: subscription } = await supabase
    .from("wf-subscriptions")
    .select("id, plan_tier, status, current_period_start, current_period_end, amount_cents")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  console.log('[v0][dashboard-layout] Subscription check:', {
    userId: user.id,
    programId: program.id,
    subscription,
  })

  const now = new Date()

  // A subscription is valid when:
  //  1. It exists
  //  2. status === 'active'
  //  3. amount_cents > 0  (was actually paid via Stripe)
  //  4. current_period_end is either null (lifetime) or in the future
  const isActive =
    subscription !== null &&
    subscription.status === "active" &&
    (subscription.amount_cents ?? 0) > 0 &&
    (subscription.current_period_end == null ||
      new Date(subscription.current_period_end) > now)

  console.log('[v0][dashboard-layout] Subscription validation:', {
    exists: subscription !== null,
    statusActive: subscription?.status === "active",
    hasAmount: (subscription?.amount_cents ?? 0) > 0,
    withinPeriod: subscription?.current_period_end == null || new Date(subscription.current_period_end) > now,
    isActive,
  })

  // Determine whether this is a renewal (had a past subscription) or a first-time purchase
  const isExpired =
    subscription !== null &&
    !isActive

  if (!isActive) {
    return (
      <SubscriptionGate
        program={{
          id: program.id,
          slug: program.slug,
          name: program.name,
          color: program.color ?? undefined,
        }}
        userName={userName}
        isExpired={isExpired}
      />
    )
  }

  // Get or create enrollment for paid users
  let { data: enrollment } = await supabase
    .from("wf-enrollments")
    .select("id, status, current_day, started_at")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  if (!enrollment) {
    // Create enrollment for paid users
    const { data: newEnrollment } = await supabase
      .from("wf-enrollments")
      .upsert(
        {
          user_id: user.id,
          program_id: program.id,
          status: "active",
          current_day: 1,
          started_at: new Date().toISOString(),
        },
        { onConflict: "user_id,program_id" }
      )
      .select("id, status, current_day, started_at")
      .single()

    if (!newEnrollment) {
      redirect(`/programs/${slug}`)
    }

    enrollment = newEnrollment
  }

  // Calculate effective current day based on actual completion data
  const durationMatch = program.duration?.match(/(\d+)/)
  const totalDays = durationMatch ? parseInt(durationMatch[1], 10) : 21

  // Fetch curriculum days and exercises to calculate completion
  const { data: days } = await supabase
    .from("wf-curriculum_days")
    .select("id, day_number")
    .eq("program_id", program.id)
    .order("day_number")

  const dayIds = (days ?? []).map((d) => d.id)

  const { data: sections } = dayIds.length
    ? await supabase.from("wf-curriculum_sections").select("id, day_id").in("day_id", dayIds)
    : { data: [] as { id: string; day_id: string }[] }

  const sectionIds = (sections ?? []).map((s) => s.id)

  const { data: exercises } = sectionIds.length
    ? await supabase.from("wf-curriculum_exercises").select("id, section_id").in("section_id", sectionIds)
    : { data: [] as { id: string; section_id: string }[] }

  // Build maps for counting
  const sectionToDayId = new Map<string, string>()
  for (const sec of sections ?? []) sectionToDayId.set(sec.id, sec.day_id)

  const dayIdToNumber = new Map<string, number>()
  for (const d of days ?? []) dayIdToNumber.set(d.id, d.day_number)

  const totalExercisesPerDay: Record<number, number> = {}
  for (const ex of exercises ?? []) {
    const dayId = sectionToDayId.get(ex.section_id)
    if (dayId) {
      const dayNum = dayIdToNumber.get(dayId)
      if (dayNum !== undefined) totalExercisesPerDay[dayNum] = (totalExercisesPerDay[dayNum] ?? 0) + 1
    }
  }

  // Fetch user's completed actions
  const { data: userActions } = await supabase
    .from("wf-user_actions")
    .select("day_number, completed")
    .eq("enrollment_id", enrollment.id)

  const completedActionsPerDay: Record<number, number> = {}
  for (const a of userActions ?? []) {
    if (a.completed) completedActionsPerDay[a.day_number] = (completedActionsPerDay[a.day_number] ?? 0) + 1
  }

  // Find the first incomplete day
  let actualCompletedDays = 0
  let firstIncompleteDay = totalDays + 1
  const sortedDays = [...(days ?? [])].sort((a, b) => a.day_number - b.day_number)
  for (const d of sortedDays) {
    const dayNum = d.day_number
    const total = totalExercisesPerDay[dayNum] ?? 0
    const done = completedActionsPerDay[dayNum] ?? 0
    if (total > 0 && done >= total) {
      actualCompletedDays++
    } else if (firstIncompleteDay > totalDays) {
      firstIncompleteDay = dayNum
    }
  }

  const currentDay = Math.min(firstIncompleteDay, totalDays)
  const progress = Math.round((actualCompletedDays / totalDays) * 100)

  return (
    <ProductDashboardShell
      program={{
        slug: program.slug,
        name: program.name,
        tagline: program.tagline,
        badgeColor: program.color ?? "#00c892",
        signalAcronym: program.badge ?? "",
      }}
      enrollment={{
        id: enrollment.id,
        currentDay,
        totalDays,
        progress,
        startDate: enrollment.started_at,
        endDate: subscription?.current_period_end ?? null,
        planTier: subscription?.plan_tier ?? "individual",
      }}
    >
      {children}
    </ProductDashboardShell>
  )
}
