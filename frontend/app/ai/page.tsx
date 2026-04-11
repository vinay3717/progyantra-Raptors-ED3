"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const cards = [
  {
    title: "Assessment Overview",
    body: "Generate a clean summary of your test results: strengths, gaps, and reroute triggers.",
    href: "/ai/assessment",
  },
  {
    title: "Roadmap Generator",
    body: "Generate a roadmap JSON from resume + goal, then load it into /roadmap instantly.",
    href: "/ai/roadmap",
  },
  {
    title: "Path Suggestions",
    body: "Get multiple suggested paths from your resume and choose the best fit to generate.",
    href: "/ai/suggestions",
  },
];

export default function AiHubPage() {
  return (
    <div className="min-h-screen bg-black px-[6vw] pb-20 pt-6 text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl space-y-6 pt-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl"
        >
          <p className="text-xs tracking-[0.24em] text-white/55 uppercase">AI Layer</p>
          <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
            Gemini-Backed Generators
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/68">
            Uses `@google/generative-ai` server routes. Add your key in `.env.local` as
            `GEMINI_API_KEY`. Do not hardcode keys in code.
          </p>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              animate={{ y: [-5, 5] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "mirror",
                duration: 6 + index,
              }}
              className="rounded-3xl border border-white/12 bg-black/45 p-6 backdrop-blur-xl"
            >
              <h2 className="font-display text-2xl tracking-tight text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/68">{card.body}</p>
              <Link
                href={card.href}
                className="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40 hover:bg-white/5"
              >
                Open
              </Link>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
}

