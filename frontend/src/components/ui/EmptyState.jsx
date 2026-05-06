import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "No data available",
  description = "Try changing filters and retry.",
  icon: Icon = Inbox,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-10 text-center">
      <span className="rounded-full bg-[hsl(var(--card))] p-3 text-[hsl(var(--muted-foreground))] shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      {action}
    </div>
  );
}
