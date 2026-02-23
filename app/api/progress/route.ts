import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enrollmentId, dayNumber, actionIndex, completed, totalActions } = body

  if (!enrollmentId || dayNumber == null || actionIndex == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Reject toggling actions for already-completed days
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
    return NextResponse.json({ error: "Cannot modify completed day" }, { status: 403 })
  }

  // Upsert action progress
  const { error } = await supabase
    .from("user_actions")
    .upsert(
      {
        user_id: user.id,
        enrollment_id: enrollmentId,
        day_number: dayNumber,
        action_index: actionIndex,
        completed: !!completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      {
        onConflict: "enrollment_id,day_number,action_index",
      }
    )

  if (error) {
    console.error("Upsert action error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  // Check if all actions for this day are now completed → advance current_day
  let dayAdvanced = false
  if (completed && totalActions != null && totalActions > 0) {
    const { data: dayActions } = await supabase
      .from("user_actions")
      .select("action_index, completed")
      .eq("enrollment_id", enrollmentId)
      .eq("day_number", dayNumber)

    const completedCount = (dayActions ?? []).filter((a) => a.completed).length

    if (completedCount >= totalActions) {
      // All actions done for this day - advance enrollment current_day
      const { data: currentEnrollment } = await supabase
        .from("enrollments")
        .select("current_day")
        .eq("id", enrollmentId)
        .single()

      if (currentEnrollment && currentEnrollment.current_day <= dayNumber) {
        const nextDay = dayNumber + 1
        await supabase
          .from("enrollments")
          .update({ current_day: nextDay })
          .eq("id", enrollmentId)

        // Record day completion in user_day_progress
        await supabase
          .from("user_day_progress")
          .upsert(
            {
              user_id: user.id,
              enrollment_id: enrollmentId,
              day_number: dayNumber,
              completed: true,
              completed_at: new Date().toISOString(),
            },
            { onConflict: "enrollment_id,day_number" }
          )

        // Create a placeholder row for the next day (not completed yet)
        await supabase
          .from("user_day_progress")
          .upsert(
            {
              user_id: user.id,
              enrollment_id: enrollmentId,
              day_number: nextDay,
              completed: false,
            },
            { onConflict: "enrollment_id,day_number" }
          )

        dayAdvanced = true
      }
    }
  }

  return NextResponse.json({ ok: true, dayAdvanced })
}
