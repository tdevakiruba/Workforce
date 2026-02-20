import Link from "next/link"
import Image from "next/image"

export function PlatformFooter() {
  return (
    <footer className="border-t bg-card px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/workforce-icon.png"
                alt="Workforce Ready"
                width={32}
                height={32}
                className="size-8"
              />
              <span className="text-sm font-bold text-foreground">
                Workforce Ready
              </span>
            </Link>
            <p className="max-w-xs text-center text-sm leading-relaxed text-muted-foreground sm:text-left">
              A structured, 21-day leadership program that turns ambition
              into professional excellence.
            </p>
          </div>

          {/* Quick links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/signin"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Get Started
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Workforce Ready. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
