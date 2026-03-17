import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard"

    const siteUrl =
      process.env.NODE_ENV === "development"
        ? origin
        : process.env.NEXT_PUBLIC_SITE_URL || origin

    // If no code provided, redirect with error
    if (!code) {
      console.warn("[auth-callback] No authorization code provided")
      return NextResponse.redirect(`${siteUrl}/signin?error=no_code`)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[auth-callback] Missing Supabase environment variables")
      return NextResponse.redirect(`${siteUrl}/signin?error=missing_config`)
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[auth-callback] Session exchange failed:", error.message)
      return NextResponse.redirect(`${siteUrl}/signin?error=exchange_failed`)
    }

    // Validate and sanitize the redirect URL
    let redirectPath = next
    if (!redirectPath.startsWith("/")) {
      redirectPath = "/dashboard"
    }
    // Basic validation: only allow alphanumeric, hyphens, underscores, slashes, and query params
    // Use a more permissive pattern that handles common URL characters
    if (!/^[a-zA-Z0-9_\-\/\?\=\&\%\.]*$/.test(redirectPath)) {
      console.warn("[auth-callback] Invalid redirect path, using default:", redirectPath)
      redirectPath = "/dashboard"
    }

    const redirectUrl = `${siteUrl}${redirectPath}`
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[auth-callback] Unexpected error:", error instanceof Error ? error.message : String(error))
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
    return NextResponse.redirect(`${siteUrl}/signin?error=server_error`)
  }
}
