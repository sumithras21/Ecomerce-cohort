import ExecutiveSummary from "../pages/ExecutiveSummary";
import CustomerInsights from "../pages/CustomerInsights";
import GeographicAnalysis from "../pages/GeographicAnalysis";
import Forecasting from "../pages/Forecasting";
import MarketBasket from "../pages/MarketBasket";
import CohortAnalysis from "../pages/CohortAnalysis";
import ChatbotArea from "../pages/ChatbotArea";

export const appRoutes = [
  { path: "/", label: "Executive Summary", shortLabel: "Summary", icon: "chart", element: ExecutiveSummary },
  { path: "/customers", label: "Customer Insights", shortLabel: "Customers", icon: "users", element: CustomerInsights },
  { path: "/geographic", label: "Geographic Analysis", shortLabel: "Geographic", icon: "globe", element: GeographicAnalysis },
  { path: "/forecast", label: "Forecasting", shortLabel: "Forecast", icon: "trend", element: Forecasting },
  { path: "/basket", label: "Market Basket", shortLabel: "Basket", icon: "basket", element: MarketBasket },
  { path: "/cohort", label: "Cohort Analysis", shortLabel: "Cohort", icon: "cohort", element: CohortAnalysis },
  { path: "/chat", label: "AI Chat Assistant", shortLabel: "Chat", icon: "chat", element: ChatbotArea },
];

export const routeTitleByPath = Object.fromEntries(appRoutes.map((route) => [route.path, route.label]));
