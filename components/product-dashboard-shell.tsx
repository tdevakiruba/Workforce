"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  Compass,
  GraduationCap,
  LayoutDashboard,
  FlaskConical,
  LogOut,
  Menu,
  Award,
  X,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SessionActivityTracker } from "@/components/session-activity-tracker"

interface ProductDashboardShellProps {
  program: {
    slug: string
    name: string
    tagline: string | null
    badgeColor: string
    signalAcronym: string
  }
  enrollment: {
    id: string
    currentDay: number
    totalDays: number
    progress: number
    startDate: string | null
    endDate: string | null
    planTier: string
  }
  children: React.ReactNode
}

const programLogos: Record<string, string> = {
  "workforce-ready": "/images/workforce-ready-logo-transparent.png",
}

const sidebarTabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "frameworks", label: "Frameworks", icon: BookOpen },
  { id: "journey", label: "Journey", icon: Compass },
  { id: "lab", label: "Lab", icon: FlaskConical },
  { id: "certificates", label: "Certificates", icon: Award },
]

export function ProductDashboardShell({
  program,
  enrollment,
  children,
}: ProductDashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/signout", { method: "POST" })
    } finally {
      router.push("/signin")
    }
  }

  const activeTab =
    sidebarTabs.find((tab) =>
      pathname.includes(`/dashboard/${program.slug}/${tab.id}`)
    )?.id ?? "overview"

  const logoSrc = programLogos[program.slug]

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SessionActivityTracker />
      {/* Desktop Sidebar */}
      <aside className="hidden w-96 shrink-0 border-r bg-card lg:block">
        <div className="sticky top-16 flex h-[calc(100vh-64px)] flex-col">
          {/* Program badge header */}
          <div className="border-b p-8">
            <Link
              href="/dashboard"
              className="mb-6 flex items-center gap-3 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-7" />
              All Programs
            </Link>
            <div className="flex flex-col gap-3">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={program.name}
                  width={240}
                  height={72}
                  className="h-auto"
                />
              ) : (
                <>
                  <div className="flex items-center gap-5">
                    <div
                      className="flex size-18 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white"
                      style={{ backgroundColor: program.badgeColor }}
                    >
                      {program.signalAcronym.slice(0, 3)}
                    </div>
                    <h2 className="truncate text-2xl font-bold text-foreground">
                      {program.name}
                    </h2>
                  </div>
                  {program.tagline && (
                    <p className="text-lg text-muted-foreground">
                      {program.tagline}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex-1 px-4 py-6">
            <ul className="flex flex-col gap-2">
              {sidebarTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <li key={tab.id}>
                    <Link
                      href={`/dashboard/${program.slug}/${tab.id}`}
                      className={`flex items-center gap-5 rounded-lg px-5 py-4 text-xl font-medium transition-all ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: `${program.badgeColor}15`,
                              color: program.badgeColor,
                            }
                          : undefined
                      }
                    >
                      <Icon
                        className="size-7"
                        style={isActive ? { color: program.badgeColor } : undefined}
                      />
                      {tab.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Enrollment info footer */}
          <div className="border-t px-8 py-6">
            <div className="flex items-center gap-3 text-lg text-muted-foreground">
              <Calendar className="size-6" />
              {enrollment.startDate && (
                <span>
                  Started{" "}
                  {new Date(enrollment.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3 text-lg text-muted-foreground">
              <GraduationCap className="size-6" />
              <span className="capitalize">{enrollment.planTier} Plan</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-6 flex w-full items-center gap-3 rounded-lg px-4 py-4 text-lg font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <LogOut className="size-6" />
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-16 z-40 flex items-center justify-between border-b bg-card px-6 py-4 lg:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex size-12 items-center justify-center rounded-lg border"
            aria-label="Toggle sidebar"
          >
            {mobileOpen ? (
              <X className="size-6 text-foreground" />
            ) : (
              <Menu className="size-6 text-foreground" />
            )}
          </button>
          {logoSrc ? (
            <Image src={logoSrc} alt={program.name} width={160} height={36} className="h-auto max-w-[140px] xs:max-w-[160px]" />
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="flex size-12 items-center justify-center rounded-lg text-xl font-bold text-white"
                style={{ backgroundColor: program.badgeColor }}
              >
                {program.signalAcronym.slice(0, 3)}
              </div>
              <span className="text-xl font-bold text-foreground truncate max-w-[140px] xs:max-w-[220px]">
                {program.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-lg text-muted-foreground">
          <span
            className="font-bold"
            style={{ color: program.badgeColor }}
          >
            {enrollment.progress}%
          </span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-[112px] z-30 bg-foreground/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 top-[112px] z-40 w-80 border-r bg-card lg:hidden overflow-y-auto">
            <nav className="px-4 py-6">
              <ul className="flex flex-col gap-2">
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <li key={tab.id}>
                      <Link
                        href={`/dashboard/${program.slug}/${tab.id}`}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-5 rounded-lg px-5 py-4 text-xl font-medium transition-all ${
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        style={
                          isActive
                            ? {
                                backgroundColor: `${program.badgeColor}15`,
                                color: program.badgeColor,
                              }
                            : undefined
                        }
                      >
                        <Icon className="size-7" />
                        {tab.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="border-t px-8 py-6 mt-4">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-6" />
                Back to All Programs
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-6 flex w-full items-center gap-3 rounded-lg px-4 py-4 text-lg font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <LogOut className="size-6" />
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content area */}
      <main className="min-w-0 flex-1 pt-12 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
