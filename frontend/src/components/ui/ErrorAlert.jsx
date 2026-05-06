import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./Button";

export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
      <span className="rounded-full bg-red-500/10 p-3 text-red-600 dark:text-red-400">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          {message || "Failed to load data."}
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Please try again or adjust your filters.
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
