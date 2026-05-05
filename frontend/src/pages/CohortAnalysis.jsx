import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useFilterStore from "../store/filterStore";
import { fetchCohortRetention } from "../api/client";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";
import clsx from "clsx";

function retentionColor(value) {
  if (value === null || value === undefined) return "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600";
  if (value >= 0.8) return "bg-green-600 text-white";
  if (value >= 0.6) return "bg-green-400 text-white";
  if (value >= 0.4) return "bg-yellow-300 text-gray-800";
  if (value >= 0.2) return "bg-orange-300 text-gray-800";
  if (value > 0) return "bg-red-300 text-gray-800";
  return "bg-gray-100 dark:bg-gray-800 text-gray-400";
}

export default function CohortAnalysis() {
  const { startDate, endDate } = useFilterStore();
  const cohort = useQuery({
    queryKey: ["cohort", startDate, endDate],
    queryFn: () => fetchCohortRetention(startDate, endDate),
  });

  if (cohort.isLoading) return <div className="space-y-6"><LoadingSkeleton /><LoadingSkeleton /></div>;
  if (cohort.isError) return <ErrorAlert message={cohort.error?.message} onRetry={cohort.refetch} />;

  const { cohort_matrix, cohort_sizes, max_periods } = cohort.data;
  const periods = Array.from({ length: Math.min(max_periods + 1, 13) }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Retention heatmap */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Customer Retention Heatmap (%)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1.5 text-left text-gray-500 dark:text-gray-400">Cohort</th>
                {periods.map((p) => (
                  <th key={p} className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400">M+{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohort_matrix.map(({ cohort, data }) => (
                <tr key={cohort}>
                  <td className="px-2 py-1 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{cohort}</td>
                  {periods.map((p) => {
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
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>Retention:</span>
          {[["bg-red-300", "0-20%"], ["bg-orange-300", "20-40%"], ["bg-yellow-300", "40-60%"], ["bg-green-400", "60-80%"], ["bg-green-600", "80%+"]].map(([cls, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`inline-block h-3 w-5 rounded ${cls}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Cohort sizes */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">New Customers per Cohort</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={cohort_sizes} margin={{ top: 5, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="cohort" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Bar dataKey="initial_customers" name="New Customers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
