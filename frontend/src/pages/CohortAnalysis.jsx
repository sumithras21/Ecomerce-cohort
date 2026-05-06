import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Boxes } from "lucide-react";
import clsx from "clsx";
import useFilterStore from "../store/filterStore";
import useChartTheme from "../lib/useChartTheme";
import { fetchCohortRetention } from "../api/client";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

function retentionColor(value) {
  if (value === null || value === undefined)
    return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
  if (value >= 0.8) return "bg-emerald-600 text-white";
  if (value >= 0.6) return "bg-emerald-400 text-white";
  if (value >= 0.4) return "bg-amber-300 text-gray-800";
  if (value >= 0.2) return "bg-orange-300 text-gray-800";
  if (value > 0) return "bg-red-300 text-gray-800";
  return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
}

const LEGEND = [
  ["bg-red-300", "0-20%"],
  ["bg-orange-300", "20-40%"],
  ["bg-amber-300", "40-60%"],
  ["bg-emerald-400", "60-80%"],
  ["bg-emerald-600", "80%+"],
];

export default function CohortAnalysis() {
  const { startDate, endDate } = useFilterStore();
  const theme = useChartTheme();
  const cohort = useQuery({
    queryKey: ["cohort", startDate, endDate],
    queryFn: () => fetchCohortRetention(startDate, endDate),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Analysis"
        description="Customer retention heatmap and cohort sizes by month of acquisition."
        icon={Boxes}
      />

      {cohort.isLoading ? (
        <div className="space-y-6">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : cohort.isError ? (
        <ErrorAlert message={cohort.error?.message} onRetry={cohort.refetch} />
      ) : !cohort.data?.cohort_matrix?.length ? (
        <EmptyState title="No cohort data" description="Not enough customer history for the selected period." />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Customer Retention Heatmap (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1.5 text-left text-[hsl(var(--muted-foreground))]">Cohort</th>
                      {Array.from({ length: Math.min(cohort.data.max_periods + 1, 13) }, (_, i) => i).map((p) => (
                        <th key={p} className="px-2 py-1.5 text-center text-[hsl(var(--muted-foreground))]">M+{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohort.data.cohort_matrix.map(({ cohort: c, data }) => (
                      <tr key={c}>
                        <td className="px-2 py-1 font-medium text-[hsl(var(--foreground))] whitespace-nowrap">{c}</td>
                        {Array.from({ length: Math.min(cohort.data.max_periods + 1, 13) }, (_, i) => i).map((p) => {
                          const val = data[`period_${p}`];
                          return (
                            <td
                              key={p}
                              className={clsx("px-2 py-1 text-center rounded", retentionColor(val))}
                              title={val !== null && val !== undefined ? `${(val * 100).toFixed(1)}%` : "N/A"}
                            >
                              {val !== null && val !== undefined ? `${(val * 100).toFixed(0)}%` : ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Retention:</span>
                {LEGEND.map(([cls, label]) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className={clsx("inline-block h-3 w-5 rounded", cls)} />
                    {label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Customers per Cohort</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cohort.data.cohort_sizes} margin={{ top: 5, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                  <XAxis dataKey="cohort" tick={{ fontSize: 10, fill: theme.axis }} stroke={theme.axis} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: theme.axis }} stroke={theme.axis} />
                  <Tooltip formatter={(v) => v.toLocaleString()} {...theme.tooltip} />
                  <Bar dataKey="initial_customers" name="New Customers" fill={theme.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
