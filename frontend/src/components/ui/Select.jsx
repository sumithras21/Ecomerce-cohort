import { cn } from "../../lib/utils";

export default function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
