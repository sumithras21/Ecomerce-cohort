import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import useFilterStore from "../store/filterStore";
import { fetchForecast, forecastCsvUrl } from "../api/client";
import KpiCard from "../components/ui/KpiCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const PERIOD_OPTIONS = [7, 14, 30, 60, 90];

export default function Forecasting() {
  const { startDate, endDate } = useFilterStore();
  const [periods, setPeriods] = useState(30);

  const forecast = useQuery({
    queryKey: ["forecast", startDate, endDate, periods],
    queryFn: () => fetchForecast(startDate, endDate, periods),
    staleTime: Infinity,
  });

  const chartData = [
    ...(forecast.data?.historical.slice(-90).map((d) => ({
      date: d.date,
      revenue: d.revenue,
      forecast: null,
    })) ?? []),
    ...(forecast.data?.forecast.map((d) => ({
      date: d.date,
      revenue: null,
      forecast: d.forecast_revenue,
    })) ?? []),
  ];

  const splitDate = forecast.data?.historical.at(-1)?.date;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Forecast periods:</span>
        {PERIOD_OPTIONS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriods(p)}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              periods === p
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {p}d
          </button>
        ))}
        {forecast.data && (
          <a
            href={forecastCsvUrl(startDate, endDate, periods)}
            download="forecast.csv"
            className="ml-auto rounded-lg border border-green-500 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            Export CSV
          </a>
        )}
      </div>

      {/* KPI */}
      {forecast.data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            title={`Expected ${periods}-Day Revenue`}
            value={fmt(forecast.data.summary.expected_30_day_total)}
            subtitle={forecast.data.summary.model}
            color="blue"
          />
          <KpiCard
            title="Seasonal Periods"
            value={`${forecast.data.summary.seasonal_periods} days`}
            subtitle="Weekly seasonality"
            color="purple"
          />
          <KpiCard
            title="Forecast Horizon"
            value={`${forecast.data.summary.periods} days`}
            subtitle={`from ${splitDate ?? "..."}`}
            color="green"
          />
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Historical Sales + {periods}-Day Forecast
        </h2>
        {forecast.isLoading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <LoadingSkeleton />
            <p className="text-xs text-gray-400">Fitting Holt-Winters model, this may take a moment…</p>
          </div>
        ) : forecast.isError ? (
          <ErrorAlert message={forecast.error?.message} onRetry={forecast.refetch} />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 10)} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => (v !== null ? fmt(v) : null)} />
              <Legend />
              {splitDate && <ReferenceLine x={splitDate} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: "Today", fontSize: 10 }} />}
              <Line type="monotone" dataKey="revenue" name="Historical" stroke="#3b82f6" strokeWidth={1.5} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
