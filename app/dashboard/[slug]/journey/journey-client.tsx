"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Zap,
  Play,
  Lock,
  Sparkles,
  Rocket,
  TrendingUp,
  Crown,
  MessageSquare,
  FileText,
  AlertTriangle,
  Quote,
  Target,
  Pen,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"

/* ── Phase definitions ── */
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

/* ── Section type icon mapping ── */
const SECTION_ICONS: Record<string, typeof BookOpen> = {
  reality_briefing: AlertTriangle,
  reality_mapping: AlertTriangle,
  mindset_disruption: Lightbulb,
  workplace_scenario: MessageSquare,
  decision_exercise: Zap,
  decision_challenge: Zap,
  artifact_creation: FileText,
  reflection_upgrade: Pen,
  reflection: Pen,
  professional_upgrade: TrendingUp,
}

/* ── Types ── */
interface CurriculumExercise {
  id: string
  sort_order: number
  question: string
  question_type: string
  options: Record<string, unknown> | Record<string, unknown>[] | null
  thinking_prompts: string[] | null
}

interface CurriculumSection {
  id: string
  sort_order: number
  section_type: string
  title: string
  content: Record<string, unknown>[]
  curriculum_exercises: CurriculumExercise[]
}

interface CurriculumDay {
  id: string
  day_number: number
  title: string
  theme: string | null
  day_objective: string[] | null
  lesson_flow: string[] | null
  key_teaching_quote: string | null
  behaviors_instilled: { behaviors: string[] } | string[] | null
  end_of_day_outcomes: { outcomes: string[] } | string[] | null
  facilitator_close: { close: string[] } | { message: string; preview?: string } | null
  curriculum_sections: CurriculumSection[]
}

interface JourneyClientProps {
  program: {
    slug: string
    name: string
    badgeColor: string
    signalAcronym: string
    totalDays: number
  }
  enrollmentId: string
  currentDay: number
  curriculum: CurriculumDay[]
  userActions: {
    day_number: number
    action_index: number
    completed: boolean
  }[]
  userSectionProgress: {
    section_id: string
    completed: boolean
  }[]
  userResponses: {
    exercise_id: string | null
    section_id: string | null
    day_number: number
    response_text: string
  }[]
}

const programIcons: Record<string, string> = {
  "workforce-ready": "/images/workforce-icon.png",
}

/* ── Section content renderers ── */
function ContentBlock({
  item,
  phaseColor,
}: {
  item: Record<string, unknown>
  phaseColor: string
}) {
  switch (item.type) {
    case "facilitator_script":
      return (
        <p className="text-base leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "contrast": {
      const itemsA = item.items_a as string[]
      const itemsB = item.items_b as string[]
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {item.label_a as string}
            </p>
            <ul className="space-y-1">
              {itemsA.map((t, i) => (
                <li
                  key={i}
                  className="text-sm text-red-700 dark:text-red-300"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl border-2 p-4"
            style={{
              borderColor: `${phaseColor}30`,
              backgroundColor: `${phaseColor}08`,
            }}
          >
            <p
              className="mb-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: phaseColor }}
            >
              {item.label_b as string}
            </p>
            <ul className="space-y-1">
              {itemsB.map((t, i) => (
                <li key={i} className="text-sm" style={{ color: phaseColor }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
    case "callout":
      return (
        <div
          className="rounded-xl border-l-4 px-4 py-3"
          style={{
            borderColor: phaseColor,
            backgroundColor: `${phaseColor}08`,
          }}
        >
          <p className="text-sm font-bold" style={{ color: phaseColor }}>
            {item.text as string}
          </p>
        </div>
      )
    case "scenario_setup":
      return (
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground">
            {item.text as string}
          </p>
        </div>
      )
    case "manager_quote":
      return (
        <div className="flex gap-3 rounded-xl border bg-card p-4">
          <Quote className="mt-0.5 size-5 shrink-0 text-muted-foreground/50" />
          <p className="text-sm italic leading-relaxed text-foreground">
            {'"'}{item.text as string}{'"'}
          </p>
        </div>
      )
    case "narrative":
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "challenge":
      return (
        <div
          className="rounded-xl border-2 p-4"
          style={{
            borderColor: `${phaseColor}40`,
            backgroundColor: `${phaseColor}06`,
          }}
        >
          <p className="text-sm font-semibold text-foreground">
            {item.text as string}
          </p>
        </div>
      )
    case "instruction":
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "assignment": {
      const structure = item.structure as string[]
      return (
        <div className="rounded-xl border bg-card p-4">
          <h4 className="mb-3 text-base font-bold text-foreground">
            {item.title as string}
          </h4>
          <ol className="list-inside list-decimal space-y-1.5">
            {structure.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {s}
              </li>
            ))}
          </ol>
          {item.length && (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Target length: {item.length as string}
            </p>
          )}
        </div>
      )
    }
    case "skills_trained": {
      const items = item.items as string[]
      return (
        <div className="flex flex-wrap gap-2">
          {items.map((s, i) => (
            <span
              key={i}
              className="rounded-full px-3 py-1 text-xs font-bold capitalize"
              style={{
                backgroundColor: `${phaseColor}12`,
                color: phaseColor,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )
    }
    case "teaching_moment":
      return (
        <div
          className="rounded-xl border-l-4 px-4 py-3"
          style={{
            borderColor: phaseColor,
            backgroundColor: `${phaseColor}06`,
          }}
        >
          <p
            className="mb-1 text-xs font-bold uppercase tracking-wider"
            style={{ color: phaseColor }}
          >
            {item.title as string}
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {item.text as string}
          </p>
        </div>
      )
    case "text":
      return (
        <p className="text-base leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "mapping":
      return (
        <div
          className="rounded-xl border-l-4 px-4 py-3"
          style={{
            borderColor: phaseColor,
            backgroundColor: `${phaseColor}08`,
          }}
        >
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {item.text as string}
          </p>
        </div>
      )
    default:
      // Fallback: render text if present
      if (item.text) {
        return (
          <p className="text-base leading-relaxed text-muted-foreground">
            {item.text as string}
          </p>
        )
      }
      return null
  }
}

function ExerciseBlock({
  exercise,
  phaseColor,
  index,
  isCompleted,
  onToggle,
  saving,
  responseText,
  onResponseChange,
  savingResponse,
  readOnly,
}: {
  exercise: CurriculumExercise
  phaseColor: string
  index: number
  isCompleted: boolean
  onToggle: () => void
  saving: boolean
  responseText: string
  onResponseChange: (text: string) => void
  savingResponse: boolean
  readOnly: boolean
}) {
  const options = Array.isArray(exercise.options) ? exercise.options : null
  const needsTextResponse =
    exercise.question_type === "open_ended" ||
    exercise.question_type === "reflection" ||
    exercise.question_type === "multiple_choice"

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isCompleted ? "border-transparent" : ""
      }`}
      style={
        isCompleted
          ? {
              backgroundColor: `${phaseColor}06`,
              borderColor: `${phaseColor}25`,
            }
          : undefined
      }
    >
      <button
        onClick={readOnly ? undefined : onToggle}
        disabled={saving || readOnly}
        className={`group flex w-full items-start gap-4 text-left ${readOnly ? "cursor-default" : ""}`}
      >
        <div
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            isCompleted ? "border-transparent" : ""
          }`}
          style={
            isCompleted
              ? { backgroundColor: phaseColor }
              : { borderColor: `${phaseColor}40` }
          }
        >
          {isCompleted && <CheckCircle2 className="size-5 text-white" />}
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className={`text-base font-bold ${
              isCompleted
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {exercise.question}
          </h4>
          {exercise.question_type === "multiple_choice" && options && (
            <div className="mt-2 space-y-1.5">
              {options.map((opt, i) => {
                const o = opt as Record<string, unknown>
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: `${phaseColor}15`,
                        color: phaseColor,
                      }}
                    >
                      {o.label as string}
                    </span>
                    <span>{o.text as string}</span>
                  </div>
                )
              })}
            </div>
          )}
          {exercise.thinking_prompts && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {exercise.thinking_prompts.map((p, i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Response textarea */}
      {needsTextResponse && (
        <div className="mt-3 ml-11">
          {readOnly ? (
            responseText ? (
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm leading-relaxed text-foreground">
                {responseText}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground/60">
                No response recorded
              </p>
            )
          ) : (
            <>
              <textarea
                value={responseText}
                onChange={(e) => onResponseChange(e.target.value)}
                placeholder={
                  exercise.question_type === "multiple_choice"
                    ? "Explain your choice and reasoning..."
                    : "Type your response here..."
                }
                rows={4}
                className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ focusRingColor: phaseColor } as React.CSSProperties}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {responseText.length > 0
                    ? `${responseText.length} characters`
                    : "Your answer is saved to your portfolio"}
                </span>
                {savingResponse && (
                  <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: phaseColor }}>
                    <Save className="size-3" />
                    Saving...
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main Component ── */
export function JourneyClient({
  program,
  enrollmentId,
  currentDay,
  curriculum,
  userActions,
  userSectionProgress,
  userResponses,
}: JourneyClientProps) {
  const [selectedDay, setSelectedDayRaw] = useState(currentDay)
  const [activeDay, setActiveDay] = useState(currentDay)

  // Wrap setSelectedDay to dismiss the completion banner on navigation
  const setSelectedDay = useCallback((day: number) => {
    setSelectedDayRaw(day)
    setShowDayComplete(false)
  }, [])
  const [completedActions, setCompletedActions] = useState<Set<string>>(
    new Set(
      userActions
        .filter((a) => a.completed)
        .map((a) => `${a.day_number}-${a.action_index}`)
    )
  )
  const [saving, setSaving] = useState(false)
  const [showDayComplete, setShowDayComplete] = useState(false)

  // Response state: keyed by exercise_id or section_id
  const [responses, setResponses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const r of userResponses) {
      const key = r.exercise_id || r.section_id || ""
      if (key) map[key] = r.response_text
    }
    return map
  })
  const [savingResponseKey, setSavingResponseKey] = useState<string | null>(null)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const saveResponse = useCallback(
    async (key: string, text: string, isExercise: boolean, dayNumber: number) => {
      setSavingResponseKey(key)
      try {
        await fetch("/api/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId,
            exerciseId: isExercise ? key : undefined,
            sectionId: isExercise ? undefined : key,
            dayNumber,
            responseText: text,
          }),
        })
      } catch (err) {
        console.error("Failed to save response:", err)
      } finally {
        setSavingResponseKey(null)
      }
    },
    [enrollmentId]
  )

  const handleResponseChange = useCallback(
    (key: string, text: string, isExercise: boolean, dayNumber: number) => {
      setResponses((prev) => ({ ...prev, [key]: text }))

      // Debounce: save after 800ms idle
      if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key])
      debounceTimers.current[key] = setTimeout(() => {
        saveResponse(key, text, isExercise, dayNumber)
      }, 800)
    },
    [saveResponse]
  )

  // Cleanup debounce timers
  useEffect(() => {
    const timers = debounceTimers.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [])

  const todayContent = curriculum.find((d) => d.day_number === selectedDay)
  const activePhase =
    PHASES.find((p) => selectedDay >= p.dayStart && selectedDay <= p.dayEnd) ??
    PHASES[0]
  const iconSrc = programIcons[program.slug]

  // Whether the user is viewing a past (completed) day
  const isViewingPastDay = selectedDay < activeDay

  // Count all exercises across all sections for this day
  const allExercises =
    todayContent?.curriculum_sections?.flatMap(
      (s) => s.curriculum_exercises ?? []
    ) ?? []
  const todayActionsTotal = allExercises.length
  const todayActionsDone = allExercises.filter((_, i) =>
    completedActions.has(`${selectedDay}-${i}`)
  ).length
  const todayProgress =
    todayActionsTotal > 0
      ? Math.round((todayActionsDone / todayActionsTotal) * 100)
      : 0

  async function toggleAction(dayNum: number, actionIdx: number) {
    // Don't allow toggling for past (completed) days
    if (dayNum < activeDay) return

    const key = `${dayNum}-${actionIdx}`
    const isNowCompleted = !completedActions.has(key)
    const next = new Set(completedActions)
    if (isNowCompleted) next.add(key)
    else next.delete(key)
    setCompletedActions(next)

    // Count total exercises for this day
    const dayContent = curriculum.find((d) => d.day_number === dayNum)
    const dayExercises =
      dayContent?.curriculum_sections?.flatMap(
        (s) => s.curriculum_exercises ?? []
      ) ?? []
    const totalForDay = dayExercises.length

    setSaving(true)
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          dayNumber: dayNum,
          actionIndex: actionIdx,
          completed: isNowCompleted,
          totalActions: totalForDay,
        }),
      })
      const data = await res.json()
      console.log("[v0] toggleAction response:", JSON.stringify(data), "dayNum:", dayNum, "activeDay:", activeDay, "totalForDay:", totalForDay)

      // Day was advanced on the server -- update local state & auto-navigate
      if (data.dayAdvanced && dayNum === activeDay) {
        const nextDay = dayNum + 1
        setActiveDay(nextDay)
        setShowDayComplete(true)

        // Auto-progress to the next day after a brief celebration
        setTimeout(() => {
          setSelectedDay(nextDay)
          setShowDayComplete(false)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }, 2500)
      }
    } catch {
      if (isNowCompleted) next.delete(key)
      else next.add(key)
      setCompletedActions(new Set(next))
    } finally {
      setSaving(false)
    }
  }

  function isDayCompleted(day: number) {
    const content = curriculum.find((d) => d.day_number === day)
    const exercises =
      content?.curriculum_sections?.flatMap(
        (s) => s.curriculum_exercises ?? []
      ) ?? []
    if (exercises.length === 0) return false
    return exercises.every((_, i) => completedActions.has(`${day}-${i}`))
  }

  // Track global exercise index for action keys
  let globalExerciseIndex = 0

  // Compute phase stats
  const phaseStats = PHASES.map((phase) => {
    const days = Array.from(
      { length: phase.dayEnd - phase.dayStart + 1 },
      (_, i) => phase.dayStart + i
    )
    const completed = days.filter((d) => isDayCompleted(d)).length
    return { ...phase, days, completed, total: days.length }
  })

  const overallCompleted = phaseStats.reduce((a, p) => a + p.completed, 0)
  const overallTotal = phaseStats.reduce((a, p) => a + p.total, 0)
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Two-column: Main content + Side progress tile ── */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* ── LEFT: Main lesson content ── */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* Active Day Hero Card */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{ backgroundColor: activePhase.color }}
          >
            <div className="relative p-5 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  {iconSrc && (
                    <Image
                      src={iconSrc}
                      alt=""
                      width={40}
                      height={40}
                      className="shrink-0 drop-shadow-lg"
                    />
                  )}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                      {activePhase.label} &middot; Day {selectedDay}
                    </span>
                    <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                      {todayContent?.title ?? `Day ${selectedDay}`}
                    </h2>
                  </div>
                </div>
                {todayContent?.theme && (
                  <p className="mt-2 text-base text-white/80">
                    {todayContent.theme}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {isViewingPastDay ? (
                    <>
                      <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                        <CheckCircle2 className="size-4 text-white" />
                        <span className="text-sm font-bold text-white">
                          Completed &middot; Review only
                        </span>
                      </div>
                      <Button
                        size="lg"
                        className="rounded-xl bg-white px-5 font-bold shadow-lg hover:bg-white/90"
                        style={{ color: activePhase.color }}
                        onClick={() => setSelectedDay(activeDay)}
                      >
                        Continue to Day {activeDay}
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="rounded-xl bg-white px-5 font-bold shadow-lg hover:bg-white/90"
                        style={{ color: activePhase.color }}
                        onClick={() =>
                          document
                            .getElementById("session-content")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        <Play className="mr-2 size-4" />
                        Start Session
                      </Button>
                      <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2">
                        <span className="text-sm font-bold text-white">
                          {todayActionsDone}/{todayActionsTotal} actions
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Day nav arrows */}
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                selectedDay > 1 && setSelectedDay(selectedDay - 1)
              }
              disabled={selectedDay <= 1}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
              Day {selectedDay - 1 > 0 ? selectedDay - 1 : ""}
            </button>
            <button
              onClick={() =>
                selectedDay < activeDay && setSelectedDay(selectedDay + 1)
              }
              disabled={selectedDay >= activeDay}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              {selectedDay < activeDay ? `Day ${selectedDay + 1}` : ""}
              {selectedDay >= activeDay && selectedDay < program.totalDays && (
                <span className="flex items-center gap-1 opacity-50">
                  <Lock className="size-3" /> Day {selectedDay + 1}
                </span>
              )}
              <ArrowRight className="size-4" />
            </button>
          </div>

      {/* ── Day Objectives ── */}
      {todayContent?.day_objective && todayContent.day_objective.length > 0 && (
        <section className="overflow-hidden rounded-2xl border bg-card">
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{ backgroundColor: `${activePhase.color}08` }}
          >
            <div
              className="flex size-9 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: activePhase.color }}
            >
              <Target className="size-4" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                Day Objective
              </h3>
              <span className="text-xs text-muted-foreground">
                What you will learn today
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <ul className="space-y-2">
              {todayContent.day_objective.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: activePhase.color }}
                  />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Day Complete Banner ── */}
      {showDayComplete && (
        <div
          className="flex items-center justify-between rounded-2xl border-2 p-5"
          style={{
            borderColor: `${activePhase.color}40`,
            backgroundColor: `${activePhase.color}08`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: activePhase.color }}
            >
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                Day {selectedDay} Complete!
              </h3>
              <p className="text-sm text-muted-foreground">
                Great work. Your responses are saved to your portfolio.
              </p>
            </div>
          </div>
          {activeDay <= program.totalDays && (
            <Button
              size="lg"
              className="rounded-xl font-bold text-white"
              style={{ backgroundColor: activePhase.color }}
              onClick={() => {
                setSelectedDay(activeDay)
                setShowDayComplete(false)
              }}
            >
              Continue to Day {activeDay}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      )}

      {/* ── Session Content: Sections ── */}
      <div id="session-content" className="flex flex-col gap-5">
        {todayContent?.curriculum_sections?.map((section) => {
          const SectionIcon = SECTION_ICONS[section.section_type] ?? BookOpen
          const hasExercises = section.curriculum_exercises?.length > 0
          const sectionExerciseStartIndex = globalExerciseIndex

          return (
            <section
              key={section.id}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              {/* Section header */}
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ backgroundColor: `${activePhase.color}08` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: activePhase.color }}
                  >
                    <SectionIcon className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground">
                      {section.title}
                    </h3>
                    <span className="text-xs capitalize text-muted-foreground">
                      {section.section_type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                {hasExercises && (
                  <span
                    className="rounded-full px-3 py-1 text-sm font-bold text-white"
                    style={{ backgroundColor: activePhase.color }}
                  >
                    {section.curriculum_exercises.filter((_, i) =>
                      completedActions.has(
                        `${selectedDay}-${sectionExerciseStartIndex + i}`
                      )
                    ).length}
                    /{section.curriculum_exercises.length}
                  </span>
                )}
              </div>

              {/* Section content blocks */}
              {section.content && (Array.isArray(section.content) ? section.content : []).length > 0 && (
                <div className="space-y-3 px-5 py-4">
                  {(Array.isArray(section.content) ? section.content : []).map((item: Record<string, unknown>, i: number) => (
                    <ContentBlock
                      key={i}
                      item={item}
                      phaseColor={activePhase.color}
                    />
                  ))}
                </div>
              )}

              {/* Artifact creation textarea */}
              {section.section_type === "artifact_creation" && (
                <div className="border-t px-5 py-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="size-4" style={{ color: activePhase.color }} />
                    <label className="text-sm font-bold text-foreground">
                      Your Artifact
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {isViewingPastDay ? "(read only)" : "(saved to your portfolio)"}
                    </span>
                    {!isViewingPastDay && savingResponseKey === section.id && (
                      <span
                        className="ml-auto flex items-center gap-1 text-[10px] font-medium"
                        style={{ color: activePhase.color }}
                      >
                        <Save className="size-3" />
                        Saving...
                      </span>
                    )}
                  </div>
                  {isViewingPastDay ? (
                    (responses[section.id] ?? "") ? (
                      <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {responses[section.id]}
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted-foreground/60">
                        No artifact recorded
                      </p>
                    )
                  ) : (
                    <>
                      <textarea
                        value={responses[section.id] ?? ""}
                        onChange={(e) =>
                          handleResponseChange(section.id, e.target.value, false, selectedDay)
                        }
                        placeholder="Write your artifact here: decision memo, escalation email, executive summary, recommendation brief..."
                        rows={8}
                        className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-1"
                      />
                      {(responses[section.id] ?? "").length > 0 && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {(responses[section.id] ?? "").length} characters
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Exercises within section */}
              {hasExercises && (
                <div className="flex flex-col gap-2.5 border-t p-4">
                  {section.curriculum_exercises.map((exercise, i) => {
                    const actionIndex = sectionExerciseStartIndex + i
                    const key = `${selectedDay}-${actionIndex}`
                    const done = completedActions.has(key)
                    // Increment global index for next section
                    if (i === section.curriculum_exercises.length - 1) {
                      globalExerciseIndex =
                        sectionExerciseStartIndex +
                        section.curriculum_exercises.length
                    }
                    return (
                      <ExerciseBlock
                        key={exercise.id}
                        exercise={exercise}
                        phaseColor={activePhase.color}
                        index={actionIndex}
                        isCompleted={done}
                        onToggle={() => toggleAction(selectedDay, actionIndex)}
                        saving={saving}
                        responseText={responses[exercise.id] ?? ""}
                        onResponseChange={(text) =>
                          handleResponseChange(exercise.id, text, true, selectedDay)
                        }
                        savingResponse={savingResponseKey === exercise.id}
                        readOnly={isViewingPastDay}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}

        {/* ── Key Teaching Quote ── */}
        {todayContent?.key_teaching_quote && (
          <div
            className="flex items-start gap-4 rounded-2xl border-2 p-5"
            style={{
              borderColor: `${activePhase.color}30`,
              backgroundColor: `${activePhase.color}06`,
            }}
          >
            <Quote
              className="mt-1 size-6 shrink-0"
              style={{ color: activePhase.color }}
            />
            <p className="text-lg font-bold italic text-foreground">
              {todayContent.key_teaching_quote}
            </p>
          </div>
        )}

        {/* ── Behaviors Instilled ── */}
        {(() => {
          const raw = todayContent?.behaviors_instilled
          const items = Array.isArray(raw) ? raw : (raw as { behaviors?: string[] })?.behaviors ?? []
          return items.length > 0 ? (
            <section className="overflow-hidden rounded-2xl border bg-card">
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ backgroundColor: `${activePhase.color}08` }}
              >
                <div
                  className="flex size-9 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: activePhase.color }}
                >
                  <Sparkles className="size-4" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground">
                  Behaviors Instilled
                </h3>
              </div>
              <div className="px-5 py-4">
                <ul className="space-y-2">
                  {items.map((b: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <div
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: activePhase.color }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null
        })()}

        {/* ── End of Day Outcomes ── */}
        {(() => {
          const raw = todayContent?.end_of_day_outcomes
          const items = Array.isArray(raw) ? raw : (raw as { outcomes?: string[] })?.outcomes ?? []
          return items.length > 0 ? (
            <section className="overflow-hidden rounded-2xl border bg-card">
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ backgroundColor: `${activePhase.color}08` }}
              >
                <div
                  className="flex size-9 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: activePhase.color }}
                >
                  <CheckCircle2 className="size-4" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground">
                  End-of-Day Outcomes
                </h3>
              </div>
              <div className="px-5 py-4">
                <ul className="space-y-2">
                  {items.map((o: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0"
                        style={{ color: activePhase.color }}
                      />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null
        })()}

        {/* ── Facilitator Close ── */}
        {(() => {
          const raw = todayContent?.facilitator_close
          if (!raw) return null
          // Support both {close: [...]} and {message, preview} formats
          const closeItems = (raw as { close?: string[] })?.close
          const message = (raw as { message?: string })?.message
          if (closeItems && closeItems.length > 0) {
            return (
              <div
                className="overflow-hidden rounded-2xl p-5"
                style={{ backgroundColor: activePhase.color }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-2xl" />
                  <div className="relative z-10 space-y-3">
                    {closeItems.map((line: string, i: number) => (
                      <p key={i} className="text-base font-semibold leading-relaxed text-white">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )
          }
          if (message) {
            return (
              <div
                className="overflow-hidden rounded-2xl p-5"
                style={{ backgroundColor: activePhase.color }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-2xl" />
                  <div className="relative z-10">
                    <p className="text-base font-semibold leading-relaxed text-white">
                      {message}
                    </p>
                    {(raw as { preview?: string })?.preview && (
                      <p className="mt-3 text-sm font-medium text-white/70">
                        {(raw as { preview?: string }).preview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* All actions completed */}
        {todayProgress === 100 && todayActionsTotal > 0 && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{ backgroundColor: `${activePhase.color}10` }}
          >
            <Sparkles
              className="size-5"
              style={{ color: activePhase.color }}
            />
            <p
              className="text-sm font-bold"
              style={{ color: activePhase.color }}
            >
              All actions completed for Day {selectedDay}! Great work.
            </p>
          </div>
        )}

        {!todayContent && (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
            <BookOpen className="mb-3 size-10 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">
              Content Coming Soon
            </h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Day {selectedDay} content is being prepared.
            </p>
          </div>
        )}
      </div>
        </div>{/* end left column */}

        {/* ── RIGHT: Progress side tile ── */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-72 lg:self-start">
          <div className="rounded-2xl border bg-card">
            {/* Overall progress header */}
            <div className="flex items-center gap-3 border-b p-4">
              <div className="relative flex size-12 items-center justify-center">
                <svg className="size-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
                    stroke={activePhase.color}
                    strokeDasharray={`${overallPct * 1.257} 125.7`}
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-foreground">{overallPct}%</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Overall Progress</p>
                <p className="text-xs text-muted-foreground">{overallCompleted}/{overallTotal} days</p>
              </div>
            </div>

            {/* Phase rows */}
            <div className="divide-y">
              {phaseStats.map((phase) => {
                const PhaseIcon = phase.icon
                const isCurrentPhase = activeDay >= phase.dayStart && activeDay <= phase.dayEnd
                return (
                  <div key={phase.id} className="p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="flex size-7 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: phase.color }}
                      >
                        <PhaseIcon className="size-3.5" />
                      </div>
                      <span className="flex-1 text-xs font-bold text-foreground">
                        {phase.label}
                      </span>
                      {isCurrentPhase && (
                        <span className="size-2 rounded-full" style={{ backgroundColor: phase.color }} />
                      )}
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {phase.completed}/{phase.total}
                      </span>
                    </div>
                    {/* Day dots */}
                    <div className="flex gap-1">
                      {phase.days.map((day) => {
                        const isSelected = day === selectedDay
                          const isLocked = day > activeDay
                        const completed = isDayCompleted(day)
                        return (
                          <button
                            key={day}
                            onClick={() => !isLocked && setSelectedDay(day)}
                            disabled={isLocked}
                            title={`Day ${day}`}
                            className={`flex size-7 items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                              isSelected
                                ? "text-white shadow-sm"
                                : completed
                                ? "bg-card text-foreground"
                                : isLocked
                                ? "bg-muted/50 text-muted-foreground/30"
                                : "bg-muted/70 text-foreground hover:bg-muted"
                            }`}
                            style={
                              isSelected
                                ? { backgroundColor: phase.color }
                                : completed
                                ? {
                                    backgroundColor: `${phase.color}15`,
                                    color: phase.color,
                                  }
                                : undefined
                            }
                          >
                            {completed && !isSelected ? (
                              <CheckCircle2 className="size-3.5" style={{ color: phase.color }} />
                            ) : isLocked ? (
                              <Lock className="size-2.5" />
                            ) : (
                              day
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Today's session stats */}
            {todayActionsTotal > 0 && (
              <div className="border-t p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Day {selectedDay} actions
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${todayProgress}%`,
                        backgroundColor: activePhase.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold" style={{ color: activePhase.color }}>
                    {todayActionsDone}/{todayActionsTotal}
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>{/* end flex row */}
    </div>
  )
}
