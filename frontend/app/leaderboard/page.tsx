"use client";

import { motion } from "framer-motion";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "@/components/Navbar";

const leaderboard = [
  { name: "Aanya", points: 560, skill: "AI/ML", streak: 21 },
  { name: "Rohan", points: 520, skill: "Web Development", streak: 18 },
  { name: "Neha", points: 500, skill: "Data Science", streak: 16 },
  { name: "Arjun", points: 460, skill: "Cloud & DevOps", streak: 15 },
  { name: "Isha", points: 420, skill: "Cybersecurity", streak: 12 },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-black px-5 pb-16 pt-6 sm:px-8">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl space-y-6 pt-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-surface rounded-3xl p-7"
        >
          <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
            Leaderboard
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white">
            Top Learners
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Updated {dayjs().format("DD MMM YYYY, hh:mm A")}
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="card-surface rounded-3xl p-6"
        >
          <h2 className="mb-4 font-display text-xl font-semibold text-white">
            Points Distribution
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderboard}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,10,10,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="points" fill="rgba(191,219,254,0.9)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="card-surface rounded-3xl p-6"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                <tr>
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Learner</th>
                  <th className="pb-3">Skill</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.name}>
                    <td className="py-3">#{idx + 1}</td>
                    <td className="py-3 font-medium text-white">{entry.name}</td>
                    <td className="py-3">{entry.skill}</td>
                    <td className="py-3">{entry.points}</td>
                    <td className="py-3">{entry.streak} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
