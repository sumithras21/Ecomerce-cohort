import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp } from "lucide-react";
import useFilterStore from "../store/filterStore";
import useChartTheme from "../lib/useChartTheme";
import { fetchForecast, forecastCsvUrl } from "../api/client";
import KpiCard from "../components/ui/KpiCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const PERIOD_OPTIONS = [7, 14, 30, 60, 90];

export default function Forecasting() {
  const { startDate, endDate } = useFilterStore();
  const theme = useChartTheme();
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

  const exportButton = forecast.data ? (
    <a href={forecastCsvUrl(startDate, endDate, periods)} download="forecast.csv">
      <Button variant="outline" size="sm">
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </Button>
    </a>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecasting"
        description="Holt-Winters time-series forecast with selectable horizons."
        icon={TrendingUp}
        actions={exportButton}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Forecast horizon</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PERIOD_OPTIONS.map((p) => (
              <Button
                key={p}
                onClick={() => setPeriods(p)}
                size="sm"
                variant={periods === p ? "default" : "outline"}
                className="h-8 px-3"
              >
                {p}d
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Historical Sales + {periods}-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {forecast.isLoading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <LoadingSkeleton />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Fitting Holt-Winters model, this may take a moment…
              </p>
            </div>
          ) : forecast.isError ? (
            <ErrorAlert message={forecast.error?.message} onRetry={forecast.refetch} />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: theme.axis }}
                  stroke={theme.axis}
                  interval={Math.floor(chartData.length / 10)}
                />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: theme.axis }} stroke={theme.axis} />
                <Tooltip formatter={(v) => (v !== null ? fmt(v) : null)} {...theme.tooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {splitDate && <ReferenceLine x={splitDate} stroke={theme.axis} strokeDasharray="4 2" label={{ value: "Today", fontSize: 10, fill: theme.axis }} />}
                <Line type="monotone" dataKey="revenue" name="Historical" stroke={theme.primary} strokeWidth={1.5} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" name="Forecast" stroke={theme.warning} strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
