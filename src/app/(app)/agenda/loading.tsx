export default function AgendaLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-36 bg-muted animate-pulse rounded" />
      <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
