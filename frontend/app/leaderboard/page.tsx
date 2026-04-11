"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Crown, Flame, Rocket } from "lucide-react";
import { useMemo, useState } from "react";
import { useIsClient } from "@/hooks/useIsClient";

const leaderboardData = [
  {
    name: "Aanya Sharma",
    handle: "aanya_17",
    overall: 1860,
    weeklyDelta: 122,
    solved: 294,
    streak: 31,
    domains: {
      "AI/ML": 740,
      Web: 510,
      "Data Science": 610,
      Cybersecurity: 420,
    },
  },
  {
    name: "Rohan Mehta",
    handle: "rohan_codes",
    overall: 1792,
    weeklyDelta: 148,
    solved: 281,
    streak: 26,
    domains: {
      "AI/ML": 580,
      Web: 702,
      "Data Science": 420,
      Cybersecurity: 390,
    },
  },
  {
    name: "Neha Verma",
    handle: "neha_stack",
    overall: 1745,
    weeklyDelta: 98,
    solved: 269,
    streak: 22,
    domains: {
      "AI/ML": 410,
      Web: 720,
      "Data Science": 560,
      Cybersecurity: 368,
    },
  },
  {
    name: "Arjun Nair",
    handle: "arjun_devops",
    overall: 1690,
    weeklyDelta: 180,
    solved: 257,
    streak: 34,
    domains: {
      "AI/ML": 360,
      Web: 620,
      "Data Science": 520,
      Cybersecurity: 590,
    },
  },
  {
    name: "Isha Khan",
    handle: "isha_secure",
    overall: 1648,
    weeklyDelta: 84,
    solved: 241,
    streak: 19,
    domains: {
      "AI/ML": 300,
      Web: 580,
      "Data Science": 430,
      Cybersecurity: 720,
    },
  },
  {
    name: "Dev Patel",
    handle: "dev_matrix",
    overall: 1615,
    weeklyDelta: 110,
    solved: 236,
    streak: 21,
    domains: {
      "AI/ML": 620,
      Web: 530,
      "Data Science": 470,
      Cybersecurity: 355,
    },
  },
  {
    name: "Maya Joshi",
    handle: "maya_algo",
    overall: 1580,
    weeklyDelta: 70,
    solved: 220,
    streak: 15,
    domains: {
      "AI/ML": 390,
      Web: 500,
      "Data Science": 650,
      Cybersecurity: 310,
    },
  },
];

const domains = ["AI/ML", "Web", "Data Science", "Cybersecurity"] as const;
const boardModes = [
  { id: "overall", label: "Overall Best" },
  { id: "trending", label: "Best Trending" },
  { id: "domain", label: "By Domain" },
] as const;

type BoardMode = (typeof boardModes)[number]["id"];

function getScore(mode: BoardMode, domain: (typeof domains)[number], item: (typeof leaderboardData)[number]) {
  if (mode === "trending") return item.weeklyDelta;
  if (mode === "domain") return item.domains[domain];
  return item.overall;
}

export default function LeaderboardPage() {
  const [mode, setMode] = useState<BoardMode>("overall");
  const [domain, setDomain] = useState<(typeof domains)[number]>("AI/ML");
  const chartsReady = useIsClient();

  const sorted = useMemo(() => {
    return [...leaderboardData].sort((left, right) => {
      return getScore(mode, domain, right) - getScore(mode, domain, left);
    });
  }, [domain, mode]);

  const graphSeries = useMemo(
    () =>
      sorted.slice(0, 6).map((entry) => ({
        name: entry.handle,
        score: getScore(mode, domain, entry),
      })),
    [domain, mode, sorted]
  );

  const scoreLabel = mode === "trending" ? "Weekly +" : mode === "domain" ? `${domain} Score` : "Overall Score";

  return (
    <div className="min-h-screen bg-black px-[6vw] pb-20 pt-10 text-white">
      <main className="mx-auto w-full max-w-7xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Leaderboard Arena</p>
              <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
                Competitive Ranking Grid
              </h1>
              <p className="mt-3 text-sm text-white/65">
                Updated {dayjs().format("DD MMM YYYY, hh:mm A")}
              </p>
            </div>

            <div className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-right">
              <p className="text-xs tracking-[0.15em] text-white/55 uppercase">Current Board</p>
              <p className="text-lg text-white">{boardModes.find((item) => item.id === mode)?.label}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {boardModes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`rounded-full px-4 py-2 text-xs tracking-[0.14em] uppercase transition ${
                  mode === item.id
                    ? "bg-white text-black"
                    : "border border-white/20 text-white/72 hover:border-white/40 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}

            {mode === "domain" ? (
              <select
                value={domain}
                onChange={(event) => setDomain(event.target.value as (typeof domains)[number])}
                className="rounded-full border border-white/20 bg-black px-4 py-2 text-xs tracking-[0.14em] text-white uppercase"
              >
                {domains.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          {sorted.slice(0, 3).map((entry, index) => (
            <motion.article
              key={entry.handle}
              animate={{ y: [-5, 5] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", duration: 6 + index }}
              className="rounded-3xl border border-white/12 bg-black/45 p-5 backdrop-blur-xl"
            >
              <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Rank #{index + 1}</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl tracking-tight text-white">{entry.name}</h2>
                  <p className="text-xs text-white/60">@{entry.handle}</p>
                </div>
                {index === 0 ? (
                  <Crown className="h-5 w-5 text-amber-300" />
                ) : index === 1 ? (
                  <Rocket className="h-5 w-5 text-cyan-200" />
                ) : (
                  <Flame className="h-5 w-5 text-orange-300" />
                )}
              </div>
              <p className="mt-4 text-3xl text-white">{getScore(mode, domain, entry)}</p>
              <p className="text-xs text-white/55">{scoreLabel}</p>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.65fr_0.35fr]">
          <article className="min-w-0 rounded-[2rem] border border-white/12 bg-black/45 p-5 backdrop-blur-xl">
            <h3 className="font-display text-2xl tracking-tight text-white">Rank Table</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="text-xs tracking-[0.15em] text-white/55 uppercase">
                  <tr>
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Learner</th>
                    <th className="pb-3">{scoreLabel}</th>
                    <th className="pb-3">Solved</th>
                    <th className="pb-3">Streak</th>
                    <th className="pb-3">Weekly +</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sorted.map((entry, index) => (
                    <tr key={entry.handle} className="text-white/85">
                      <td className="py-3">#{index + 1}</td>
                      <td className="py-3">
                        <p className="font-medium text-white">{entry.name}</p>
                        <p className="text-xs text-white/55">@{entry.handle}</p>
                      </td>
                      <td className="py-3">{getScore(mode, domain, entry)}</td>
                      <td className="py-3">{entry.solved}</td>
                      <td className="py-3">{entry.streak} days</td>
                      <td className="py-3 text-cyan-200">+{entry.weeklyDelta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/12 bg-black/45 p-5 backdrop-blur-xl">
            <h3 className="font-display text-2xl tracking-tight text-white">Score Pulse</h3>
            <p className="mt-2 text-sm text-white/65">
              Top six users for the selected ranking mode.
            </p>
            <div className="mt-4 h-72">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <LineChart data={graphSeries}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.55)" />
                    <YAxis stroke="rgba(255,255,255,0.55)" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.92)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "14px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8be9ff"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#e2f8ff" }}
                      activeDot={{ r: 6, fill: "#ffffff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="ghost-loader h-full rounded-2xl border border-white/10" />
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
