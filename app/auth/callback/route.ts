import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
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

  // Validate and sanitize the redirect URL
  let redirectPath = next
  if (!redirectPath.startsWith("/")) {
    redirectPath = "/dashboard"
  }
  // Basic validation: only allow alphanumeric, hyphens, underscores, slashes, and query params
  if (!/^[a-zA-Z0-9_\-\/\?\=\&\%\.]*$/.test(redirectPath)) {
    console.warn("[auth-callback] Invalid redirect path, using default:", redirectPath)
    redirectPath = "/dashboard"
  }

  const redirectUrl = `${siteUrl}${redirectPath}`

  // For Next.js 16, we need to create the response first, then set cookies on it
  const cookieStore = await cookies()
  
  // Collect cookies to set on the response
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookies) {
        cookies.forEach((cookie) => {
          cookiesToSet.push(cookie)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[auth-callback] Session exchange failed:", error.message)
    return NextResponse.redirect(`${siteUrl}/signin?error=exchange_failed`)
  }

  // Create the redirect response
  const response = NextResponse.redirect(redirectUrl)

  // Set all cookies on the response
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options)
  }

  return response
}
