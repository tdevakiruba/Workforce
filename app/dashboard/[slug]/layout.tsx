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

  // Check for active PAID subscription first (subscription created after Stripe payment)
  const { data: subscription } = await supabase
    .from("wf-subscriptions")
    .select("id, plan_tier, current_period_start, current_period_end, amount_cents")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  // If no paid subscription exists (or subscription was created without payment),
  // show the subscription gate / pricing page
  const hasPaidSubscription = subscription && subscription.amount_cents && subscription.amount_cents > 0
  
  if (!hasPaidSubscription) {
    return (
      <SubscriptionGate 
        program={{ 
          id: program.id, 
          slug: program.slug, 
          name: program.name, 
          color: program.color ?? undefined 
        }} 
        userName={userName}
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

  // Use the enrollment's current_day (advanced by the progress API when all
  // actions for a day are completed), matching the journey / overview / frameworks pages.
  const durationMatch = program.duration?.match(/(\d+)/)
  const totalDays = durationMatch ? parseInt(durationMatch[1], 10) : 21
  const currentDay = Math.min(enrollment.current_day ?? 1, totalDays)

  const progress = Math.round((currentDay / totalDays) * 100)

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
