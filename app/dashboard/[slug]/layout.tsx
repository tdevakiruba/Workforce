import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ProductDashboardShell } from "@/components/product-dashboard-shell"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: program } = await supabase
    .from("programs")
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
    .from("programs")
    .select("id, slug, name, tagline, color, badge, duration, audience")
    .eq("slug", slug)
    .maybeSingle()

  if (!program) notFound()

  // Verify active enrollment -- auto-enroll if not found
  let { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status, current_day, started_at")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  if (!enrollment) {
    // Auto-enroll the user
    const { data: newEnrollment } = await supabase
      .from("enrollments")
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

    // Also create a default subscription if none exists
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("program_id", program.id)
      .eq("status", "active")
      .maybeSingle()

    if (!existingSub) {
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        program_id: program.id,
        plan_tier: "individual",
        status: "active",
        current_period_start: new Date().toISOString(),
      })
    }

    enrollment = newEnrollment
  }

  // Get subscription info
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_tier, current_period_start, current_period_end")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

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
