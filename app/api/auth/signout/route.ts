import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const response = NextResponse.json({ success: true })

  // Clear the inactivity-tracking cookie
  response.cookies.delete("wf_last_activity")

  return response
}
