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
    if (!clientId) {
      console.error("[v0] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set")
      return
    }

    function attemptInit(retries = 0) {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            callbackRef.current(response.credential)
          },
          ux_mode: "popup",
        })
        window.google.accounts.id.prompt()
      } else if (retries < 20) {
        // Script may still be loading, retry after a short delay
        setTimeout(() => attemptInit(retries + 1), 150)
      }
    }

    attemptInit()
  }, [])

  return { triggerGoogleSignIn }
}
