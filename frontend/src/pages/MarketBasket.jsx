import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { ShoppingBasket } from "lucide-react";
import useFilterStore from "../store/filterStore";
import useChartTheme from "../lib/useChartTheme";
import { fetchBasketSummary } from "../api/client";
import KpiCard from "../components/ui/KpiCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function MarketBasket() {
  const { startDate, endDate } = useFilterStore();
  const theme = useChartTheme();
  const basket = useQuery({
    queryKey: ["basket", startDate, endDate],
    queryFn: () => fetchBasketSummary(startDate, endDate),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Market Basket"
        description="Top products, basket composition, and product co-occurrence pairs."
        icon={ShoppingBasket}
      />

      {basket.isLoading ? (
        <div className="space-y-6">
          <LoadingSkeleton type="kpis" />
          <LoadingSkeleton />
        </div>
      ) : basket.isError ? (
        <ErrorAlert message={basket.error?.message} onRetry={basket.refetch} />
      ) : !basket.data?.top_products?.length ? (
        <EmptyState title="No basket data" description="No orders match the selected date range." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard title="Avg Basket Size" value={`${basket.data.basket_stats.avg_basket_size} items`} color="blue" />
            <KpiCard title="Total Baskets" value={basket.data.basket_stats.total_baskets.toLocaleString()} color="green" />
            <KpiCard title="Multi-Product Orders" value={`${basket.data.basket_stats.multi_product_pct}%`} color="purple" />
            <KpiCard title="Single-Product Orders" value={`${basket.data.basket_stats.single_product_pct}%`} color="orange" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={[...basket.data.top_products].reverse()}
                    margin={{ top: 5, right: 20, bottom: 5, left: 160 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: theme.axis }} stroke={theme.axis} />
                    <YAxis type="category" dataKey="description" tick={{ fontSize: 9, fill: theme.axis }} width={155} stroke={theme.axis} />
                    <Tooltip formatter={(v, name) => name === "revenue" ? fmt(v) : v.toLocaleString()} {...theme.tooltip} />
                    <Bar dataKey="frequency" name="Orders" fill={theme.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Single vs Multi-Product Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Single Product", value: basket.data.basket_stats.single_product_pct },
                        { name: "Multi Product", value: basket.data.basket_stats.multi_product_pct },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={110}
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      <Cell fill={theme.primary} />
                      <Cell fill={theme.success} />
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} {...theme.tooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {basket.data.product_pairs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Product Pairs (Co-occurrence)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    layout="vertical"
                    data={[...basket.data.product_pairs].reverse()}
                    margin={{ top: 5, right: 20, bottom: 5, left: 240 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: theme.axis }} stroke={theme.axis} />
                    <YAxis
                      type="category"
                      dataKey={(d) => `${d.product_a.slice(0, 20)} + ${d.product_b.slice(0, 20)}`}
                      tick={{ fontSize: 9, fill: theme.axis }}
                      width={235}
                      stroke={theme.axis}
                    />
                    <Tooltip formatter={(v) => v.toLocaleString()} {...theme.tooltip} />
                    <Bar dataKey="cooccurrence" name="Co-occurrence" fill={theme.purple} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
