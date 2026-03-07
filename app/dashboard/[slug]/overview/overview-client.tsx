"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  MapPin,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react"

/* ── Phase definitions ── */
const PHASES = [
  {
    id: "foundation",
    label: "Foundation",
    dayStart: 1,
    dayEnd: 7,
    color: "#00c892",
    icon: Rocket,
    tagline: "Enter the AI Workforce",
  },
  {
    id: "strategic",
    label: "Strategic Operation",
    dayStart: 8,
    dayEnd: 14,
    color: "#0077b6",
    icon: TrendingUp,
    tagline: "Operate Inside AI-Powered Orgs",
  },
  {
    id: "leadership",
    label: "Leadership Trajectory",
    dayStart: 15,
    dayEnd: 21,
    color: "#1b2a4a",
    icon: Crown,
    tagline: "Rise in Human + AI Teams",
  },
]

interface Phase {
  id: string
  phase_number: number
  title: string
  description: string | null
  day_start: number | null
  day_end: number | null
  sort_order: number
}

interface OverviewClientProps {
  program: {
    name: string
    slug: string
    tagline: string | null
    description: string | null
    badgeColor: string
    signalAcronym: string
    audience: string | null
    totalDays: number
  }
  enrollment: {
    currentDay: number
    totalDays: number
    progress: number
    startDate: string | null
    endDate: string | null
    planTier: string
  }
  stats: {
    actionsCompleted: number
    currentStreak: number
    longestStreak: number
    lastActivity: string | null
  }
  phases: Phase[]
  dailyInsight: { title: string; keyTheme: string } | null
}

export function OverviewClient({
  program,
  enrollment,
  stats,
  dailyInsight,
}: OverviewClientProps) {
  const daysRemaining = enrollment.totalDays - enrollment.currentDay
  const currentPhase = PHASES.find(
    (p) =>
      enrollment.currentDay >= p.dayStart &&
      enrollment.currentDay <= p.dayEnd
  )

  return (
    <div className="mx-auto w-full">
      {/* ── Top Row: Hero (left) + Progress Tile (right) ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Hero / CTA -- takes 2 cols */}
        <div
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-12 lg:col-span-2"
          style={{ backgroundColor: program.badgeColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">
                Day {enrollment.currentDay}
              </span>
              {currentPhase && (
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80">
                  {currentPhase.label}
                </span>
              )}
            </div>

            {dailyInsight ? (
              <h1 className="mt-8 text-balance text-5xl font-extrabold leading-tight text-white sm:text-6xl">
                {dailyInsight.title}
              </h1>
            ) : (
              <h1 className="mt-8 text-5xl font-extrabold text-white sm:text-6xl">
                {program.name}
              </h1>
            )}

            {dailyInsight?.keyTheme && (
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/75">
                {dailyInsight.keyTheme}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-5">
              <Link
                href={`/dashboard/${program.slug}/journey`}
                className="flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-bold shadow-lg transition-all hover:shadow-xl"
                style={{ color: program.badgeColor }}
              >
                <Zap className="size-6" />
                {"Start Today's Session"}
                <ArrowRight className="size-6" />
              </Link>
              <Link
                href={`/dashboard/${program.slug}/frameworks`}
                className="flex items-center gap-3 rounded-xl bg-white/15 px-8 py-4 text-lg font-bold text-white backdrop-blur transition-all hover:bg-white/25"
              >
                <BookOpen className="size-6" />
                Frameworks
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Side Tile */}
        <div className="flex flex-col gap-6">
          {/* Circular progress */}
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border bg-card p-10">
            <div className="relative flex size-48 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/40"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={program.badgeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - enrollment.progress / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-extrabold text-foreground">
                  {enrollment.progress}%
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Complete
                </span>
              </div>
            </div>
            <p className="mt-6 text-center text-lg text-muted-foreground">
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : "Program complete!"}
            </p>
          </div>

          {/* Compact stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-xl border bg-card p-6">
              <Target
                className="mb-3 size-8"
                style={{ color: program.badgeColor }}
              />
              <span className="text-3xl font-extrabold text-foreground">
                {stats.actionsCompleted}
              </span>
              <span className="text-sm text-muted-foreground">Actions</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border bg-card p-6">
              <Flame className="mb-3 size-8 text-amber-500" />
              <span className="text-3xl font-extrabold text-foreground">
                {stats.currentStreak}
              </span>
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border bg-card p-6">
              <Trophy className="mb-3 size-8 text-[#1b2a4a]" />
              <span className="text-3xl font-extrabold text-foreground">
                {stats.longestStreak}
              </span>
              <span className="text-sm text-muted-foreground">Best</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Journey Phases (horizontal) ── */}
      <div className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold text-foreground">
            <MapPin className="size-7" style={{ color: program.badgeColor }} />
            Journey Map
          </h2>
          <span className="text-lg font-bold text-muted-foreground">
            {daysRemaining > 0 ? `${daysRemaining} days left` : "Complete!"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PHASES.map((phase) => {
            const PhaseIcon = phase.icon
            const isActive =
              enrollment.currentDay >= phase.dayStart &&
              enrollment.currentDay <= phase.dayEnd
            const isCompleted = enrollment.currentDay > phase.dayEnd
            const phaseProgress = isCompleted
              ? 100
              : isActive
                ? Math.round(
                    ((enrollment.currentDay - phase.dayStart) /
                      (phase.dayEnd - phase.dayStart + 1)) *
                      100
                  )
                : 0

            return (
              <Link
                key={phase.id}
                href={`/dashboard/${program.slug}/journey`}
                className={`group flex items-center gap-4 rounded-2xl border p-6 transition-all hover:shadow-lg ${
                  isActive
                    ? "shadow-md"
                    : isCompleted
                      ? ""
                      : "opacity-40"
                }`}
                style={{
                  borderColor: isActive ? phase.color : undefined,
                  backgroundColor: isActive ? `${phase.color}06` : undefined,
                }}
              >
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: phase.color }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-7" />
                  ) : (
                    <PhaseIcon className="size-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-lg font-bold text-foreground">
                      {phase.label}
                    </h3>
                    {isActive && (
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-sm font-bold text-white"
                        style={{ backgroundColor: phase.color }}
                      >
                        Now
                      </span>
                    )}
                  </div>
                  <p className="text-base text-muted-foreground">
                    Days {phase.dayStart}-{phase.dayEnd}
                    {(isActive || isCompleted) && (
                      <span className="ml-3 font-bold text-lg" style={{ color: phase.color }}>
                        {phaseProgress}%
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Bottom Row: Quick Actions + Program Details ── */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-3xl border bg-card p-8">
          <h3 className="mb-6 text-2xl font-extrabold text-foreground">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-4">
            <Link
              href={`/dashboard/${program.slug}/journey`}
              className="flex items-center gap-5 rounded-xl p-5 transition-all hover:bg-muted/50"
              style={{ backgroundColor: `${program.badgeColor}06` }}
            >
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: program.badgeColor }}
              >
                <Zap className="size-7" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-bold text-card-foreground">
                  {"Today's Session"}
                </span>
                <p className="text-base text-muted-foreground">
                  Day {enrollment.currentDay} content
                </p>
              </div>
              <ArrowRight className="size-6 text-muted-foreground" />
            </Link>
            <Link
              href={`/dashboard/${program.slug}/frameworks`}
              className="flex items-center gap-5 rounded-xl border p-5 transition-all hover:bg-muted/50"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <BookOpen className="size-7" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-bold text-card-foreground">
                  View Frameworks
                </span>
                <p className="text-base text-muted-foreground">
                  All {enrollment.totalDays} daily frameworks
                </p>
              </div>
              <ArrowRight className="size-6 text-muted-foreground" />
            </Link>
            <Link
              href={`/dashboard/${program.slug}/certificates`}
              className="flex items-center gap-5 rounded-xl border p-5 transition-all hover:bg-muted/50"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Trophy className="size-7" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-bold text-card-foreground">
                  Certificates
                </span>
                <p className="text-base text-muted-foreground">
                  View earned credentials
                </p>
              </div>
              <ArrowRight className="size-6 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Program Details Card */}
        <div className="rounded-3xl border bg-card p-8">
          <h3 className="mb-6 text-2xl font-extrabold text-foreground">
            Program Details
          </h3>
          <dl className="space-y-5">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-3 text-lg text-muted-foreground">
                <Clock className="size-6" />
                Duration
              </dt>
              <dd className="text-lg font-bold text-card-foreground">
                {program.totalDays} days
              </dd>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-3 text-lg text-muted-foreground">
                <Calendar className="size-6" />
                Started
              </dt>
              <dd className="text-lg font-bold text-card-foreground">
                {enrollment.startDate
                  ? new Date(enrollment.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </dd>
            </div>
            {enrollment.endDate && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-3 text-lg text-muted-foreground">
                    <Calendar className="size-6" />
                    Target Completion
                  </dt>
                  <dd className="text-lg font-bold text-card-foreground">
                    {new Date(enrollment.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </>
            )}
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <dt className="text-lg text-muted-foreground">Plan</dt>
              <dd className="text-lg font-bold capitalize text-card-foreground">
                {enrollment.planTier}
              </dd>
            </div>
            {stats.lastActivity && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <dt className="text-lg text-muted-foreground">
                    Last Activity
                  </dt>
                  <dd className="text-lg font-bold text-card-foreground">
                    {new Date(stats.lastActivity).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {/* Today's date */}
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-muted/50 p-5">
            <Sparkles
              className="size-6"
              style={{ color: program.badgeColor }}
            />
            <span className="text-base font-medium text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
