import Link from "next/link";

const features = [
  {
    index: "01",
    title: "Know What You Want",
    body: "Users can discover career direction through a personalized diagnostic test or explore a job opening portal with salary insights for financially driven decisions.",
  },
  {
    index: "02",
    title: "Personalized Roadmap Generation",
    body: "A custom learning path is generated from interests, diagnostic score, and current knowledge level to create a clear step-by-step growth plan.",
  },
  {
    index: "03",
    title: "Skill Graph and Progress Tracker",
    body: "An interactive graph updates in real time as users solve daily questions and assessments, with progress mapped directly to each roadmap milestone.",
  },
  {
    index: "04",
    title: "AI Career Guidance",
    body: "A 24x7 AI mentor supports each learner with domain Q and A, resume review, and career decisions across every stage of the journey.",
  },
  {
    index: "05",
    title: "Gamification and Leaderboard",
    body: "Roadmap score, assignment score, and consistency metrics power competitive leaderboards that reward momentum and visible improvement.",
  },
];

const roadmapLevels = [
  {
    level: "Basic",
    description:
      "Assigned when fundamentals need reinforcement before advanced outcomes can be achieved.",
  },
  {
    level: "Intermediate",
    description:
      "Assigned when core concepts are stable and users are ready for applied projects and interviews.",
  },
  {
    level: "Advanced",
    description:
      "Assigned when users demonstrate strong command and can focus on specialization and high-impact preparation.",
  },
];

const futureScope = [
  {
    title: "Mock Interviews",
    body: "Domain-specific AI interviews for coding rounds, HR behavior, and technical depth, followed by detailed actionable feedback.",
  },
  {
    title: "Professional Teacher Guidance",
    body: "Verified experts and educators for doubt-clearing sessions, mentorship, and deeper conceptual coaching.",
  },
  {
    title: "Peer Study Jams",
    body: "Cohort-based learning spaces where users at similar roadmap stages collaborate, solve challenges, and stay accountable.",
  },
];

const stats = [
  { label: "Personalized Tracks", value: "1:1" },
  { label: "Mentorship Window", value: "24x7" },
  { label: "Roadmap Levels", value: "3" },
  { label: "Progress Visibility", value: "Real Time" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black pb-20">
      <div className="orb orb-one -top-28 -left-20 h-72 w-72 sm:h-96 sm:w-96" />
      <div className="orb orb-two top-32 right-0 h-64 w-64 sm:h-96 sm:w-96" />
      <div className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8 lg:px-10">
        <header className="entry-rise card-surface sticky top-4 z-40 rounded-2xl px-5 py-4 backdrop-blur md:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="pulse-dot inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent-soft)] bg-white/8 text-xs font-bold text-[var(--accent)]">
                AL
              </span>
              <p className="font-display text-sm font-semibold tracking-[0.2em] text-slate-200 uppercase">
                Adaptive Learn
              </p>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-[var(--text-muted)] md:flex">
              <a href="#features" className="transition hover:text-[var(--text-main)]">
                Features
              </a>
              <a href="#roadmap" className="transition hover:text-[var(--text-main)]">
                Roadmap
              </a>
              <a href="#future" className="transition hover:text-[var(--text-main)]">
                Future Scope
              </a>
            </nav>
            <Link
              href="#cta"
              className="rounded-full border border-[var(--accent)]/45 px-4 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black"
            >
              Join Waitlist
            </Link>
          </div>
        </header>

        <main className="mt-12 space-y-18">
          <section className="section-line entry-rise [animation-delay:80ms] grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-end rounded-2xl pt-5">
            <div className="space-y-7">
              <span className="pill inline-flex items-center rounded-full px-4 py-1.5 text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
                AI Based Adaptive Learning and Skill Development Platform
              </span>
              <h1 className="font-display gradient-heading text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
                Build the career path that actually fits your current level.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
                Our AI-powered platform starts with your current knowledge and
                career aspiration, then creates a personalized roadmap that
                evolves through progress tracking, mentorship, and accountability.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#features"
                  className="button-shimmer rounded-full px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Explore Features
                </a>
                <a
                  href="#problem-solution"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  See Problem and Solution
                </a>
              </div>
            </div>

            <div className="card-surface rounded-3xl p-6 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
                  Learning Flow
                </p>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  Live
                </span>
              </div>
              <ol className="space-y-4">
                {["Diagnostic Test", "Roadmap Generated", "Skill Graph Updated", "Mentor Guidance", "Interview Prep"].map(
                  (step, index) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-xs text-slate-200">
                        {index + 1}
                      </span>
                      <p className="text-sm text-slate-200">{step}</p>
                    </li>
                  )
                )}
              </ol>
              <div className="accent-line mt-7 h-px w-full" />
              <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
                Users are automatically placed into Basic, Intermediate, or
                Advanced roadmap levels based on onboarding exam score.
              </p>
            </div>
          </section>

          <section className="section-line entry-rise [animation-delay:140ms] grid gap-4 rounded-2xl pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="card-surface rounded-2xl p-5">
                <p className="text-xs tracking-[0.14em] text-[var(--text-muted)] uppercase">
                  {stat.label}
                </p>
                <p className="mt-3 font-display text-2xl font-semibold text-white">
                  {stat.value}
                </p>
              </article>
            ))}
          </section>

          <section
            id="problem-solution"
            className="section-line entry-rise [animation-delay:200ms] grid gap-6 rounded-2xl pt-5 md:grid-cols-2"
          >
            <article className="card-surface rounded-3xl p-7">
              <p className="text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
                Problem Statement
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">
                Static learning paths ignore where students currently stand.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                Many learners are forced into one-size-fits-all content, which
                creates confusion, slow progress, and weak confidence in career
                direction. Students need a system that adapts continuously.
              </p>
            </article>

            <article className="card-surface-strong rounded-3xl p-7">
              <p className="text-xs tracking-[0.2em] text-slate-300/80 uppercase">
                Solution
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white">
                Personalized AI journeys with human support when needed.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
                The platform maps current knowledge and interests, creates a
                custom roadmap, tracks progress through a skill graph, offers
                round-the-clock AI mentorship, and expands with interviews,
                teachers, and peer collaboration for complete career preparation.
              </p>
            </article>
          </section>

          <section
            id="features"
            className="section-line entry-rise [animation-delay:260ms] space-y-6 rounded-2xl pt-5"
          >
            <div className="space-y-2">
              <p className="text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
                Core Features
              </p>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                End-to-end system for discovering, building, and proving skills.
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {features.map((feature) => (
                <article key={feature.title} className="card-surface rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                      {feature.index}
                    </span>
                    <span className="text-xs tracking-[0.16em] text-[var(--text-muted)] uppercase">
                      Feature
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="roadmap"
            className="section-line entry-rise [animation-delay:320ms] space-y-6 rounded-2xl pt-5"
          >
            <div className="space-y-2">
              <p className="text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
                Placement Engine
              </p>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Three roadmap levels, one adaptive placement decision.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {roadmapLevels.map((item) => (
                <article key={item.level} className="card-surface rounded-2xl p-6">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {item.level}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="future"
            className="section-line entry-rise [animation-delay:380ms] space-y-6 rounded-2xl pt-5"
          >
            <div className="space-y-2">
              <p className="text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
                Future Scope
              </p>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Expansion pillars already scoped for the next stage.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {futureScope.map((item) => (
                <article key={item.title} className="card-surface rounded-2xl p-6">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="cta"
            className="section-line entry-rise [animation-delay:440ms] card-surface-strong rounded-3xl p-8 pt-9 sm:p-10 sm:pt-11"
          >
            <p className="text-xs tracking-[0.2em] text-slate-300/80 uppercase">
              Ready to Launch
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-white sm:text-4xl">
              Start with diagnostics, evolve with data, finish with outcomes.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
              This landing page currently uses your provided problem statement
              content as fill text and can now be connected to real workflows in
              the next implementation phase.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="button-shimmer rounded-full px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110">
                Request Early Access
              </button>
              <button className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60">
                Book Demo
              </button>
            </div>
          </section>
        </main>

        <footer className="footer-fade mt-12 border-t border-white/15 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs tracking-[0.14em] text-[var(--text-muted)] uppercase">
            <p>Adaptive Learn Platform</p>
            <p>AI Powered Personalized Journey</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
