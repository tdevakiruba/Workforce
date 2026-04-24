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

/* ── Section type visual treatments ── */
type SectionStyle = {
  wrapper: string
  headerBg: string
  iconStyle: "filled" | "outlined" | "gradient"
  contentBg: string
  accent: "left-border" | "top-border" | "glow" | "none"
}

const SECTION_STYLES: Record<string, SectionStyle> = {
  reality_briefing: {
    wrapper: "border-2 shadow-lg",
    headerBg: "bg-gradient-to-r from-emerald-500/10 to-teal-500/5",
    iconStyle: "gradient",
    contentBg: "bg-emerald-50/40 dark:bg-emerald-950/10",
    accent: "left-border",
  },
  reality_mapping: {
    wrapper: "border-2 shadow-lg",
    headerBg: "bg-gradient-to-r from-emerald-500/10 to-teal-500/5",
    iconStyle: "gradient",
    contentBg: "bg-emerald-50/40 dark:bg-emerald-950/10",
    accent: "left-border",
  },
  workplace_scenario: {
    wrapper: "border shadow-md",
    headerBg: "bg-gradient-to-r from-teal-500/10 to-emerald-400/5",
    iconStyle: "filled",
    contentBg: "bg-teal-50/30 dark:bg-teal-900/10",
    accent: "top-border",
  },
  professional_upgrade: {
    wrapper: "border-2 shadow-xl ring-1 ring-emerald-500/10",
    headerBg: "bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-400/5",
    iconStyle: "gradient",
    contentBg: "bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/10",
    accent: "glow",
  },
  decision_exercise: {
    wrapper: "border-2 shadow-lg",
    headerBg: "bg-gradient-to-r from-teal-600/10 to-emerald-500/8",
    iconStyle: "filled",
    contentBg: "bg-teal-50/40 dark:bg-teal-950/10",
    accent: "left-border",
  },
  decision_challenge: {
    wrapper: "border-2 shadow-lg",
    headerBg: "bg-gradient-to-r from-teal-600/10 to-emerald-500/8",
    iconStyle: "filled",
    contentBg: "bg-teal-50/40 dark:bg-teal-950/10",
    accent: "left-border",
  },
  artifact_creation: {
    wrapper: "border shadow-md",
    headerBg: "bg-gradient-to-r from-emerald-400/8 to-teal-400/5",
    iconStyle: "outlined",
    contentBg: "bg-emerald-50/20 dark:bg-emerald-950/5",
    accent: "none",
  },
  reflection_upgrade: {
    wrapper: "border shadow-sm",
    headerBg: "bg-emerald-50/50 dark:bg-emerald-950/10",
    iconStyle: "outlined",
    contentBg: "bg-emerald-50/20 dark:bg-emerald-950/5",
    accent: "none",
  },
  reflection: {
    wrapper: "border shadow-sm",
    headerBg: "bg-emerald-50/50 dark:bg-emerald-950/10",
    iconStyle: "outlined",
    contentBg: "bg-emerald-50/20 dark:bg-emerald-950/5",
    accent: "none",
  },
  mindset_disruption: {
    wrapper: "border-2 shadow-lg",
    headerBg: "bg-gradient-to-r from-green-500/12 to-emerald-500/8",
    iconStyle: "gradient",
    contentBg: "bg-green-50/30 dark:bg-green-950/10",
    accent: "left-border",
  },
}

const DEFAULT_SECTION_STYLE: SectionStyle = {
  wrapper: "border shadow-sm",
  headerBg: "bg-muted/30",
  iconStyle: "filled",
  contentBg: "bg-card",
  accent: "none",
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
  initialDay?: number
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
  "workforce-ready": "/images/workforce-logo-white.png",
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
        <p className="text-lg leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "contrast": {
      const itemsA = item.items_a as string[]
      const itemsB = item.items_b as string[]
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-5 dark:border-red-900 dark:bg-red-950/20">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {item.label_a as string}
            </p>
            <ul className="space-y-2">
              {itemsA.map((t, i) => (
                <li
                  key={i}
                  className="text-base text-red-700 dark:text-red-300"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl border-2 p-5"
            style={{
              borderColor: `${phaseColor}30`,
              backgroundColor: `${phaseColor}08`,
            }}
          >
            <p
              className="mb-3 text-sm font-bold uppercase tracking-wider"
              style={{ color: phaseColor }}
            >
              {item.label_b as string}
            </p>
            <ul className="space-y-2">
              {itemsB.map((t, i) => (
                <li key={i} className="text-base" style={{ color: phaseColor }}>
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
          className="relative overflow-hidden rounded-2xl border-l-4 px-6 py-5 shadow-sm"
          style={{
            borderColor: phaseColor,
            backgroundColor: `${phaseColor}08`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full opacity-20 blur-2xl"
            style={{ backgroundColor: phaseColor }}
          />
          <p className="relative text-lg font-bold leading-relaxed" style={{ color: phaseColor }}>
            {item.text as string}
          </p>
        </div>
      )
    case "scenario_setup":
      return (
        <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 shadow-sm dark:from-slate-900 dark:to-slate-800/50">
          <p className="text-lg font-medium leading-relaxed text-foreground">
            {item.text as string}
          </p>
        </div>
      )
    case "manager_quote":
      return (
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
          <div className="pointer-events-none absolute -left-2 -top-2 text-6xl font-serif leading-none text-slate-200 dark:text-slate-700">
            &ldquo;
          </div>
          <div className="relative flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
              <Quote className="size-5 text-slate-500" />
            </div>
            <p className="text-lg italic leading-relaxed text-foreground">
              {item.text as string}
            </p>
          </div>
        </div>
      )
    case "narrative":
      return (
        <p className="text-lg leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "challenge":
      return (
        <div
          className="relative overflow-hidden rounded-2xl border-2 p-6 shadow-md"
          style={{
            borderColor: `${phaseColor}50`,
            background: `linear-gradient(135deg, ${phaseColor}08, ${phaseColor}04)`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: phaseColor }}
          />
          <div className="relative flex items-start gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: phaseColor }}
            >
              <Zap className="size-5" />
            </div>
            <p className="text-lg font-semibold leading-relaxed text-foreground">
              {item.text as string}
            </p>
          </div>
        </div>
      )
    case "instruction":
      return (
        <p className="text-lg leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "assignment": {
      const structure = item.structure as string[]
      return (
        <div className="rounded-xl border bg-card p-5">
          <h4 className="mb-4 text-lg font-bold text-foreground">
            {item.title as string}
          </h4>
          <ol className="list-inside list-decimal space-y-2">
            {structure.map((s, i) => (
              <li key={i} className="text-base text-muted-foreground">
                {s}
              </li>
            ))}
          </ol>
          {item.length && (
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Target length: {item.length as string}
            </p>
          )}
        </div>
      )
    }
    case "skills_trained": {
      const items = item.items as string[]
      return (
        <div className="flex flex-wrap gap-3">
          {items.map((s, i) => (
            <span
              key={i}
              className="rounded-full px-4 py-2 text-sm font-bold capitalize"
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
          className="relative overflow-hidden rounded-2xl border-l-4 p-6 shadow-sm"
          style={{
            borderColor: phaseColor,
            backgroundColor: `${phaseColor}06`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-15 blur-2xl"
            style={{ backgroundColor: phaseColor }}
          />
          <div className="relative">
            <div
              className="mb-3 inline-block rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${phaseColor}15`,
                color: phaseColor,
              }}
            >
              {item.title as string}
            </div>
            <p className="text-lg leading-relaxed text-foreground">
              {item.text as string}
            </p>
          </div>
        </div>
      )
    case "text":
      return (
        <p className="text-lg leading-relaxed text-muted-foreground">
          {item.text as string}
        </p>
      )
    case "mapping":
      return (
        <div
          className="rounded-xl border-l-4 px-5 py-4"
          style={{
            borderColor: phaseColor,
            backgroundColor: `${phaseColor}08`,
          }}
        >
          <p className="text-base font-medium leading-relaxed text-foreground">
            {item.text as string}
          </p>
        </div>
      )
    default:
      // Fallback: render text if present
      if (item.text) {
        return (
          <p className="text-lg leading-relaxed text-muted-foreground">
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
      className={`rounded-xl border-2 p-7 transition-all ${
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
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            isCompleted ? "border-transparent" : ""
          }`}
          style={
            isCompleted
              ? { backgroundColor: phaseColor }
              : { borderColor: `${phaseColor}40` }
          }
        >
          {isCompleted && <CheckCircle2 className="size-6 text-white" />}
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className={`text-xl font-bold ${
              isCompleted
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {exercise.question}
          </h4>
          {exercise.question_type === "multiple_choice" && options && (
            <div className="mt-3 space-y-2">
              {options.map((opt, i) => {
                const o = opt as Record<string, unknown>
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-lg text-muted-foreground"
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
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
            <div className="mt-3 flex flex-wrap gap-2">
              {exercise.thinking_prompts.map((p, i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground"
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
        <div className="mt-4 ml-12">
          {readOnly ? (
            responseText ? (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-base leading-relaxed text-foreground">
                {responseText}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground/60">
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
                className="w-full resize-y rounded-lg border bg-background px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ focusRingColor: phaseColor } as React.CSSProperties}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
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
  initialDay,
  curriculum,
  userActions,
  userSectionProgress,
  userResponses,
}: JourneyClientProps) {
  const [selectedDay, setSelectedDayRaw] = useState(initialDay ?? currentDay)
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
    <div className="mx-auto w-full">
      {/* ── Sticky Action Status Bar ── */}
      {!isViewingPastDay && todayActionsTotal > 0 && (
        <div 
          className="sticky top-0 z-30 -mx-4 mb-6 px-4 py-3 backdrop-blur-md border-b"
          style={{ 
            backgroundColor: `${activePhase.color}f0`,
            borderColor: `${activePhase.color}`,
          }}
        >
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div 
                className="flex size-8 items-center justify-center rounded-full bg-white/20"
              >
                {todayProgress === 100 ? (
                  <CheckCircle2 className="size-5 text-white" />
                ) : (
                  <Zap className="size-5 text-white" />
                )}
              </div>
              <span className="text-sm font-bold text-white">
                Day {selectedDay} Progress
              </span>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white whitespace-nowrap">
                {todayActionsDone}/{todayActionsTotal}
              </span>
            </div>
            {todayProgress === 100 && selectedDay < program.totalDays && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDay(selectedDay + 1)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="rounded-lg bg-white text-sm font-bold shadow-md hover:bg-white/90 h-8 px-3"
                style={{ color: activePhase.color }}
              >
                Next Day
                <ArrowRight className="ml-1 size-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Two-column: Main content + Side progress tile ── */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LEFT: Main lesson content ── */}
        <div className="min-w-0 flex-1 space-y-10 w-full lg:w-auto">
          {/* Active Day Hero Card */}
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{ backgroundColor: activePhase.color }}
          >
            {/* Day Badge - square bold design positioned on the right */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center justify-center rounded-2xl bg-[#1a4a4a] w-28 h-28 shadow-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                Day
              </span>
              <span className="text-5xl font-black text-white leading-none mt-1">
                {selectedDay}
              </span>
            </div>
            <div className="relative p-12 sm:p-16 md:pr-40">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-2xl font-bold uppercase tracking-widest text-white/70">
                      {activePhase.label} &middot; Day {selectedDay}
                    </span>
                    <h2 className="text-5xl font-extrabold text-white sm:text-6xl">
                      {todayContent?.title ?? `Day ${selectedDay}`}
                    </h2>
                  </div>
                </div>
                {todayContent?.theme && (
                  <p className="mt-6 text-2xl text-white/80">
                    {todayContent.theme}
                  </p>
                )}
                {/* Action Progress Bar */}
                {!isViewingPastDay && todayActionsTotal > 0 && (
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-3 rounded-full bg-white/20 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                        style={{ width: `${todayProgress}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-white whitespace-nowrap">
                      {todayActionsDone}/{todayActionsTotal} Actions
                    </span>
                  </div>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {isViewingPastDay ? (
                    <>
                      <div className="flex items-center gap-4 rounded-full bg-white/20 px-8 py-4">
                        <CheckCircle2 className="size-7 text-white" />
                        <span className="text-xl font-bold text-white">
                          Completed &middot; Review only
                        </span>
                      </div>
                      <Button
                        size="lg"
                        className="rounded-xl bg-white px-10 py-8 text-xl font-bold shadow-lg hover:bg-white/90 h-auto"
                        style={{ color: activePhase.color }}
                        onClick={() => setSelectedDay(activeDay)}
                      >
                        Continue to Day {activeDay}
                        <ArrowRight className="ml-3 size-7" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="rounded-xl bg-white px-10 py-8 text-xl font-bold shadow-lg hover:bg-white/90 h-auto"
                        style={{ color: activePhase.color }}
                        onClick={() =>
                          document
                            .getElementById("session-content")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        <Play className="mr-4 size-7" />
                        Start Session
                      </Button>
                      <div className="flex items-center gap-4 rounded-full bg-white/15 px-8 py-4">
                        <span className="text-xl font-bold text-white">
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
              className="flex items-center gap-4 rounded-lg px-8 py-4 text-xl font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowLeft className="size-7" />
              Day {selectedDay - 1 > 0 ? selectedDay - 1 : ""}
            </button>
            <button
              onClick={() =>
                selectedDay < activeDay && setSelectedDay(selectedDay + 1)
              }
              disabled={selectedDay >= activeDay}
              className="flex items-center gap-4 rounded-lg px-8 py-4 text-xl font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              {selectedDay < activeDay ? `Day ${selectedDay + 1}` : ""}
              {selectedDay >= activeDay && selectedDay < program.totalDays && (
                <span className="flex items-center gap-2.5 opacity-50">
                  <Lock className="size-6" /> Day {selectedDay + 1}
                </span>
              )}
              <ArrowRight className="size-7" />
            </button>
          </div>

      {/* ── Day Objectives ── */}
      {todayContent?.day_objective && todayContent.day_objective.length > 0 && (
        <section className="overflow-hidden rounded-3xl border bg-card">
          <div
            className="flex items-center gap-5 px-10 py-8"
            style={{ backgroundColor: `${activePhase.color}08` }}
          >
            <div
              className="flex size-16 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: activePhase.color }}
            >
              <Target className="size-7" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-foreground">
                Day Objective
              </h3>
              <span className="text-xl text-muted-foreground">
                What you will learn today
              </span>
            </div>
          </div>
          <div className="px-10 py-8">
            <ul className="space-y-4">
              {todayContent.day_objective.map((obj, i) => (
                <li key={i} className="flex items-start gap-5 text-xl text-muted-foreground">
                  <CheckCircle2
                    className="mt-1 size-7 shrink-0"
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
          className="flex items-center justify-between rounded-2xl border-2 p-7"
          style={{
            borderColor: `${activePhase.color}40`,
            backgroundColor: `${activePhase.color}08`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex size-14 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: activePhase.color }}
            >
              <CheckCircle2 className="size-7" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-foreground">
                Day {selectedDay} Complete!
              </h3>
              <p className="text-lg text-muted-foreground">
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
              <ArrowRight className="ml-3 size-5" />
            </Button>
          )}
        </div>
      )}

      {/* ── Session Content: Sections ── */}
      <div id="session-content" className="flex flex-col gap-8">
        {/* ── Key Teaching Quote ── */}
        {todayContent?.key_teaching_quote && (
          <div
            className="relative overflow-hidden rounded-3xl p-1"
            style={{
              background: `linear-gradient(135deg, ${activePhase.color}, ${activePhase.color}60)`,
            }}
          >
            <div className="relative rounded-[1.25rem] bg-card px-10 py-8">
              {/* Decorative quote marks */}
              <div
                className="pointer-events-none absolute -left-2 -top-4 text-[120px] font-serif leading-none opacity-[0.07]"
                style={{ color: activePhase.color }}
              >
                &ldquo;
              </div>
              <div className="relative flex items-center gap-6">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: activePhase.color }}
                >
                  <Quote className="size-6" />
                </div>
                <p className="text-2xl font-bold italic leading-relaxed text-foreground">
                  {todayContent.key_teaching_quote}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Behaviors Instilled ── */}
        {(() => {
          const raw = todayContent?.behaviors_instilled
          const items = Array.isArray(raw) ? raw : (raw as { behaviors?: string[] })?.behaviors ?? []
          return items.length > 0 ? (
            <section
              className="relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-card via-card to-muted/20 shadow-lg"
              style={{ borderColor: `${activePhase.color}20` }}
            >
              {/* Decorative gradient */}
              <div
                className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full opacity-10 blur-3xl"
                style={{ backgroundColor: activePhase.color }}
              />
              <div
                className="flex items-center gap-5 px-8 py-6"
                style={{ backgroundColor: `${activePhase.color}06` }}
              >
                <div
                  className="flex size-14 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${activePhase.color}, ${activePhase.color}cc)`,
                  }}
                >
                  <Sparkles className="size-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Behaviors Instilled
                </h3>
              </div>
              <div className="px-8 py-7">
                <ul className="space-y-5">
                  {items.map((b: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-5 rounded-xl bg-white/50 p-4 text-lg text-foreground shadow-sm transition-all hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <div
                        className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                        style={{ backgroundColor: activePhase.color }}
                      >
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null
        })()}

        {todayContent?.curriculum_sections?.map((section, sectionIndex) => {
          const SectionIcon = SECTION_ICONS[section.section_type] ?? BookOpen
          const hasExercises = section.curriculum_exercises?.length > 0
          const sectionExerciseStartIndex = globalExerciseIndex
          const sectionStyle = SECTION_STYLES[section.section_type] ?? DEFAULT_SECTION_STYLE

          return (
            <section
              key={section.id}
              className={`group relative overflow-hidden rounded-3xl bg-card transition-all duration-300 hover:shadow-xl ${sectionStyle.wrapper}`}
              style={{
                borderColor: sectionStyle.accent === "glow" ? `${activePhase.color}30` : undefined,
              }}
            >
              {/* Accent decorations */}
              {sectionStyle.accent === "left-border" && (
                <div
                  className="absolute left-0 top-0 h-full w-1.5 rounded-l-3xl"
                  style={{ backgroundColor: activePhase.color }}
                />
              )}
              {sectionStyle.accent === "top-border" && (
                <div
                  className="absolute left-0 right-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${activePhase.color}, ${activePhase.color}40)` }}
                />
              )}
              {sectionStyle.accent === "glow" && (
                <div
                  className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full opacity-20 blur-3xl"
                  style={{ backgroundColor: activePhase.color }}
                />
              )}

              {/* Section header */}
              <div
                className={`relative flex items-center justify-between px-8 py-6 ${sectionStyle.headerBg}`}
              >
                <div className="flex items-center gap-5">
                  {sectionStyle.iconStyle === "filled" && (
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-105"
                      style={{ backgroundColor: activePhase.color }}
                    >
                      <SectionIcon className="size-6" />
                    </div>
                  )}
                  {sectionStyle.iconStyle === "outlined" && (
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl border-2 transition-all group-hover:scale-105"
                      style={{ borderColor: activePhase.color, color: activePhase.color }}
                    >
                      <SectionIcon className="size-6" />
                    </div>
                  )}
                  {sectionStyle.iconStyle === "gradient" && (
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${activePhase.color}, ${activePhase.color}cc)`,
                      }}
                    >
                      <SectionIcon className="size-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                      {section.title}
                    </h3>
                    <span
                      className="text-sm font-semibold uppercase tracking-wider"
                      style={{ color: `${activePhase.color}` }}
                    >
                      {section.section_type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                {hasExercises && (
                  <span
                    className="rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md"
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
                <div className={`space-y-6 px-10 py-8 ${sectionStyle.contentBg}`}>
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
                <div className="border-t px-10 py-7">
                  <div className="mb-3 flex items-center gap-3">
                    <FileText className="size-5" style={{ color: activePhase.color }} />
                    <label className="text-lg font-bold text-foreground">
                      Your Artifact
                    </label>
                  </div>
                  {isViewingPastDay ? (
                    (responses[section.id] ?? "") ? (
                      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-base leading-relaxed text-foreground">
                        {responses[section.id]}
                      </div>
                    ) : (
                      <p className="text-sm italic text-muted-foreground/60">
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
                        className="w-full resize-y rounded-lg border bg-background px-5 py-4 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-1"
                      />
                      {(responses[section.id] ?? "").length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {(responses[section.id] ?? "").length} characters
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Exercises within section */}
              {hasExercises && (
                <div className="flex flex-col gap-5 border-t p-8">
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

        {/* ── End of Day Outcomes ── (only shown when all actions complete) */}
        {todayProgress === 100 && todayActionsTotal > 0 && (() => {
          const raw = todayContent?.end_of_day_outcomes
          const items = Array.isArray(raw) ? raw : (raw as { outcomes?: string[] })?.outcomes ?? []
          return items.length > 0 ? (
            <section
              className="relative overflow-hidden rounded-3xl border-2 shadow-lg"
              style={{
                borderColor: `${activePhase.color}30`,
                background: `linear-gradient(135deg, ${activePhase.color}08, ${activePhase.color}03)`,
              }}
            >
              {/* Decorative element */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-15 blur-3xl"
                style={{ backgroundColor: activePhase.color }}
              />
              <div
                className="flex items-center gap-5 border-b px-8 py-6"
                style={{ borderColor: `${activePhase.color}15` }}
              >
                <div
                  className="flex size-14 items-center justify-center rounded-full text-white shadow-lg"
                  style={{ backgroundColor: activePhase.color }}
                >
                  <Target className="size-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  End-of-Day Outcomes
                </h3>
              </div>
              <div className="px-8 py-7">
                <ul className="space-y-4">
                  {items.map((o: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 rounded-xl border bg-white/60 p-4 text-lg transition-all hover:shadow-md dark:bg-white/5"
                      style={{ borderColor: `${activePhase.color}20` }}
                    >
                      <CheckCircle2
                        className="mt-0.5 size-7 shrink-0"
                        style={{ color: activePhase.color }}
                      />
                      <span className="leading-relaxed text-foreground">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null
        })()}

        {/* ── Facilitator Close ── (only shown when all actions complete) */}
        {todayProgress === 100 && todayActionsTotal > 0 && (() => {
          const raw = todayContent?.facilitator_close
          if (!raw) return null
          // Support both {close: [...]} and {message, preview} formats
          const closeItems = (raw as { close?: string[] })?.close
          const message = (raw as { message?: string })?.message
          if (closeItems && closeItems.length > 0) {
            return (
              <div
                className="overflow-hidden rounded-2xl p-8"
                style={{ backgroundColor: activePhase.color }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-2xl" />
                  <div className="relative z-10 space-y-4">
                    {closeItems.map((line: string, i: number) => (
                      <p key={i} className="text-xl font-semibold leading-relaxed text-white">
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
                className="overflow-hidden rounded-2xl p-8"
                style={{ backgroundColor: activePhase.color }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-2xl" />
                  <div className="relative z-10">
                    <p className="text-xl font-semibold leading-relaxed text-white">
                      {message}
                    </p>
                    {(raw as { preview?: string })?.preview && (
                      <p className="mt-4 text-lg font-medium text-white/70">
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
            className="flex items-center gap-4 rounded-2xl px-7 py-5"
            style={{ backgroundColor: `${activePhase.color}10` }}
          >
            <Sparkles
              className="size-7"
              style={{ color: activePhase.color }}
            />
            <p
              className="text-lg font-bold"
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

        {/* ── Next Day Button - shown when all actions are complete ── */}
        {!isViewingPastDay && todayActionsTotal > 0 && todayActionsDone === todayActionsTotal && selectedDay < program.totalDays && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border-2 p-10 text-center"
            style={{
              borderColor: `${activePhase.color}40`,
              backgroundColor: `${activePhase.color}08`,
            }}
          >
            <div
              className="mb-6 flex size-20 items-center justify-center rounded-full text-white shadow-lg"
              style={{ backgroundColor: activePhase.color }}
            >
              <CheckCircle2 className="size-10" />
            </div>
            <h3 className="text-3xl font-extrabold text-foreground">
              Day {selectedDay} Complete!
            </h3>
            <p className="mt-2 text-xl text-muted-foreground">
              Great work! You&apos;ve completed all actions for today.
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-xl px-12 py-8 text-xl font-bold text-white shadow-lg h-auto"
              style={{ backgroundColor: activePhase.color }}
              onClick={() => {
                const nextDay = selectedDay + 1
                // If all actions are done, next day should be accessible
                // Use Math.max to handle cases where activeDay hasn't updated yet
                const effectiveActiveDay = todayActionsDone === todayActionsTotal 
                  ? Math.max(activeDay, selectedDay + 1) 
                  : activeDay
                if (nextDay <= effectiveActiveDay) {
                  setActiveDay(Math.max(activeDay, nextDay)) // Ensure activeDay is updated
                  setSelectedDay(nextDay)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
            >
              Continue to Day {selectedDay + 1}
              <ArrowRight className="ml-3 size-7" />
            </Button>
          </div>
        )}
      </div>{/* end session-content */}
    </div>{/* end left column */}

        {/* ── RIGHT: Progress side tile ── */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[32rem] lg:self-start">
          <div className="rounded-3xl border bg-card">
            {/* Overall progress header */}
            <div className="flex items-center gap-6 border-b p-8">
              <div className="relative flex size-32 items-center justify-center">
                <svg className="size-32 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
                    stroke={activePhase.color}
                    strokeDasharray={`${overallPct * 1.257} 125.7`}
                  />
                </svg>
                <span className="absolute text-4xl font-extrabold text-foreground">{overallPct}%</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Overall Progress</p>
                <p className="text-xl text-muted-foreground">{overallCompleted}/{overallTotal} days</p>
              </div>
            </div>

            {/* Phase rows */}
            <div className="divide-y">
              {phaseStats.map((phase) => {
                const PhaseIcon = phase.icon
                const isCurrentPhase = activeDay >= phase.dayStart && activeDay <= phase.dayEnd
                return (
                  <div key={phase.id} className="p-6">
                    <div className="mb-4 flex items-center gap-4">
                      <div
                        className="flex size-12 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: phase.color }}
                      >
                        <PhaseIcon className="size-6" />
                      </div>
                      <span className="flex-1 text-lg font-bold text-foreground">
                        {phase.label}
                      </span>
                      {isCurrentPhase && (
                        <span className="size-4 rounded-full" style={{ backgroundColor: phase.color }} />
                      )}
                      <span className="text-base font-bold text-muted-foreground">
                        {phase.completed}/{phase.total}
                      </span>
                    </div>
                    {/* Day dots */}
                    <div className="flex gap-3">
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
                            className={`flex size-9 items-center justify-center rounded-md text-xs font-bold transition-all ${
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
                              <CheckCircle2 className="size-4.5" style={{ color: phase.color }} />
                            ) : isLocked ? (
                              <Lock className="size-3.5" />
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

      {/* ── Sticky Mobile Progress Tracker ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm p-4 lg:hidden">
        <div className="flex items-center gap-4">
          {/* Day Badge - square bold */}
          <div 
            className="flex flex-col items-center justify-center rounded-xl w-16 h-16 shrink-0"
            style={{ backgroundColor: "#1a4a4a" }}
          >
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/70">Day</span>
            <span className="text-2xl font-black text-white leading-none">{selectedDay}</span>
          </div>
          
          {/* Progress info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-foreground truncate">
                {todayContent?.title ?? `Day ${selectedDay}`}
              </span>
              <span className="text-sm font-bold shrink-0 ml-2" style={{ color: activePhase.color }}>
                {todayProgress}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${todayProgress}%`,
                  backgroundColor: activePhase.color,
                }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{activePhase.label}</span>
              <span>{todayActionsDone}/{todayActionsTotal} actions</span>
            </div>
          </div>
        </div>
      </div>
      {/* Spacer for sticky footer on mobile */}
      <div className="h-28 lg:hidden" />
    </div>
  )
}
