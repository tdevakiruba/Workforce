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
  Play,
  Clock,
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
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    id: "growth",
    label: "Growth Strategy",
    dayStart: 8,
    dayEnd: 14,
    color: "#0077b6",
    icon: TrendingUp,
    tagline: "Develop core leadership skills",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: "mastery",
    label: "Leadership Mastery",
    dayStart: 15,
    dayEnd: 21,
    color: "#1b2a4a",
    icon: Crown,
    tagline: "Lead with influence and trust",
    gradient: "from-slate-500/20 to-slate-500/5",
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

  // Calculate overall progress
  const overallProgress = curriculum.length > 0 
    ? Math.round((completedCount / curriculum.length) * 100) 
    : 0

  return (
    <div className="mx-auto w-full space-y-10">
      {/* Hero Header with Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 lg:p-14">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-center gap-3">
                <span 
                  className="rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: program.badgeColor }}
                >
                  {currentPhase?.label ?? "In Progress"}
                </span>
                <span className="text-lg text-white/60">
                  Day {currentDay} of {program.totalDays}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your Learning Path
              </h1>
              <p className="mt-4 max-w-2xl text-xl text-white/70">
                Master AI-driven professional skills through {curriculum.length} focused frameworks across {PHASES.length} phases.
              </p>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center gap-6 rounded-2xl bg-white/10 backdrop-blur-sm p-6">
              <div className="relative flex size-24 items-center justify-center">
                <svg className="size-24 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/20" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
                    stroke={program.badgeColor}
                    strokeDasharray={`${overallProgress * 1.257} 125.7`}
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-white">{overallProgress}%</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">{completedCount}/{curriculum.length}</p>
                <p className="text-lg text-white/60">Frameworks Complete</p>
              </div>
            </div>
          </div>

          {/* Phase Progress Bars */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PHASES.map((phase) => {
              const PhaseIcon = phase.icon
              const phaseCount = curriculum.filter(
                (d) => d.day_number >= phase.dayStart && d.day_number <= phase.dayEnd
              ).length
              const phaseDone = curriculum.filter((d) => {
                if (d.day_number < phase.dayStart || d.day_number > phase.dayEnd) return false
                const c = completionMap[d.day_number]
                return c && c.done > 0 && c.done >= c.total
              }).length
              const phaseProgress = phaseCount > 0 ? (phaseDone / phaseCount) * 100 : 0
              
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhaseId(activePhaseId === phase.id ? null : phase.id)}
                  className={`group rounded-xl p-4 text-left transition-all ${
                    activePhaseId === phase.id 
                      ? "bg-white/20 ring-2 ring-white/40" 
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex size-10 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: phase.color }}
                    >
                      <PhaseIcon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-white">{phase.label}</p>
                      <p className="text-sm text-white/50">{phaseDone}/{phaseCount} complete</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${phaseProgress}%`, backgroundColor: phase.color }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">
            {activePhaseId ? PHASES.find(p => p.id === activePhaseId)?.label : "All Frameworks"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {filtered.length} framework{filtered.length !== 1 ? "s" : ""} {search ? "found" : "available"}
          </p>
        </div>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search frameworks by title or theme..."
            className="rounded-xl border-2 pl-12 text-lg h-14 focus:border-primary"
          />
        </div>
      </div>

      {/* Recommended Next Card */}
      {recommendedDay && !activePhaseId && !search && (
        <Link 
          href={`/dashboard/${program.slug}/journey`}
          className="group flex items-center gap-6 rounded-2xl border-2 bg-gradient-to-r from-card to-card/50 p-8 transition-all hover:shadow-lg hover:border-primary/30"
          style={{ borderColor: `${program.badgeColor}30` }}
        >
          <div 
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: program.badgeColor }}
          >
            <Play className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5" style={{ color: program.badgeColor }} />
              <span className="text-base font-bold uppercase tracking-wider" style={{ color: program.badgeColor }}>
                Continue Learning
              </span>
            </div>
            <h3 className="mt-1 text-2xl font-extrabold text-foreground">
              Day {recommendedDay.day_number}: {recommendedDay.title}
            </h3>
            {recommendedDay.key_theme && (
              <p className="mt-1 text-lg text-muted-foreground">{recommendedDay.key_theme}</p>
            )}
          </div>
          <ArrowRight className="size-8 text-muted-foreground transition-transform group-hover:translate-x-2" style={{ color: program.badgeColor }} />
        </Link>
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

        const phaseDone = phaseDays.filter((d) => {
          const c = completionMap[d.day_number]
          return c && c.done > 0 && c.done >= c.total
        }).length

        return (
          <div key={phase.id} className="space-y-6">
            {/* Phase section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-14 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{ backgroundColor: phase.color }}
                >
                  <PhaseIcon className="size-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground">
                    {phase.label}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {phase.tagline}
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Days {phase.dayStart}-{phase.dayEnd}
                  </span>
                </div>
                <div 
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-white"
                  style={{ backgroundColor: phase.color }}
                >
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm font-bold">{phaseDone}/{phaseDays.length}</span>
                </div>
              </div>
            </div>

            {/* Day cards grid - larger, more visual cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {phaseDays.map((day) => {
                const status = getDayStatus(day.day_number)
                const isLocked = status === "locked"
                const isCurrent = status === "current"
                const isCompleted = status === "completed"
                const completion = completionMap[day.day_number]
                const progress = completion ? Math.round((completion.done / completion.total) * 100) : 0

                return (
                  <Link
                    key={day.day_number}
                    href={isLocked ? "#" : `/dashboard/${program.slug}/journey`}
                    onClick={(e) => isLocked && e.preventDefault()}
                    className={`group relative overflow-hidden rounded-2xl border-2 bg-card transition-all duration-300 ${
                      isCurrent
                        ? "shadow-lg ring-2 ring-offset-2"
                        : isLocked
                        ? "cursor-not-allowed opacity-50"
                        : "hover:shadow-xl hover:-translate-y-1"
                    }`}
                    style={{
                      borderColor: isCurrent || isCompleted ? phase.color : "transparent",
                      ringColor: isCurrent ? phase.color : undefined,
                    }}
                  >
                    {/* Gradient header */}
                    <div 
                      className={`relative h-24 bg-gradient-to-br ${phase.gradient} p-5`}
                      style={{ 
                        background: isCompleted 
                          ? `linear-gradient(135deg, ${phase.color}15, ${phase.color}05)` 
                          : undefined 
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex size-14 items-center justify-center rounded-xl text-xl font-extrabold shadow-md transition-transform group-hover:scale-105 ${
                            isLocked ? "bg-muted text-muted-foreground" : "text-white"
                          }`}
                          style={!isLocked ? { backgroundColor: phase.color } : undefined}
                        >
                          {isLocked ? (
                            <Lock className="size-6" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="size-7" />
                          ) : (
                            day.day_number
                          )}
                        </div>
                        {isCurrent && (
                          <span 
                            className="animate-pulse rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: phase.color }}
                          >
                            Current
                          </span>
                        )}
                        {isCompleted && (
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ color: phase.color }}>
                            Complete
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-5">
                      <h4 className="text-xl font-bold leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {day.title}
                      </h4>
                      {day.key_theme && (
                        <p className="mt-2 text-base text-muted-foreground line-clamp-2">
                          {day.key_theme}
                        </p>
                      )}
                      
                      {/* Progress bar for incomplete days */}
                      {!isLocked && !isCompleted && completion && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-bold" style={{ color: phase.color }}>{progress}%</span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%`, backgroundColor: phase.color }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action hint */}
                      {!isLocked && (
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: phase.color }}>
                          {isCompleted ? "Review" : isCurrent ? "Continue" : "Start"}
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </div>
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
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <Search className="size-10 text-muted-foreground/50" />
          </div>
          <h3 className="mt-6 text-2xl font-extrabold text-foreground">
            No frameworks found
          </h3>
          <p className="mt-2 max-w-md text-lg text-muted-foreground">
            We couldn&apos;t find any frameworks matching your search. Try different keywords or clear your filters.
          </p>
          <button
            onClick={() => {
              setSearch("")
              setActivePhaseId(null)
            }}
            className="mt-6 rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
