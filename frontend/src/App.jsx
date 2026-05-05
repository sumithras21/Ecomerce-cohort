import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/layout/Layout";
import ExecutiveSummary from "./pages/ExecutiveSummary";
import CustomerInsights from "./pages/CustomerInsights";
import GeographicAnalysis from "./pages/GeographicAnalysis";
import Forecasting from "./pages/Forecasting";
import MarketBasket from "./pages/MarketBasket";
import CohortAnalysis from "./pages/CohortAnalysis";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<ExecutiveSummary />} />
            <Route path="customers" element={<CustomerInsights />} />
            <Route path="geographic" element={<GeographicAnalysis />} />
            <Route path="forecast" element={<Forecasting />} />
            <Route path="basket" element={<MarketBasket />} />
            <Route path="cohort" element={<CohortAnalysis />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
