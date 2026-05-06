import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import Layout from "./components/layout/Layout";
import { appRoutes } from "./config/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const msg = error?.message || "Request failed";
      toast.error(`${query.queryKey?.[0] || "Query"} failed`, { description: msg });
    },
  }),
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {appRoutes.map((route) => (
              <Route
                key={route.path}
                index={route.path === "/"}
                path={route.path === "/" ? undefined : route.path.replace("/", "")}
                element={<route.element />}
              />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
}
