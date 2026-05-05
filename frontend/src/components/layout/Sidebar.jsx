import { NavLink } from "react-router-dom";
import clsx from "clsx";

const links = [
  { to: "/", label: "Executive Summary", icon: "📊" },
  { to: "/customers", label: "Customer Insights", icon: "👥" },
  { to: "/geographic", label: "Geographic", icon: "🌍" },
  { to: "/forecast", label: "Forecasting", icon: "📈" },
  { to: "/basket", label: "Market Basket", icon: "🛒" },
  { to: "/cohort", label: "Cohort Analysis", icon: "🔄" },
];

export default function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-700">
        <span className="text-sm font-bold text-gray-800 dark:text-white">Ecommerce Analytics</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              )
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
