"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", match: "/" },
  { href: "/auth", label: "Auth", match: "/auth" },
  { href: "/onboarding", label: "Onboarding", match: "/onboarding" },
  { href: "/roadmap/overview", label: "Roadmap", match: "/roadmap" },
  { href: "/ai", label: "AI", match: "/ai" },
  { href: "/leaderboard", label: "Leaderboard", match: "/leaderboard" },
  { href: "/dashboard", label: "Dashboard", match: "/dashboard" },
  { href: "/test", label: "Test", match: "/test" },
  { href: "/ui-lab", label: "UI Lab", match: "/ui-lab" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-4 z-50 mx-auto mb-8 w-full max-w-7xl rounded-full border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-display text-sm tracking-[0.2em] text-white uppercase">
          Progyantra
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {navItems.map((item) => {
            const active =
              item.match === "/"
                ? pathname === "/"
                : pathname === item.match || pathname.startsWith(`${item.match}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-xs transition sm:text-sm ${
                  active
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
