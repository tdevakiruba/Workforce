import { createClient } from "@/lib/supabase/server"
import { PlatformHeader } from "./platform-header"
import { PlatformFooter } from "./platform-footer"

export async function PlatformShell({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // "Auth session missing!" is expected for unauthenticated users - don't log it
      // Only log unexpected errors
      if (!error.message?.includes('Auth session missing')) {
        console.warn("[platform-shell] Failed to get user:", error.message)
      }
    } else {
      user = data.user
    }
  } catch (error) {
    // Supabase not configured yet – render shell without auth
    const msg = error instanceof Error ? error.message : String(error)
    if (!msg.includes('Auth session missing')) {
      console.warn("[platform-shell] Error creating supabase client:", msg)
    }
  }

  return (
    <>
      <PlatformHeader user={user ? { email: user.email } : null} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <PlatformFooter />
    </>
  )
}
