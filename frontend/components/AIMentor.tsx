"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, SendHorizontal, X } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  text: string;
};

type AIMentorProps = {
  skill: string;
  level: string;
  progress: number;
};

export default function AIMentor({ skill, level, progress }: AIMentorProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hi, I am Progyan. Ask me anything about ${skill} at ${level} level.`,
    },
  ]);
  const [draft, setDraft] = useState("");

  const quickReply = useMemo(() => {
    if (progress < 30) return "Start with fundamentals and finish one sub-point today.";
    if (progress < 70) return "Great progress. Focus on completing one full unit this week.";
    return "You are near completion. Shift focus to projects and interview prep.";
  }, [progress]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", text: quickReply },
    ]);
    setDraft("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed right-5 bottom-5 z-[65] inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/40"
      >
        <Bot className="h-4 w-4 text-sky-200" />
        AI Mentor
      </button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed right-5 bottom-20 z-[64] flex h-[430px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/85 shadow-2xl backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                  Progyan AI
                </p>
                <p className="text-sm font-semibold text-white">
                  {skill} • {level}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 p-1 text-slate-300 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, idx) => (
                <div
                  key={`${message.role}-${idx}`}
                  className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-white/10 text-slate-100"
                      : "ml-auto bg-white text-black"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <footer className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask roadmap or career question..."
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-white/35"
                />
                <button
                  type="button"
                  onClick={send}
                  className="rounded-xl border border-white/20 bg-white px-3 py-2 text-black transition hover:bg-slate-200"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </footer>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
