import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Dashboard",
  description: "Your Workforce Ready learning dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/signin")

  // Check if user has an active enrollment in workforce-ready
  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("slug", "workforce-ready")
    .maybeSingle()

  if (program) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("program_id", program.id)
      .eq("status", "active")
      .maybeSingle()

    if (enrollment) {
      redirect("/dashboard/workforce-ready/overview")
    }
  }

  // No active enrollment -- send back to homepage to enroll
  redirect("/")
}
