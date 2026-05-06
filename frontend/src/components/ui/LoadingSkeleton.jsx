import Skeleton, { ChartSkeleton, KpiSkeleton } from "./Skeleton";

export default function LoadingSkeleton({ type = "chart", height = 260 }) {
  if (type === "kpis") return <KpiSkeleton />;
  if (type === "table") {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  return <ChartSkeleton height={height} />;
}
