import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { appRoutes } from "../../config/routes";
import {
  BarChart3,
  Users,
  Globe,
  TrendingUp,
  ShoppingBasket,
  Boxes,
  BotMessageSquare,
  Sparkles,
  X,
} from "lucide-react";
import Button from "../ui/Button";

function Icon({ name }) {
  const cls = "h-4 w-4";
  if (name === "users") return <Users className={cls} />;
  if (name === "globe") return <Globe className={cls} />;
  if (name === "trend") return <TrendingUp className={cls} />;
  if (name === "basket") return <ShoppingBasket className={cls} />;
  if (name === "cohort") return <Boxes className={cls} />;
  if (name === "chat") return <BotMessageSquare className={cls} />;
  return <BarChart3 className={cls} />;
}

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-30 flex w-72 -translate-x-full flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-transform lg:static lg:z-auto lg:w-72 lg:translate-x-0",
        open && "translate-x-0"
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Dashboard</p>
            <p className="text-sm font-semibold">Commerce AI</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="lg:hidden" onClick={onClose} aria-label="Close navigation">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {appRoutes.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              )
            }
          >
            <span aria-hidden="true"><Icon name={icon} /></span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
