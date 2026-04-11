"use client";

import dynamic from "next/dynamic";
import { useFxMode } from "@/hooks/useFxMode";

const AntigravityBackground3D = dynamic(() => import("./AntigravityBackground3D"), {
  ssr: false,
});

export default function AntigravityBackground() {
  const mode = useFxMode();

  if (mode !== "3d") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(133,185,255,0.14),transparent_50%),radial-gradient(circle_at_70%_35%,rgba(87,228,255,0.1),transparent_52%),radial-gradient(circle_at_45%_75%,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>
    );
  }

  return <AntigravityBackground3D />;
}
