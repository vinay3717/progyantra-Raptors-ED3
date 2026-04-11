"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpenText, Compass, Network } from "lucide-react";

const roadmapTabs = [
  {
    href: "/roadmap/overview",
    label: "Overview",
    icon: Compass,
  },
  {
    href: "/roadmap/graph",
    label: "Graph",
    icon: Network,
  },
  {
    href: "/roadmap/study",
    label: "Study",
    icon: BookOpenText,
  },
];

export default function RoadmapPillNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serialized = searchParams.toString();

  return (
    <nav className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-xl items-center justify-between gap-2 rounded-full border border-white/15 bg-black/55 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        {roadmapTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const href = serialized ? `${tab.href}?${serialized}` : tab.href;

          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm transition ${
                isActive
                  ? "border border-white/20 bg-white text-black"
                  : "border border-transparent text-white/72 hover:border-white/20 hover:bg-white/6 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
