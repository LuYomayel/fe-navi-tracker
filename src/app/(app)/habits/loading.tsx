export default function HabitsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
