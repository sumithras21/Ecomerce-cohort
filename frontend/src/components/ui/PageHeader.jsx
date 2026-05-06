import { cn } from "../../lib/utils";

export default function PageHeader({ title, description, icon: Icon, actions, className }) {
  return (
    <div className={cn("flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:text-blue-400">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
