import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";
import useFilterStore from "../store/filterStore";
import { fetchRfmSegments, fetchSegmentStats } from "../api/client";
import DataTable from "../components/ui/DataTable";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import useChartTheme from "../lib/useChartTheme";

const SEGMENT_COLORS = {
  Champions: "#3b82f6",
  Loyal: "#10b981",
  Potential: "#f59e0b",
  "Needs Attention": "#ef4444",
};

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const TABLE_COLS = [
  { key: "segment", label: "Segment" },
  { key: "customer_count", label: "Customers", format: (v) => v.toLocaleString() },
  { key: "avg_recency", label: "Avg Recency (days)" },
  { key: "avg_frequency", label: "Avg Frequency" },
  { key: "avg_monetary", label: "Avg Monetary", format: fmt },
  { key: "total_monetary", label: "Total Revenue", format: fmt },
];

export default function CustomerInsights() {
  const { startDate, endDate } = useFilterStore();
  const theme = useChartTheme();
  const [activeSegments, setActiveSegments] = useState(new Set(Object.keys(SEGMENT_COLORS)));

  const rfm = useQuery({ queryKey: ["rfm-segments", startDate, endDate], queryFn: () => fetchRfmSegments(startDate, endDate) });
  const stats = useQuery({ queryKey: ["segment-stats", startDate, endDate], queryFn: () => fetchSegmentStats(startDate, endDate) });

  const toggleSegment = (seg) => {
    setActiveSegments((prev) => {
      const next = new Set(prev);
      if (next.has(seg)) { if (next.size > 1) next.delete(seg); }
      else next.add(seg);
      return next;
    });
  };

  const filteredScatter = rfm.data?.scatter_data.filter((d) => activeSegments.has(d.segment)) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Insights"
        description="RFM segmentation, behavioral clusters, and per-segment revenue stats."
        icon={Users}
      />

      <div className="flex flex-wrap gap-2">
        {Object.entries(SEGMENT_COLORS).map(([seg, color]) => {
          const active = activeSegments.has(seg);
          return (
            <Badge
              key={seg}
              asButton
              onClick={() => toggleSegment(seg)}
              className="cursor-pointer border"
              style={{
                borderColor: color,
                color: active ? "white" : color,
                background: active ? color : "transparent",
              }}
              aria-pressed={active}
            >
              {seg}
            </Badge>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            {rfm.isLoading ? (
              <LoadingSkeleton />
            ) : rfm.isError ? (
              <ErrorAlert message={rfm.error?.message} onRetry={rfm.refetch} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={rfm.data.segment_counts.filter((d) => activeSegments.has(d.segment))}
                    dataKey="count"
                    nameKey="segment"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {rfm.data.segment_counts.map((entry) => (
                      <Cell key={entry.segment} fill={SEGMENT_COLORS[entry.segment] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} {...theme.tooltip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RFM Scatter (Recency vs Monetary)</CardTitle>
          </CardHeader>
          <CardContent>
            {rfm.isLoading ? (
              <LoadingSkeleton />
            ) : rfm.isError ? null : (
              <ResponsiveContainer width="100%" height={240}>
                <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                  <XAxis dataKey="recency" name="Recency" unit="d" tick={{ fontSize: 10, fill: theme.axis }} stroke={theme.axis} />
                  <YAxis dataKey="monetary" name="Monetary" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: theme.axis }} stroke={theme.axis} />
                  <ZAxis dataKey="frequency" range={[20, 200]} name="Frequency" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 text-xs shadow">
                          <p className="font-medium">{d.segment}</p>
                          <p>Recency: {d.recency}d</p>
                          <p>Frequency: {d.frequency}</p>
                          <p>Monetary: {fmt(d.monetary)}</p>
                        </div>
                      );
                    }}
                  />
                  {Object.entries(SEGMENT_COLORS).map(([seg, color]) =>
                    activeSegments.has(seg) && (
                      <Scatter
                        key={seg}
                        name={seg}
                        data={filteredScatter.filter((d) => d.segment === seg)}
                        fill={color}
                        fillOpacity={0.7}
                      />
                    )
                  )}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.isLoading ? (
            <LoadingSkeleton type="table" />
          ) : stats.isError ? (
            <ErrorAlert message={stats.error?.message} onRetry={stats.refetch} />
          ) : (
            <DataTable columns={TABLE_COLS} rows={stats.data.data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
