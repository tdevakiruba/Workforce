"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TrendingUp, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function PlatformHeader({ user }: { user: { email?: string } | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-wf-mint">
            <TrendingUp className="size-5 text-white" />
          </div>
          <span className="font-serif text-base font-bold tracking-tight text-foreground">
            Workforce Ready
          </span>
        </Link>

        {/* Auth buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button
              asChild
              size="sm"
              className="rounded-lg bg-wf-mint text-white hover:bg-wf-mint-light"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-lg bg-wf-mint text-white hover:bg-wf-mint-light"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X className="size-5 text-foreground" />
          ) : (
            <Menu className="size-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            {user ? (
              <Button
                asChild
                className="rounded-lg bg-wf-mint text-white hover:bg-wf-mint-light"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-lg bg-wf-mint text-white hover:bg-wf-mint-light"
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
