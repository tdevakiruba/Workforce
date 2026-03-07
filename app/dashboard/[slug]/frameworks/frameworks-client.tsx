"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Crown,
  Lock,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"

/* ── Phase definitions (same as journey + overview) ── */
const PHASES = [
  {
    id: "foundation",
    label: "Foundation",
    dayStart: 1,
    dayEnd: 7,
    color: "#00c892",
    icon: Rocket,
    tagline: "Build your professional identity",
  },
  {
    id: "growth",
    label: "Growth Strategy",
    dayStart: 8,
    dayEnd: 14,
    color: "#0077b6",
    icon: TrendingUp,
    tagline: "Develop core leadership skills",
  },
  {
    id: "mastery",
    label: "Leadership Mastery",
    dayStart: 15,
    dayEnd: 21,
    color: "#1b2a4a",
    icon: Crown,
    tagline: "Lead with influence and trust",
  },
]

interface FrameworksClientProps {
  program: {
    slug: string
    name: string
    badgeColor: string
    signalAcronym: string
    totalDays: number
  }
  currentDay: number
  curriculum: {
    day_number: number
    title: string
    key_theme: string | null
  }[]
  completionMap: Record<number, { total: number; done: number }>
  phases: {
    number: number
    title: string
    dayStart: number
    dayEnd: number
  }[]
}

export function FrameworksClient({
  program,
  currentDay,
  curriculum,
  completionMap,
}: FrameworksClientProps) {
  const [search, setSearch] = useState("")
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null)

  const completedCount = curriculum.filter((d) => {
    const c = completionMap[d.day_number]
    return c && c.done > 0 && c.done >= c.total
  }).length
  const remaining = curriculum.length - completedCount

  const currentPhase = PHASES.find(
    (p) => currentDay >= p.dayStart && currentDay <= p.dayEnd
  )
  const recommendedDay = curriculum.find((d) => d.day_number === currentDay)

  const filtered = useMemo(() => {
    let result = curriculum
    if (activePhaseId) {
      const phase = PHASES.find((p) => p.id === activePhaseId)
      if (phase) {
        result = result.filter(
          (d) => d.day_number >= phase.dayStart && d.day_number <= phase.dayEnd
        )
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.key_theme && d.key_theme.toLowerCase().includes(q))
      )
    }
    return result
  }, [curriculum, activePhaseId, search])

  function getDayStatus(dayNum: number) {
    if (dayNum > currentDay) return "locked"
    const c = completionMap[dayNum]
    if (c && c.done > 0 && c.done >= c.total) return "completed"
    if (dayNum === currentDay) return "current"
    return "available"
  }

  function getPhaseForDay(dayNum: number) {
    return PHASES.find((p) => dayNum >= p.dayStart && dayNum <= p.dayEnd)
  }

  return (
    <div className="mx-auto w-full space-y-8">
      {/* Header banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-10"
        style={{ backgroundColor: program.badgeColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {currentPhase && (
              <div className="mb-2 flex items-center gap-3">
                <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-bold uppercase tracking-wider text-white">
                  {currentPhase.label}
                </span>
                <span className="text-lg text-white/70">
                  Day {currentDay}
                </span>
              </div>
            )}
            <h2 className="truncate text-4xl font-extrabold text-white sm:text-5xl">
              {recommendedDay?.title ?? `Day ${currentDay}`}
            </h2>
            {recommendedDay?.key_theme && (
              <p className="mt-2 truncate text-lg text-white/80">
                {recommendedDay.key_theme}
              </p>
            )}
          </div>
          <Link
            href={`/dashboard/${program.slug}/journey`}
            className="hidden shrink-0 items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold transition-all hover:shadow-lg sm:flex"
            style={{ color: program.badgeColor }}
          >
            Continue
            <ArrowRight className="size-6" />
          </Link>
        </div>
      </div>

      {/* Progress + Search row */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">
            All Frameworks
          </h2>
          <p className="text-lg text-muted-foreground">
            {completedCount} completed &middot; {remaining} remaining
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search frameworks..."
            className="rounded-xl pl-14 text-lg h-12"
          />
        </div>
      </div>

      {/* Phase filter pills */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActivePhaseId(null)}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-lg font-bold transition-all ${
            activePhaseId === null
              ? "text-white shadow-md"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          style={
            activePhaseId === null
              ? { backgroundColor: program.badgeColor }
              : undefined
          }
        >
          All ({curriculum.length})
        </button>
        {PHASES.map((phase) => {
          const PhaseIcon = phase.icon
          const phaseCount = curriculum.filter(
            (d) =>
              d.day_number >= phase.dayStart && d.day_number <= phase.dayEnd
          ).length
          const phaseDone = curriculum.filter((d) => {
            if (d.day_number < phase.dayStart || d.day_number > phase.dayEnd)
              return false
            const c = completionMap[d.day_number]
            return c && c.done > 0 && c.done >= c.total
          }).length
          const isActive = activePhaseId === phase.id
          return (
            <button
              key={phase.id}
              onClick={() =>
                setActivePhaseId(isActive ? null : phase.id)
              }
              className={`flex items-center gap-3 rounded-full px-6 py-3 text-lg font-bold transition-all ${
                isActive
                  ? "text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              style={
                isActive ? { backgroundColor: phase.color } : undefined
              }
            >
              <PhaseIcon className="size-6" />
              {phase.label}
              <span className="opacity-70">
                {phaseDone}/{phaseCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* Recommended next */}
      {recommendedDay && !activePhaseId && !search && (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
          <Sparkles
            className="size-7 shrink-0"
            style={{ color: program.badgeColor }}
          />
          <div className="min-w-0 flex-1">
            <span className="text-lg font-bold text-foreground">
              Recommended Next
            </span>
            <p className="truncate text-base text-muted-foreground">
              Day {recommendedDay.day_number}: {recommendedDay.title}
            </p>
          </div>
          <Link
            href={`/dashboard/${program.slug}/journey`}
            className="shrink-0 text-lg font-bold transition-colors hover:underline"
            style={{ color: program.badgeColor }}
          >
            Start <ArrowRight className="ml-1 inline size-4" />
          </Link>
        </div>
      )}

      {/* Phase-grouped framework cards */}
      {PHASES.filter(
        (p) => !activePhaseId || p.id === activePhaseId
      ).map((phase) => {
        const PhaseIcon = phase.icon
        const phaseDays = filtered.filter(
          (d) =>
            d.day_number >= phase.dayStart && d.day_number <= phase.dayEnd
        )
        if (phaseDays.length === 0) return null

        return (
          <div key={phase.id}>
            {/* Phase section header */}
            <div className="mb-5 flex items-center gap-4">
              <div
                className="flex size-12 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: phase.color }}
              >
                <PhaseIcon className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-foreground">
                  {phase.label}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {phase.tagline} &middot; Days {phase.dayStart}-{phase.dayEnd}
                </p>
              </div>
            </div>

            {/* Day cards for this phase */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {phaseDays.map((day) => {
                const status = getDayStatus(day.day_number)
                const isLocked = status === "locked"
                const isCurrent = status === "current"
                const isCompleted = status === "completed"

                return (
                  <Link
                    key={day.day_number}
                    href={
                      isLocked
                        ? "#"
                        : `/dashboard/${program.slug}/journey`
                    }
                    onClick={(e) => isLocked && e.preventDefault()}
                    className={`group flex items-start gap-4 rounded-xl border-2 bg-card p-6 transition-all ${
                      isCurrent
                        ? "shadow-md"
                        : isLocked
                        ? "cursor-not-allowed opacity-40"
                        : "hover:shadow-md"
                    }`}
                    style={{
                      borderColor: isCurrent
                        ? phase.color
                        : isCompleted
                        ? `${phase.color}25`
                        : "transparent",
                    }}
                  >
                    {/* Day number badge */}
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-lg text-lg font-extrabold ${
                        isCompleted
                          ? "text-white"
                          : isCurrent
                          ? "text-white"
                          : isLocked
                          ? "bg-muted text-muted-foreground"
                          : "text-white"
                      }`}
                      style={
                        !isLocked
                          ? { backgroundColor: phase.color }
                          : undefined
                      }
                    >
                      {isLocked ? (
                        <Lock className="size-6" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="size-6" />
                      ) : (
                        day.day_number
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-bold leading-tight text-foreground line-clamp-2">
                        {day.title}
                      </h4>
                      {day.key_theme && (
                        <p className="mt-2 text-base text-muted-foreground line-clamp-1">
                          {day.key_theme}
                        </p>
                      )}
                      {isCurrent && (
                        <span
                          className="mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold text-white"
                          style={{ backgroundColor: phase.color }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 size-12 text-muted-foreground/40" />
          <p className="text-xl font-bold text-muted-foreground">
            No frameworks found
          </p>
          <p className="mt-2 text-lg text-muted-foreground/70">
            Try adjusting your search or filter
          </p>
        </div>
      )}
    </div>
  )
}
