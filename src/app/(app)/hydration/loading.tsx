export default function HydrationLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      <div className="h-48 bg-muted animate-pulse rounded-xl" />
      <div className="h-64 bg-muted animate-pulse rounded-xl" />
    </div>
  );
}
