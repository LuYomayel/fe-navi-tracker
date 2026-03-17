export default function NutritionLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
