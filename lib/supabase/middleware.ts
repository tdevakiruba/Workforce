import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** How long (in ms) a session may sit idle before we expire it. */
const SESSION_IDLE_LIMIT_MS = 15 * 60 * 1000 // 15 minutes
const ACTIVITY_COOKIE = 'wf_last_activity'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase env vars not yet available – let the request pass through
    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/protected')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  // --- 15-minute inactivity check (protected routes only) ---
  if (user && isProtected) {
    const lastActivity = request.cookies.get(ACTIVITY_COOKIE)?.value
    const now = Date.now()

    if (lastActivity) {
      const elapsed = now - Number(lastActivity)
      if (elapsed > SESSION_IDLE_LIMIT_MS) {
        // Session expired due to inactivity – sign the user out
        await supabase.auth.signOut()

        const url = request.nextUrl.clone()
        url.pathname = '/signin'
        url.searchParams.set('reason', 'session_expired')
        const redirect = NextResponse.redirect(url)

        // Copy Supabase cookies (now cleared) so browser is in sync
        redirect.cookies.setAll(supabaseResponse.cookies.getAll())
        // Delete the activity cookie
        redirect.cookies.delete(ACTIVITY_COOKIE)
        return redirect
      }
    }

    // Stamp / refresh the activity cookie on every request
    supabaseResponse.cookies.set(ACTIVITY_COOKIE, String(now), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // Cookie itself expires a bit after the idle limit so stale cookies
      // don't linger forever.
      maxAge: Math.ceil(SESSION_IDLE_LIMIT_MS / 1000) + 60,
    })
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
