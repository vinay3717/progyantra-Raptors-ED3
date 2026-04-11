export default function RoadmapLoading() {
  return (
    <div className="space-y-4 pt-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`roadmap-loading-${index}`}
          className="ghost-loader h-24 rounded-3xl border border-white/10"
        />
      ))}
    </div>
  );
}
