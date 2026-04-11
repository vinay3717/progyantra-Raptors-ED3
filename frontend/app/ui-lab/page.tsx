"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Beaker, LayoutGrid, Sparkles } from "lucide-react";
import FeaturePlaceholder from "@/components/FeaturePlaceholder";

const previewBlocks = [
  {
    title: "Roadmap Glass Cards",
    body: "Preview floating card motion, thin borders, and dark antigravity tones.",
  },
  {
    title: "Wavy Path Flow",
    body: "Validate progression animation and milestone spacing behavior.",
  },
  {
    title: "Terminal Quiz Panel",
    body: "Test one-question interactions and reroute warning states.",
  },
];

export default function UiLabPage() {
  return (
    <div className="min-h-screen bg-black px-[6vw] pb-20 pt-10 text-white">
      <main className="mx-auto w-full max-w-7xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl"
        >
          <p className="text-xs tracking-[0.24em] text-white/55 uppercase">UI Lab</p>
          <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
            Interface Testing Ground
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/68">
            Dedicated page for testing the new  components and transitions
            before backend integration.
          </p>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          {previewBlocks.map((block, index) => (
            <motion.article
              key={block.title}
              animate={{ y: [-5, 5] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", duration: 6 + index }}
              className="rounded-3xl border border-white/12 bg-black/45 p-5"
            >
              <div className="flex items-center gap-2 text-cyan-200">
                {index === 0 ? <LayoutGrid className="h-4 w-4" /> : index === 1 ? <Sparkles className="h-4 w-4" /> : <Beaker className="h-4 w-4" />}
                <p className="text-xs tracking-[0.16em] uppercase">Preview {index + 1}</p>
              </div>
              <h2 className="mt-3 font-display text-2xl tracking-tight text-white">{block.title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/68">{block.body}</p>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.65fr_0.35fr]">
          <div className="rounded-[2rem] border border-white/12 bg-black/45 p-6">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Quick Route Testing</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/ai"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40"
              >
                Open AI Hub
              </Link>
              <Link
                href="/roadmap/overview"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40"
              >
                Open Overview
              </Link>
              <Link
                href="/roadmap/graph"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40"
              >
                Open Graph
              </Link>
              <Link
                href="/roadmap/study"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40"
              >
                Open Study
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40"
              >
                Open Dashboard
              </Link>
              <Link
                href="/test"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40"
              >
                Open Test
              </Link>
            </div>
          </div>

          <FeaturePlaceholder
            title="Orbit Monitor"
            description="Use this card to validate placeholder visuals and notify interactions while features are being wired."
            actionLabel="Notify Preview"
          />
        </section>
      </main>
    </div>
  );
}
