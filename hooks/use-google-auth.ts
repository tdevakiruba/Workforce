"use client"

import { useEffect, useCallback, useRef } from "react"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

/**
 * Loads the Google Identity Services script and provides a function
 * to trigger popup-based Google sign-in (no redirects).
 */
export function useGoogleAuth(onCredential: (idToken: string) => void) {
  const callbackRef = useRef(onCredential)
  callbackRef.current = onCredential

  useEffect(() => {
    // Load the GSI script if not already present
    if (document.getElementById("google-gsi-script")) return

    const script = document.createElement("script")
    script.id = "google-gsi-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [])

  const triggerGoogleSignIn = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    console.log("[v0] triggerGoogleSignIn called, clientId:", clientId ? "SET" : "NOT SET")
    if (!clientId) {
      console.error("[v0] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set")
      alert("Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.")
      return
    }

    function attemptInit(retries = 0) {
      console.log("[v0] attemptInit retry:", retries, "google available:", !!window.google?.accounts?.id)
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            console.log("[v0] Google credential received, length:", response.credential?.length)
            callbackRef.current(response.credential)
          },
          ux_mode: "popup",
        })
        window.google.accounts.id.prompt((notification: { getMomentType: () => string; getSkippedReason?: () => string; getDismissedReason?: () => string }) => {
          console.log("[v0] Google prompt moment:", notification.getMomentType())
          if (notification.getMomentType() === "skipped") {
            console.log("[v0] Skipped reason:", notification.getSkippedReason?.())
          }
          if (notification.getMomentType() === "dismissed") {
            console.log("[v0] Dismissed reason:", notification.getDismissedReason?.())
          }
        })
      } else if (retries < 20) {
        setTimeout(() => attemptInit(retries + 1), 150)
      } else {
        console.error("[v0] Google GSI script failed to load after 20 retries")
        alert("Google Sign-In failed to load. Please refresh and try again.")
      }
    }

    attemptInit()
  }, [])

  return { triggerGoogleSignIn }
}
