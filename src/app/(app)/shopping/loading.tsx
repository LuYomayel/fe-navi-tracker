export default function ShoppingLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-44 bg-muted animate-pulse rounded" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
