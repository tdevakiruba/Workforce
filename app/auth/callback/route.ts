import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard"

    const siteUrl =
      process.env.NODE_ENV === "development"
        ? origin
        : process.env.NEXT_PUBLIC_SITE_URL

    // Validate required environment variables
    if (!siteUrl) {
      console.error(
        "[auth-callback] Missing NEXT_PUBLIC_SITE_URL or invalid origin"
      )
      return NextResponse.redirect(`${origin}/signin?error=missing_config`)
    }

    // If no code provided, redirect with error
    if (!code) {
      console.warn("[auth-callback] No authorization code provided")
      return NextResponse.redirect(`${siteUrl}/signin?error=no_code`)
    }

    // Exchange code for session
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[auth-callback] Session exchange failed:", {
        error: error.message,
        code: error.code,
        status: error.status,
      })
      return NextResponse.redirect(`${siteUrl}/signin?error=exchange_failed`)
    }

    if (!data.session) {
      console.error("[auth-callback] No session returned after code exchange")
      return NextResponse.redirect(`${siteUrl}/signin?error=no_session`)
    }

    console.log("[auth-callback] Successfully exchanged code for session")

    // Validate and sanitize the redirect URL
    let redirectPath = next
    try {
      // Ensure it's a relative path and doesn't contain invalid characters
      if (!redirectPath.startsWith("/")) {
        redirectPath = "/dashboard"
      }
      // Basic validation: only allow alphanumeric, hyphens, underscores, and slashes
      if (!/^[\w\-\/]*$/.test(redirectPath)) {
        redirectPath = "/dashboard"
      }
    } catch {
      redirectPath = "/dashboard"
    }

    const redirectUrl = `${siteUrl}${redirectPath}`
    console.log("[auth-callback] Redirecting to:", redirectPath)

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error("[auth-callback] Unexpected error:", err)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/signin?error=internal_error`)
  }
}
