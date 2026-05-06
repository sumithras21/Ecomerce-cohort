import { cn } from "../../lib/utils";

const variants = {
  default: "bg-blue-600/10 text-blue-700 dark:text-blue-300",
  outline: "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
  muted: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "bg-red-500/10 text-red-700 dark:text-red-300",
  solid: "bg-blue-600 text-white",
};

export default function Badge({ className, variant = "default", asButton = false, ...props }) {
  const Comp = asButton ? "button" : "span";
  return (
    <Comp
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant] || variants.default,
        asButton && "cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
      {...props}
    />
  );
}
