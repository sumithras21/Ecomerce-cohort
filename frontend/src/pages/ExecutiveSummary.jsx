import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import useFilterStore from "../store/filterStore";
import { fetchKpis, fetchMonthlySales, fetchTopProducts } from "../api/client";
import KpiCard from "../components/ui/KpiCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n);

export default function ExecutiveSummary() {
  const { startDate, endDate } = useFilterStore();

  const kpis = useQuery({ queryKey: ["kpis", startDate, endDate], queryFn: () => fetchKpis(startDate, endDate) });
  const monthly = useQuery({ queryKey: ["monthly-sales", startDate, endDate], queryFn: () => fetchMonthlySales(startDate, endDate) });
  const products = useQuery({ queryKey: ["top-products", startDate, endDate], queryFn: () => fetchTopProducts(startDate, endDate) });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {kpis.isLoading ? (
        <LoadingSkeleton type="kpis" />
      ) : kpis.isError ? (
        <ErrorAlert message={kpis.error?.message} onRetry={kpis.refetch} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard title="Total Revenue" value={fmt(kpis.data.total_revenue)} color="blue" />
          <KpiCard title="Total Orders" value={fmtNum(kpis.data.total_orders)} color="green" />
          <KpiCard title="Unique Customers" value={fmtNum(kpis.data.unique_customers)} color="purple" />
          <KpiCard title="Avg Order Value" value={fmt(kpis.data.avg_order_value)} color="orange" />
        </div>
      )}

      {/* Monthly Sales Trend */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Monthly Sales Trend</h2>
        {monthly.isLoading ? <LoadingSkeleton /> : monthly.isError ? (
          <ErrorAlert message={monthly.error?.message} onRetry={monthly.refetch} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly.data.data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year_month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Top 10 Products by Revenue</h2>
        {products.isLoading ? <LoadingSkeleton /> : products.isError ? (
          <ErrorAlert message={products.error?.message} onRetry={products.refetch} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={[...products.data.data].reverse()}
              margin={{ top: 5, right: 20, bottom: 5, left: 160 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="description" tick={{ fontSize: 10 }} width={155} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
