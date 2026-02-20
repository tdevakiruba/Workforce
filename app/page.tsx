import { createClient } from "@/lib/supabase/server"
import { ProgramDetail } from "./programs/[slug]/program-detail"

export default async function Home() {
  let supabase: Awaited<ReturnType<typeof createClient>>
  try {
    supabase = await createClient()
  } catch {
    return (
      <div className="flex items-center justify-center px-4 py-32">
        <p className="text-muted-foreground">Unable to load program data. Please try again later.</p>
      </div>
    )
  }

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", "workforce-ready")
    .maybeSingle()

  if (!program) {
    return (
      <div className="flex items-center justify-center px-4 py-32">
        <p className="text-muted-foreground">Program data is not available yet.</p>
      </div>
    )
  }

  const [
    { data: features },
    { data: phases },
    { data: pricing },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("program_features")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_order"),
    supabase
      .from("program_phases")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_order"),
    supabase
      .from("program_pricing")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_order"),
    supabase.auth.getUser(),
  ])

  // Check if user already has active subscription for this program
  let hasSubscription = false
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
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
  const { data: days } = await supabase
    .from("workforce_mindset_21day")
    .select("day_number, title, key_theme")
    .order("day_number")
  const curriculum = days ?? []

  return (
    <ProgramDetail
      program={{ ...program, leaders }}
      features={features ?? []}
      phases={phases ?? []}
      pricing={pricing ?? []}
      curriculum={curriculum}
      isLoggedIn={!!user}
      hasSubscription={hasSubscription}
    />
  )
}
