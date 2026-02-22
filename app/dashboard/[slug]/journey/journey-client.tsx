"use client"

import { useState } from "react"
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
  mindset_disruption: Lightbulb,
  workplace_scenario: MessageSquare,
  decision_exercise: Zap,
  artifact_creation: FileText,
  reflection_upgrade: Pen,
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
  behaviors_instilled: string[] | null
  end_of_day_outcomes: string[] | null
  facilitator_close: { message: string; preview: string } | null
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
    default:
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
}: {
  exercise: CurriculumExercise
  phaseColor: string
  index: number
  isCompleted: boolean
  onToggle: () => void
  saving: boolean
}) {
  const options = Array.isArray(exercise.options) ? exercise.options : null

  return (
    <button
      onClick={onToggle}
      disabled={saving}
      className={`group flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
        isCompleted ? "border-transparent" : "hover:shadow-md"
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
}: JourneyClientProps) {
  const [selectedDay, setSelectedDay] = useState(currentDay)
  const [completedActions, setCompletedActions] = useState<Set<string>>(
    new Set(
      userActions
        .filter((a) => a.completed)
        .map((a) => `${a.day_number}-${a.action_index}`)
    )
  )
  const [saving, setSaving] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState<string | null>(
    PHASES.find((p) => selectedDay >= p.dayStart && selectedDay <= p.dayEnd)
      ?.id ?? "foundation"
  )

  const todayContent = curriculum.find((d) => d.day_number === selectedDay)
  const activePhase =
    PHASES.find((p) => selectedDay >= p.dayStart && selectedDay <= p.dayEnd) ??
    PHASES[0]
  const iconSrc = programIcons[program.slug]

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
    const key = `${dayNum}-${actionIdx}`
    const isNowCompleted = !completedActions.has(key)
    const next = new Set(completedActions)
    if (isNowCompleted) next.add(key)
    else next.delete(key)
    setCompletedActions(next)

    setSaving(true)
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          dayNumber: dayNum,
          actionIndex: actionIdx,
          completed: isNowCompleted,
        }),
      })
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

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* ── Phase-Grouped Day Navigator ── */}
      <div className="space-y-3">
        {PHASES.map((phase) => {
          const PhaseIcon = phase.icon
          const isExpanded = expandedPhase === phase.id
          const days = Array.from(
            { length: phase.dayEnd - phase.dayStart + 1 },
            (_, i) => phase.dayStart + i
          )
          const phaseDaysCompleted = days.filter((d) => isDayCompleted(d)).length
          const phaseProgress = Math.round(
            (phaseDaysCompleted / days.length) * 100
          )
          const isCurrentPhase =
            currentDay >= phase.dayStart && currentDay <= phase.dayEnd
          const isPastPhase = currentDay > phase.dayEnd

          return (
            <div
              key={phase.id}
              className="overflow-hidden rounded-2xl border-2 transition-all"
              style={{
                borderColor: isCurrentPhase
                  ? phase.color
                  : isPastPhase
                  ? `${phase.color}30`
                  : "transparent",
                backgroundColor: isCurrentPhase
                  ? `${phase.color}04`
                  : undefined,
              }}
            >
              {/* Phase header */}
              <button
                onClick={() =>
                  setExpandedPhase(isExpanded ? null : phase.id)
                }
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30"
              >
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: phase.color }}
                >
                  <PhaseIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-foreground">
                      {phase.label}
                    </h3>
                    {isCurrentPhase && (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                        style={{ backgroundColor: phase.color }}
                      >
                        Current
                      </span>
                    )}
                    {isPastPhase && (
                      <CheckCircle2
                        className="size-5"
                        style={{ color: phase.color }}
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {phase.tagline} &middot; Days {phase.dayStart}-{phase.dayEnd}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${phaseProgress}%`,
                          backgroundColor: phase.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: phase.color }}
                    >
                      {phaseProgress}%
                    </span>
                  </div>
                  <ArrowRight
                    className={`size-5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expanded day grid */}
              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => {
                      const isSelected = day === selectedDay
                      const isCurrent = day === currentDay
                      const isLocked = day > currentDay
                      const completed = isDayCompleted(day)
                      const dayTitle =
                        curriculum.find((d) => d.day_number === day)?.title ?? ""

                      return (
                        <button
                          key={day}
                          onClick={() => !isLocked && setSelectedDay(day)}
                          disabled={isLocked}
                          title={isLocked ? "Locked" : dayTitle}
                          className={`group relative flex h-12 items-center gap-2 rounded-xl px-3.5 text-sm font-bold transition-all ${
                            isSelected
                              ? "text-white shadow-lg"
                              : completed
                              ? "border-2 bg-card hover:shadow-md"
                              : isLocked
                              ? "bg-muted/60 text-muted-foreground/30"
                              : isCurrent
                              ? "border-2 bg-card shadow-md"
                              : "border bg-card text-foreground hover:shadow-md"
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: phase.color }
                              : completed
                              ? {
                                  borderColor: `${phase.color}40`,
                                  color: phase.color,
                                }
                              : isCurrent
                              ? { borderColor: phase.color }
                              : undefined
                          }
                        >
                          {isLocked ? (
                            <Lock className="size-3.5" />
                          ) : completed && !isSelected ? (
                            <CheckCircle2 className="size-4" />
                          ) : null}
                          <span>Day {day}</span>
                          {isCurrent && !isSelected && (
                            <span
                              className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-card"
                              style={{ backgroundColor: phase.color }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Active Day Hero Card ── */}
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
            <div className="mt-4 flex items-center gap-3">
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
                {selectedDay === currentDay ? "Start Session" : "View Session"}
              </Button>
              <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2">
                <div className="h-2.5 w-20 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${todayProgress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white">
                  {todayActionsDone}/{todayActionsTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Day nav arrows ── */}
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
            selectedDay < currentDay && setSelectedDay(selectedDay + 1)
          }
          disabled={selectedDay >= currentDay}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          {selectedDay < currentDay ? `Day ${selectedDay + 1}` : ""}
          {selectedDay >= currentDay && selectedDay < program.totalDays && (
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
              {section.content && section.content.length > 0 && (
                <div className="space-y-3 px-5 py-4">
                  {section.content.map((item, i) => (
                    <ContentBlock
                      key={i}
                      item={item}
                      phaseColor={activePhase.color}
                    />
                  ))}
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
        {todayContent?.behaviors_instilled &&
          todayContent.behaviors_instilled.length > 0 && (
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
                  {todayContent.behaviors_instilled.map((b, i) => (
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
          )}

        {/* ── End of Day Outcomes ── */}
        {todayContent?.end_of_day_outcomes &&
          todayContent.end_of_day_outcomes.length > 0 && (
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
                  {todayContent.end_of_day_outcomes.map((o, i) => (
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
          )}

        {/* ── Facilitator Close ── */}
        {todayContent?.facilitator_close && (
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: activePhase.color }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-2xl" />
              <div className="relative z-10">
                <p className="text-base font-semibold leading-relaxed text-white">
                  {todayContent.facilitator_close.message}
                </p>
                {todayContent.facilitator_close.preview && (
                  <p className="mt-3 text-sm font-medium text-white/70">
                    {todayContent.facilitator_close.preview}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
    </div>
  )
}
