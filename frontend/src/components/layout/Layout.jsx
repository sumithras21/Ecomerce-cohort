import { Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ErrorBoundary from "../ui/ErrorBoundary";
import CommandPalette from "../ui/CommandPalette";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import { routeByPath } from "../../config/routes";
import useFilterStore from "../../store/filterStore";

export default function Layout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const darkMode = useFilterStore((s) => s.darkMode);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const route = routeByPath[pathname];

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          subtitle={route?.label || "Analytics"}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onOpenCommand={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toaster
        position="top-right"
        theme={darkMode ? "dark" : "light"}
        toastOptions={{ className: "rounded-xl" }}
      />
    </div>
  );
}
