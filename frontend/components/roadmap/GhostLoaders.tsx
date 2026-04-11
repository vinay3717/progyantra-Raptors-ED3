"use client";

type GhostLoadersProps = {
  lines?: number;
  className?: string;
};

export default function GhostLoaders({ lines = 4, className }: GhostLoadersProps) {
  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`ghost-${index}`}
          className="ghost-loader h-24 rounded-3xl border border-white/10"
        />
      ))}
    </div>
  );
}
