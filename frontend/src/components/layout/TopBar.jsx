import DateRangePicker from "../filters/DateRangePicker";
import useFilterStore from "../../store/filterStore";
import Button from "../ui/Button";
import { Command, Menu, MoonStar, Sun } from "lucide-react";
import Badge from "../ui/Badge";

export default function TopBar({ subtitle, onMenuToggle, onOpenCommand }) {
  const { darkMode, toggleDarkMode } = useFilterStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          variant="outline"
          size="icon"
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Workspace
          </p>
          <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
            {subtitle || "Business intelligence"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <DateRangePicker />
        {onOpenCommand && (
          <Badge
            asButton
            variant="outline"
            onClick={onOpenCommand}
            className="hidden h-9 items-center gap-2 px-3 md:inline-flex"
            aria-label="Open command menu"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="text-xs">Search</span>
            <span className="rounded border border-[hsl(var(--border))] px-1.5 py-px text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
              ⌘K
            </span>
          </Badge>
        )}
        <Button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          variant="outline"
          size="icon"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
