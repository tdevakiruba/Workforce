import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProgramDetail } from "./program-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: program } = await supabase
      .from("wf-programs")
      .select("name, tagline")
      .eq("slug", slug)
      .maybeSingle()

    if (!program) return { title: "Program Not Found" }

    return {
      title: program.name,
      description: program.tagline,
    }
  } catch {
    return { title: "Program" }
  }
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    supabase = await createClient()
  } catch {
    notFound()
    return // unreachable but satisfies TS
  }

  const { data: program } = await supabase
    .from("wf-programs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (!program) notFound()

  const [
    { data: features },
    { data: phases },
    { data: pricing },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("wf-program_features")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_order"),
    supabase
      .from("wf-program_phases")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_order"),
    supabase
      .from("wf-program_pricing")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_order"),
    supabase.auth.getUser(),
  ])

  // Check if user already has active subscription for this program
  let hasSubscription = false
  if (user) {
    const { data: sub } = await supabase
      .from("wf-subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("program_id", program.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()
    hasSubscription = !!sub
  }

  // Parse leaders if stored as JSON string
  let leaders: string[] = []
  if (program.leaders) {
    try {
      leaders =
        typeof program.leaders === "string"
          ? JSON.parse(program.leaders)
          : Array.isArray(program.leaders)
          ? program.leaders
          : []
    } catch {
      leaders = []
    }
  }

  // Fetch curriculum titles only (no full content - that's gated behind subscription)
  let curriculum: {
    day_number: number
    title: string
    key_theme: string | null
  }[] = []

  const { data: days } = await supabase
    .from("wf-curriculum_days")
    .select("day_number, title, theme")
    .eq("program_id", program.id)
    .order("day_number")
  curriculum = (days ?? []).map((d) => ({
    day_number: d.day_number,
    title: d.title,
    key_theme: d.theme,
  }))

  // Transform DB pricing rows to the PricingTier interface the component expects
  const mappedPricing = (pricing ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    tier: row.plan_tier as string,
    name: row.label as string,
    subtitle: row.description as string | null,
    price:
      row.plan_tier === "enterprise"
        ? null
        : row.plan_tier === "starter"
          ? "Free"
          : `$${((row.price_cents as number) / 100).toFixed(0)}`,
    original_price: null,
    price_note:
      row.plan_tier === "individual" ? "one-time payment" : null,
    features: Array.isArray(row.features) ? row.features : [],
    cta_label:
      row.plan_tier === "enterprise"
        ? "Contact Sales"
        : row.plan_tier === "starter"
          ? "Get Started Free"
          : "Enroll Now",
    cta_href: row.plan_tier === "enterprise" ? "/organizations" : null,
    highlighted: row.is_popular === true,
    sort_order: row.sort_order as number,
  }))

  return (
    <ProgramDetail
      program={{ ...program, leaders }}
      features={features ?? []}
      phases={phases ?? []}
      pricing={mappedPricing}
      curriculum={curriculum}
      isLoggedIn={!!user}
      hasSubscription={hasSubscription}
    />
  )
}
