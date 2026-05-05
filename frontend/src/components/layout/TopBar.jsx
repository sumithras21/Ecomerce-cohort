import DateRangePicker from "../filters/DateRangePicker";
import useFilterStore from "../../store/filterStore";
import Button from "../ui/Button";
import { Menu, MoonStar, Sun } from "lucide-react";

export default function TopBar({ title, onMenuToggle }) {
  const { darkMode, toggleDarkMode } = useFilterStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))/0.9] px-4 backdrop-blur md:px-6">
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
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{title}</p>
          <p className="hidden text-xs text-[hsl(var(--muted-foreground))] sm:block">Business intelligence workspace</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <DateRangePicker />
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
