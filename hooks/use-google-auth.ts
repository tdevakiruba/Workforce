"use client"

import { useEffect, useCallback, useRef } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          cancel: () => void
        }
      }
    }
    handleGoogleCredential?: (response: any) => void
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Popup-based Google sign-in using Google Identity Services.
 * Returns an ID token without any server-side redirects.
 */
export function useGoogleAuth(onCredential: (idToken: string) => void) {
  const callbackRef = useRef(onCredential)
  callbackRef.current = onCredential
  const initializedRef = useRef(false)

  // Load GSI script
  useEffect(() => {
    if (document.getElementById("google-gsi-script")) return

    const script = document.createElement("script")
    script.id = "google-gsi-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [])

  // Initialize Google Sign-In once script loads
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    // Set up global callback that GSI will invoke
    window.handleGoogleCredential = (response: { credential: string }) => {
      if (response.credential) {
        callbackRef.current(response.credential)
      }
    }

    function tryInit(retries = 0) {
      if (window.google?.accounts?.id && !initializedRef.current) {
        initializedRef.current = true
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleGoogleCredential,
        })
      } else if (retries < 30) {
        setTimeout(() => tryInit(retries + 1), 200)
      }
    }

    tryInit()

    return () => {
      delete window.handleGoogleCredential
    }
  }, [])

  const triggerGoogleSignIn = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.error("[v0] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set")
      return
    }

    if (!window.google?.accounts?.id) {
      console.error("[v0] Google GSI not loaded yet")
      return
    }

    // Re-initialize to ensure callback is fresh, then prompt
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        if (response.credential) {
          callbackRef.current(response.credential)
        }
      },
    })
    window.google.accounts.id.prompt()
  }, [])

  return { triggerGoogleSignIn }
}
