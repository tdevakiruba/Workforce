"use client"

import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Compass,
  LayoutDashboard,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Journey {
  enrollmentId: string
  programId: string
  programName: string
  programSlug: string
  tagline: string
  audience: string
  badgeColor: string
  signalAcronym: string
  currentDay: number
  totalDays: number
  startDate: string | null
  endDate: string | null
  progress: number
}

interface RecommendedProgram {
  id: string
  name: string
  slug: string
  tagline: string | null
  duration: string | null
  color: string | null
  badge: string | null
  audience: string | null
}

interface DashboardClientProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  journeys: Journey[]
  recommended: RecommendedProgram[]
}

export function DashboardClient({
  user,
  journeys,
  recommended,
}: DashboardClientProps) {
  const displayName = user.firstName || user.email.split("@")[0]
  const totalProgress =
    journeys.length > 0
      ? Math.round(
          journeys.reduce((acc, j) => acc + j.progress, 0) / journeys.length
        )
      : 0

  return (
    <div className="min-h-[80vh] bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {displayName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your career operating system is active.
            </p>
          </div>
          {journeys.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="rounded-xl border bg-card px-4 py-2.5 text-center">
                <div className="text-lg font-extrabold text-[#00c892]">
                  {journeys.length}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground">
                  Active
                </div>
              </div>
              <div className="rounded-xl border bg-card px-4 py-2.5 text-center">
                <div className="text-lg font-extrabold text-foreground">
                  {totalProgress}%
                </div>
                <div className="text-[10px] font-medium text-muted-foreground">
                  Avg Progress
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Programs */}
        {journeys.length > 0 ? (
          <section className="mb-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Your Programs
              </h2>
              <span className="text-xs text-muted-foreground">
                {journeys.length} active
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {journeys.map((j) => (
                <div
                  key={j.enrollmentId}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:shadow-[#00c892]/5 hover:border-[#00c892]/30"
                >
                  {/* Top accent */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: j.badgeColor }}
                  />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: j.badgeColor }}
                      >
                        {j.signalAcronym}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        Day {j.currentDay} of {j.totalDays}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-card-foreground">
                      {j.programName}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {j.tagline}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          Progress
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: j.badgeColor }}
                        >
                          {j.progress}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${j.progress}%`,
                            backgroundColor: j.badgeColor,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/${j.programSlug}/overview`}
                      className="mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: j.badgeColor }}
                    >
                      <LayoutDashboard className="size-4" />
                      Open Dashboard
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-14">
            <div className="rounded-2xl border bg-card p-10 text-center sm:p-14">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#00c892]/10">
                <Compass className="size-8 text-[#00c892]" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">
                Start your AI career operating system
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Build the judgment, accountability, and clarity that employers
                demand. Choose a program below to get started.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 rounded-xl bg-[#00c892] px-8 font-bold text-white hover:bg-[#00c892]/90"
              >
                <Link href="/programs">
                  Explore Programs
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Discover More */}
        {recommended.length > 0 && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Available Programs
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  AI career operating systems to accelerate your growth
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-full text-xs"
              >
                <Link href="/programs">
                  View All
                  <ChevronRight className="ml-1 size-3" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  href={`/programs/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:border-[#00c892]/20"
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: p.color || "#00c892" }}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase text-white"
                        style={{
                          backgroundColor: p.color || "#00c892",
                        }}
                      >
                        {(p.name || "P").slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-card-foreground group-hover:text-[#00c892]">
                          {p.name}
                        </h3>
                        {p.duration && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {p.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    {p.audience && (
                      <p className="mb-4 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                        <Users className="mt-0.5 size-3 shrink-0" />
                        <span>{p.audience}</span>
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#00c892] group-hover:underline">
                        Learn more
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#00c892]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
