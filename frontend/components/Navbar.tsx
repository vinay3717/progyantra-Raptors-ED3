"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/auth", label: "Auth" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-4 z-50 mx-auto mb-8 flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl sm:px-6"
    >
      <Link href="/" className="font-display text-sm font-semibold tracking-[0.2em] text-white uppercase">
        Progyantra
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                active
                  ? "bg-white text-black"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
