import { useEffect } from "react";
import { Command } from "cmdk";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  BotMessageSquare,
  Globe,
  Moon,
  Search,
  ShoppingBasket,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import { appRoutes } from "../../config/routes";
import useFilterStore from "../../store/filterStore";

const ICONS = {
  chart: BarChart3,
  users: Users,
  globe: Globe,
  trend: TrendingUp,
  basket: ShoppingBasket,
  cohort: Boxes,
  chat: BotMessageSquare,
};

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useFilterStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (path) => {
    if (path !== location.pathname) navigate(path);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global command menu" className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-3">
            <Search className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Command.Input
              autoFocus
              placeholder="Search pages, actions..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]"
            />
            <kbd className="rounded border border-[hsl(var(--border))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No results.
            </Command.Empty>
            <Command.Group heading="Pages" className="text-xs text-[hsl(var(--muted-foreground))]">
              {appRoutes.map((r) => {
                const Icon = ICONS[r.icon] || BarChart3;
                return (
                  <Command.Item
                    key={r.path}
                    value={`${r.label} ${r.shortLabel}`}
                    onSelect={() => go(r.path)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-[hsl(var(--foreground))] aria-selected:bg-[hsl(var(--muted))]"
                  >
                    <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span>{r.label}</span>
                    <span className="ml-auto truncate text-xs text-[hsl(var(--muted-foreground))]">
                      {r.path}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
            <Command.Group heading="Actions" className="text-xs text-[hsl(var(--muted-foreground))]">
              <Command.Item
                value="toggle theme dark light"
                onSelect={() => {
                  toggleDarkMode();
                  onClose?.();
                }}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-[hsl(var(--foreground))] aria-selected:bg-[hsl(var(--muted))]"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Toggle {darkMode ? "light" : "dark"} mode
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
