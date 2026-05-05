import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import useFilterStore from "../store/filterStore";
import { fetchRfmSegments, fetchSegmentStats } from "../api/client";
import DataTable from "../components/ui/DataTable";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";

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
      {/* Segment filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SEGMENT_COLORS).map(([seg, color]) => (
          <button
            key={seg}
            onClick={() => toggleSegment(seg)}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity"
            style={{
              borderColor: color,
              color: activeSegments.has(seg) ? "white" : color,
              background: activeSegments.has(seg) ? color : "transparent",
            }}
          >
            {seg}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Segment Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Customer Segments</h2>
          {rfm.isLoading ? <LoadingSkeleton /> : rfm.isError ? (
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
                <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RFM Scatter */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">RFM Scatter (Recency vs Monetary)</h2>
          {rfm.isLoading ? <LoadingSkeleton /> : rfm.isError ? null : (
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="recency" name="Recency" unit="d" tick={{ fontSize: 10 }} />
                <YAxis dataKey="monetary" name="Monetary" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <ZAxis dataKey="frequency" range={[20, 200]} name="Frequency" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded bg-white p-2 text-xs shadow dark:bg-gray-800">
                      <p className="font-medium">{d.segment}</p>
                      <p>Recency: {d.recency}d</p>
                      <p>Frequency: {d.frequency}</p>
                      <p>Monetary: {fmt(d.monetary)}</p>
                    </div>
                  );
                }} />
                {Object.entries(SEGMENT_COLORS).map(([seg, color]) => (
                  activeSegments.has(seg) && (
                    <Scatter
                      key={seg}
                      name={seg}
                      data={filteredScatter.filter((d) => d.segment === seg)}
                      fill={color}
                      fillOpacity={0.7}
                    />
                  )
                ))}
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Segment Stats Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Segment Statistics</h2>
        {stats.isLoading ? <LoadingSkeleton /> : stats.isError ? (
          <ErrorAlert message={stats.error?.message} onRetry={stats.refetch} />
        ) : (
          <DataTable columns={TABLE_COLS} rows={stats.data.data} />
        )}
      </div>
    </div>
  );
}
