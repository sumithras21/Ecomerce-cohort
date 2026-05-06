import { lazy } from "react";

const ExecutiveSummary = lazy(() => import("../pages/ExecutiveSummary"));
const CustomerInsights = lazy(() => import("../pages/CustomerInsights"));
const GeographicAnalysis = lazy(() => import("../pages/GeographicAnalysis"));
const Forecasting = lazy(() => import("../pages/Forecasting"));
const MarketBasket = lazy(() => import("../pages/MarketBasket"));
const CohortAnalysis = lazy(() => import("../pages/CohortAnalysis"));
const ChatbotArea = lazy(() => import("../pages/ChatbotArea"));

export const appRoutes = [
  {
    path: "/",
    label: "Executive Summary",
    shortLabel: "Summary",
    description: "Snapshot of revenue, orders, customers and best-selling products.",
    icon: "chart",
    element: ExecutiveSummary,
  },
  {
    path: "/customers",
    label: "Customer Insights",
    shortLabel: "Customers",
    description: "RFM segmentation and behavioral clusters.",
    icon: "users",
    element: CustomerInsights,
  },
  {
    path: "/geographic",
    label: "Geographic Analysis",
    shortLabel: "Geographic",
    description: "Revenue distribution and top-performing countries.",
    icon: "globe",
    element: GeographicAnalysis,
  },
  {
    path: "/forecast",
    label: "Forecasting",
    shortLabel: "Forecast",
    description: "Holt-Winters time-series forecast with selectable horizons.",
    icon: "trend",
    element: Forecasting,
  },
  {
    path: "/basket",
    label: "Market Basket",
    shortLabel: "Basket",
    description: "Top products, basket composition, and co-occurrence pairs.",
    icon: "basket",
    element: MarketBasket,
  },
  {
    path: "/cohort",
    label: "Cohort Analysis",
    shortLabel: "Cohort",
    description: "Customer retention heatmap by month of acquisition.",
    icon: "cohort",
    element: CohortAnalysis,
  },
  {
    path: "/chat",
    label: "AI Chat Assistant",
    shortLabel: "Chat",
    description: "Ask natural-language questions about your dataset.",
    icon: "chat",
    element: ChatbotArea,
  },
];

export const routeByPath = Object.fromEntries(appRoutes.map((route) => [route.path, route]));
export const routeTitleByPath = Object.fromEntries(appRoutes.map((route) => [route.path, route.label]));
