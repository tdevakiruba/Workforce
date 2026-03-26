import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * POST /api/enroll
 * 
 * This endpoint now only creates an ENROLLMENT record (not a subscription).
 * Subscriptions are created only after successful Stripe payment via:
 *   - /api/stripe/verify-session
 *   - /api/stripe/webhook
 * 
 * If a user tries to access the dashboard without a paid subscription,
 * they will see the subscription gate prompting them to pay.
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { programSlug } = body

  if (!programSlug) {
    return NextResponse.json(
      { error: "Missing programSlug" },
      { status: 400 }
    )
  }

  // Get program
  const { data: program, error: programError } = await supabase
    .from("wf-programs")
    .select("id, slug, name, duration")
    .eq("slug", programSlug)
    .single()

  if (programError || !program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 })
  }

  // Check if user has an active PAID subscription
  const { data: existingSub } = await supabase
    .from("wf-subscriptions")
    .select("id, status, amount_cents, current_period_end")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()

  const now = new Date()
  const hasPaidSubscription =
    existingSub !== null &&
    (existingSub.amount_cents ?? 0) > 0 &&
    (existingSub.current_period_end == null ||
      new Date(existingSub.current_period_end) > now)

  if (hasPaidSubscription) {
    // User already has a paid subscription, just redirect to dashboard
    return NextResponse.json({ 
      message: "Already subscribed", 
      redirectTo: `/dashboard/${program.slug}` 
    })
  }

  // User does NOT have a paid subscription.
  // Redirect them to the dashboard where the subscription gate will show.
  // The subscription gate has the Stripe checkout embedded.
  return NextResponse.json({
    message: "Payment required",
    redirectTo: `/dashboard/${program.slug}`,
    requiresPayment: true,
  })
}
