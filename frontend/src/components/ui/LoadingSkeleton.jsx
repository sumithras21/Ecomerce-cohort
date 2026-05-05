export default function LoadingSkeleton({ type = "chart" }) {
  if (type === "kpis") {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }
  return (
    <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
  );
}
