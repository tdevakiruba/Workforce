"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

/**
 * Tracks user activity (mouse, keyboard, scroll, touch) and expires the
 * session after 15 minutes of inactivity.
 *
 * - Updates the `wf_last_activity` cookie on interaction (debounced).
 * - Checks every 60 seconds whether the idle limit has been exceeded.
 * - On expiry, signs out via Supabase and redirects to /signin.
 */

const SESSION_IDLE_LIMIT_MS = 15 * 60 * 1000 // 15 minutes
const CHECK_INTERVAL_MS = 60 * 1000 // check every 60 seconds
const COOKIE_NAME = "wf_last_activity"

function getLastActivity(): number {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
  return match ? Number(match.split("=")[1]) : Date.now()
}

function stampActivity() {
  const now = String(Date.now())
  document.cookie = `${COOKIE_NAME}=${now};path=/;max-age=${Math.ceil(SESSION_IDLE_LIMIT_MS / 1000) + 60};samesite=lax`
}

export function SessionActivityTracker() {
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleActivity = useCallback(() => {
    // Debounce cookie writes to at most once every 30 seconds
    if (debounceRef.current) return
    stampActivity()
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
    }, 30_000)
  }, [])

  useEffect(() => {
    // Stamp on mount so the cookie is always fresh when the page loads
    stampActivity()

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"] as const
    for (const e of events) {
      window.addEventListener(e, handleActivity, { passive: true })
    }

    // Periodic check: sign out if idle
    const interval = setInterval(async () => {
      const elapsed = Date.now() - getLastActivity()
      if (elapsed > SESSION_IDLE_LIMIT_MS) {
        clearInterval(interval)
        try {
          const supabase = createClient()
          await supabase.auth.signOut()
        } catch {
          // Ignore errors during sign-out
        }
        router.push("/signin?reason=session_expired")
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      for (const e of events) {
        window.removeEventListener(e, handleActivity)
      }
      clearInterval(interval)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [handleActivity, router])

  // Renders nothing — purely behavioural
  return null
}
