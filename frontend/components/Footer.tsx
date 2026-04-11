"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { href: "/", label: "Home", match: "/" },
  { href: "/auth", label: "Auth", match: "/auth" },
  { href: "/onboarding", label: "Onboarding", match: "/onboarding" },
  { href: "/roadmap/overview", label: "Roadmap", match: "/roadmap" },
  { href: "/leaderboard", label: "Leaderboard", match: "/leaderboard" },
  { href: "/dashboard", label: "Dashboard", match: "/dashboard" },
  { href: "/test", label: "Test", match: "/test" },
  { href: "/ui-lab", label: "UI Lab", match: "/ui-lab" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="footer-fade mt-auto border-t border-white/10 bg-black/40 px-[6vw] py-10 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.24em] text-white/55 uppercase">
              Progyantra
            </p>
            <p className="mt-2 max-w-md text-sm leading-7 text-white/70">
              Antigravity learning interface for roadmaps, testing, and competitive
              progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2">
            {footerLinks.map((link) => {
              const active =
                link.match === "/"
                  ? pathname === "/"
                  : pathname === link.match || pathname.startsWith(`${link.match}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-xs tracking-[0.14em] uppercase transition ${
                    active
                      ? "border border-white/30 bg-white text-black"
                      : "border border-white/12 text-white/70 hover:border-white/35 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs tracking-[0.16em] text-white/55 uppercase">
          <p>Adaptive Learn Platform</p>
          <p>Build: {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}

