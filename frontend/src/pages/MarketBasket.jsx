import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import useFilterStore from "../store/filterStore";
import { fetchBasketSummary } from "../api/client";
import KpiCard from "../components/ui/KpiCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function MarketBasket() {
  const { startDate, endDate } = useFilterStore();
  const basket = useQuery({
    queryKey: ["basket", startDate, endDate],
    queryFn: () => fetchBasketSummary(startDate, endDate),
  });

  if (basket.isLoading) return <div className="space-y-6"><LoadingSkeleton /><LoadingSkeleton /></div>;
  if (basket.isError) return <ErrorAlert message={basket.error?.message} onRetry={basket.refetch} />;

  const { top_products, product_pairs, basket_stats } = basket.data;
  const pieData = [
    { name: "Single Product", value: basket_stats.single_product_pct },
    { name: "Multi Product", value: basket_stats.multi_product_pct },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Avg Basket Size" value={`${basket_stats.avg_basket_size} items`} color="blue" />
        <KpiCard title="Total Baskets" value={basket_stats.total_baskets.toLocaleString()} color="green" />
        <KpiCard title="Multi-Product Orders" value={`${basket_stats.multi_product_pct}%`} color="purple" />
        <KpiCard title="Single-Product Orders" value={`${basket_stats.single_product_pct}%`} color="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Top Products by Frequency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={[...top_products].reverse()}
              margin={{ top: 5, right: 20, bottom: 5, left: 160 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="description" tick={{ fontSize: 9 }} width={155} />
              <Tooltip formatter={(v, name) => name === "revenue" ? fmt(v) : v.toLocaleString()} />
              <Bar dataKey="frequency" name="Orders" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Basket composition pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Single vs Multi-Product Orders</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110}
                label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                <Cell fill="#3b82f6" />
                <Cell fill="#10b981" />
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Pairs */}
      {product_pairs.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Top Product Pairs (Co-occurrence)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              layout="vertical"
              data={[...product_pairs].reverse()}
              margin={{ top: 5, right: 20, bottom: 5, left: 240 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey={(d) => `${d.product_a.slice(0, 20)} + ${d.product_b.slice(0, 20)}`}
                tick={{ fontSize: 9 }} width={235} />
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Bar dataKey="cooccurrence" name="Co-occurrence" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
