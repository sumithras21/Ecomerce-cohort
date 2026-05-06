import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { LayoutDashboard } from "lucide-react";
import useFilterStore from "../store/filterStore";
import { fetchKpis, fetchMonthlySales, fetchTopProducts } from "../api/client";
import KpiCard from "../components/ui/KpiCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import useChartTheme from "../lib/useChartTheme";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n);

export default function ExecutiveSummary() {
  const { startDate, endDate } = useFilterStore();
  const theme = useChartTheme();

  const kpis = useQuery({ queryKey: ["kpis", startDate, endDate], queryFn: () => fetchKpis(startDate, endDate) });
  const monthly = useQuery({ queryKey: ["monthly-sales", startDate, endDate], queryFn: () => fetchMonthlySales(startDate, endDate) });
  const products = useQuery({ queryKey: ["top-products", startDate, endDate], queryFn: () => fetchTopProducts(startDate, endDate) });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Summary"
        description="Snapshot of revenue, orders, customers and best-selling products."
        icon={LayoutDashboard}
      />

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

      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.isLoading ? (
            <LoadingSkeleton />
          ) : monthly.isError ? (
            <ErrorAlert message={monthly.error?.message} onRetry={monthly.refetch} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly.data.data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis dataKey="year_month" tick={{ fontSize: 11, fill: theme.axis }} stroke={theme.axis} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: theme.axis }} stroke={theme.axis} />
                <Tooltip formatter={(v) => fmt(v)} {...theme.tooltip} />
                <Line type="monotone" dataKey="revenue" stroke={theme.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {products.isLoading ? (
            <LoadingSkeleton height={300} />
          ) : products.isError ? (
            <ErrorAlert message={products.error?.message} onRetry={products.refetch} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={[...products.data.data].reverse()}
                margin={{ top: 5, right: 20, bottom: 5, left: 160 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: theme.axis }} stroke={theme.axis} />
                <YAxis type="category" dataKey="description" tick={{ fontSize: 10, fill: theme.axis }} width={155} stroke={theme.axis} />
                <Tooltip formatter={(v) => fmt(v)} {...theme.tooltip} />
                <Bar dataKey="revenue" fill={theme.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
