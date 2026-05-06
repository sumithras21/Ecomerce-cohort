import { cn } from "../../lib/utils";

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[hsl(var(--muted))]", className)}
      {...props}
    />
  );
}

export function KpiSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }) {
  return <Skeleton style={{ height }} className="w-full" />;
}
