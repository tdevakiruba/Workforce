import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  console.log("[auth-callback] GET handler called")
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const next = requestUrl.searchParams.get("next") ?? "/dashboard"

    console.log("[auth-callback] Code:", code ? "present" : "missing", "Next:", next)

    // Validate code exists
    if (!code) {
      console.warn("[auth-callback] No authorization code in request")
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=no_code`)
    }

    // Get env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[auth-callback] Missing Supabase env vars")
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=config`)
    }

    console.log("[auth-callback] Creating Supabase client...")

    // Create a response object first - we'll redirect with this
    const response = NextResponse.redirect(`${requestUrl.origin}${next}`)

    // Create Supabase client with proper cookie handling
    const cookieStore = await cookies()
    const cookiesToSet: Array<{ name: string; value: string; options?: any }> = []

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(toSet) {
          // Collect cookies to set on response later
          toSet.forEach((cookie) => {
            cookiesToSet.push(cookie)
          })
        },
      },
    })

    console.log("[auth-callback] Exchanging code for session...")
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[auth-callback] Exchange failed:", error.message)
      return NextResponse.redirect(
        `${requestUrl.origin}/signin?error=exchange&message=${encodeURIComponent(error.message)}`
      )
    }

    console.log("[auth-callback] Exchange successful, user:", data.user?.email)

    // NOW set all cookies on the response BEFORE redirecting
    cookiesToSet.forEach(({ name, value, options }) => {
      console.log("[auth-callback] Setting cookie:", name)
      response.cookies.set(name, value, options)
    })

    console.log("[auth-callback] Redirecting to:", next)
    return response
  } catch (error) {
    console.error(
      "[auth-callback] Exception:",
      error instanceof Error ? error.message : String(error),
      error instanceof Error ? error.stack : ""
    )
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
