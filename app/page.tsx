import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  Star,
  Target,
  Users,
  Award,
  Zap,
  TrendingUp,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroAnimation } from "@/components/hero-animation"
import { ProgramCard } from "@/components/program-card"

export default async function Home() {
  let programs: any[] | null = null
  let categories: any[] | null = null
  let features: any[] | null = null
  let pricing: any[] | null = null

  try {
    const supabase = await createClient()

    const { data: programsData } = await supabase
      .from("wf-programs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")

    programs = programsData

    const { data: categoriesData } = await supabase
      .from("wf-categories")
      .select("*")
      .order("sort_order")

    categories = categoriesData

    const programIds = programs?.map((p) => p.id) ?? []

    const [{ data: featuresData }, { data: pricingData }] = await Promise.all([
      supabase
        .from("wf-program_features")
        .select("*")
        .in("program_id", programIds)
        .order("sort_order"),
      supabase
        .from("wf-program_pricing")
        .select("*")
        .in("program_id", programIds)
        .order("sort_order"),
    ])

    features = featuresData
    pricing = pricingData
  } catch {
    // Supabase not configured – render page with empty data
  }

  return (
    <>
      {/* ──── CINEMATIC HERO ──── */}
      <section className="relative overflow-hidden bg-[#0a0e14] px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        {/* Animated background */}
        <HeroAnimation />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold tracking-wider text-white/80 uppercase backdrop-blur-md">
            <Sparkles className="size-4 text-[#00c892]" />
            Workforce
          </div>

          <h1 className="font-serif text-balance text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            AI generates work.{" "}
            <span className="bg-gradient-to-r from-[#00c892] to-[#00a5ff] bg-clip-text text-transparent">
              You own decisions.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-white/60">
            A 21-Day Career Operating System that transforms graduates into
            AI-ready professionals with the judgment, accountability, and
            clarity employers demand.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#00c892] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#00c892]/20 transition-all hover:bg-[#00e0a4] hover:shadow-xl hover:shadow-[#00c892]/30"
            >
              <Link href="/programs">
                Explore Programs
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full border-white/20 px-8 py-6 text-base text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white"
            >
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "21", label: "Day Operating System" },
              { value: "3", label: "Career Phases" },
              { value: "5", label: "Daily Actions" },
              { value: "1", label: "Career Credential" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-5 backdrop-blur-sm"
              >
                <div className="font-serif text-3xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CATEGORY BAR ──── */}
      {categories && categories.length > 0 && (
        <section className="sticky top-0 z-30 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2">
              <Link
              href="/programs"
              className="rounded-full bg-[#00c892] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md"
            >
              All Programs
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/programs?category=${cat.slug}`}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-[#00c892]/50 hover:bg-[#00c892]/5 hover:text-foreground"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ──── PROGRAMS GRID ──── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#00c892]">
                Career Operating Systems
              </p>
              <h2 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Build your competitive advantage
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
                Not a course. A behavior conditioning system, judgment training
                lab, and professional identity accelerator.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="shrink-0 rounded-full"
            >
              <Link href="/programs">
                View All Programs
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs?.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                features={
                  features?.filter((f) => f.program_id === program.id) ?? []
                }
                pricing={
                  pricing?.filter((p) => p.program_id === program.id) ?? []
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──── */}
      <section className="border-t bg-[#0a0e14] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#00c892]">
              Daily Career Operating Loop
            </p>
            <h2 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Five steps. Every day. No passive learning.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: "01",
                icon: Target,
                title: "Reality Briefing",
                desc: "What happens in real AI workplaces and why this skill matters.",
              },
              {
                step: "02",
                icon: Users,
                title: "Scenario Simulation",
                desc: "Realistic AI-powered workplace challenge with incomplete data and time pressure.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Decision Challenge",
                desc: "Approve, reject, or modify AI output. Justify reasoning. Identify risk.",
              },
              {
                step: "04",
                icon: Award,
                title: "Artifact Creation",
                desc: "Produce a real-world output: decision memo, escalation email, or recommendation brief.",
              },
              {
                step: "05",
                icon: Brain,
                title: "Reflection Upgrade",
                desc: "What did you miss? Where was judgment required? How could this escalate?",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#00c892]/20 hover:bg-white/[0.04]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#00c892]/10">
                    <item.icon className="size-4 text-[#00c892]" />
                  </div>
                  <span className="text-sm font-bold text-white/20">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── WHY THI ──── */}
      <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#00c892]">
            What Graduates Leave With
          </p>
          <h2 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            This is not a course.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            It is a behavior conditioning system, a judgment training lab, a
            professional identity accelerator, and a competitive advantage.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Decision Portfolio",
                desc: "A body of professional decisions demonstrating judgment under pressure.",
              },
              {
                icon: Brain,
                title: "AI Collaboration Workflows",
                desc: "Proven methods for working alongside intelligent systems effectively.",
              },
              {
                icon: Shield,
                title: "Escalation Framework",
                desc: "Know when to challenge AI, when to escalate, and how to document reasoning.",
              },
              {
                icon: TrendingUp,
                title: "Communication Samples",
                desc: "Decision memos, executive summaries, and recommendation briefs.",
              },
              {
                icon: Star,
                title: "Career Acceleration Plan",
                desc: "Your personalized 12-month AI workforce strategy.",
              },
              {
                icon: Award,
                title: "AI Workforce Ready Credential",
                desc: "Verified digital certificate demonstrating AI-era professional readiness.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group flex gap-4 rounded-2xl border bg-card p-6 text-left transition-all hover:shadow-lg hover:shadow-[#00c892]/5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#00c892]/10 transition-colors group-hover:bg-[#00c892]/20">
                  <item.icon className="size-5 text-[#00c892]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA BANNER ──── */}
      <section className="border-t bg-[#0a0e14] px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#00c892]/10 via-transparent to-[#00a5ff]/10 px-8 py-14 text-center sm:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,200,146,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(0,165,255,0.08),transparent_50%)]" />
          <div className="relative">
            <h2 className="font-serif text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Trust accelerates careers.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/60">
              Your degree got you here. Your operating behavior determines
              whether you rise. Start building the judgment, ownership, and
              clarity that employers demand.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[#00c892] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#00c892]/20 hover:bg-[#00e0a4]"
              >
                <Link href="/programs">Browse Programs</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-full border-white/20 px-8 py-6 text-white/80 hover:bg-white/10"
              >
                <Link href="/organizations">For Organizations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
