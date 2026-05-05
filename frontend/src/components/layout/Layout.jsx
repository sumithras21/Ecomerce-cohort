import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const titles = {
  "/": "Executive Summary",
  "/customers": "Customer Insights",
  "/geographic": "Geographic Analysis",
  "/forecast": "Forecasting",
  "/basket": "Market Basket",
  "/cohort": "Cohort Analysis",
};

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={titles[pathname] || "Analytics"} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
