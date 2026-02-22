import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/responses?enrollmentId=xxx
 * Fetches all saved responses for an enrollment.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const enrollmentId = searchParams.get("enrollmentId")

  if (!enrollmentId) {
    return NextResponse.json({ error: "Missing enrollmentId" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("user_exercise_responses")
    .select("id, exercise_id, section_id, day_number, response_text, updated_at")
    .eq("enrollment_id", enrollmentId)

  if (error) {
    console.error("Fetch responses error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }

  return NextResponse.json({ responses: data ?? [] })
}

/**
 * POST /api/responses
 * Upserts a single response for an exercise or artifact section.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enrollmentId, exerciseId, sectionId, dayNumber, responseText } = body

  if (!enrollmentId || dayNumber == null || (!exerciseId && !sectionId)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Reject edits for completed (past) days
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("current_day")
    .eq("id", enrollmentId)
    .eq("user_id", user.id)
    .single()

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
  }

  if (dayNumber < enrollment.current_day) {
    return NextResponse.json({ error: "Cannot edit completed day" }, { status: 403 })
  }

  // Determine which unique constraint to use for the upsert
  const onConflict = exerciseId
    ? "enrollment_id,exercise_id"
    : "enrollment_id,section_id"

  const row: Record<string, unknown> = {
    user_id: user.id,
    enrollment_id: enrollmentId,
    day_number: dayNumber,
    response_text: responseText ?? "",
  }

  if (exerciseId) row.exercise_id = exerciseId
  if (sectionId) row.section_id = sectionId

  const { error } = await supabase
    .from("user_exercise_responses")
    .upsert(row, { onConflict })

  if (error) {
    console.error("Upsert response error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
