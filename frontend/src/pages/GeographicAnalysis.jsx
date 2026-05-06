import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Globe } from "lucide-react";
import useFilterStore from "../store/filterStore";
import useChartTheme from "../lib/useChartTheme";
import { fetchGeoMap, fetchTopCountries } from "../api/client";
import DataTable from "../components/ui/DataTable";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const TABLE_COLS = [
  { key: "country", label: "Country" },
  { key: "revenue", label: "Revenue", format: fmt },
  { key: "orders", label: "Orders", format: (v) => v.toLocaleString() },
  { key: "unique_customers", label: "Customers", format: (v) => v.toLocaleString() },
  { key: "avg_order_value", label: "AOV", format: fmt },
];

export default function GeographicAnalysis() {
  const { startDate, endDate } = useFilterStore();
  const { darkMode } = useChartTheme();
  const [tooltipContent, setTooltipContent] = useState("");

  const geoMap = useQuery({ queryKey: ["geo-map", startDate, endDate], queryFn: () => fetchGeoMap(startDate, endDate) });
  const topCountries = useQuery({ queryKey: ["top-countries", startDate, endDate], queryFn: () => fetchTopCountries(startDate, endDate) });

  const revenueByCountry = Object.fromEntries(
    (geoMap.data?.data ?? []).map((d) => [d.country, d.revenue])
  );
  const maxRevenue = Math.max(...Object.values(revenueByCountry), 1);
  const colorScale = scaleLinear()
    .domain([0, maxRevenue])
    .range(darkMode ? ["#1e3a8a", "#60a5fa"] : ["#dbeafe", "#1d4ed8"]);

  const emptyFill = darkMode ? "#1f2937" : "#f1f5f9";
  const stroke = darkMode ? "#374151" : "#cbd5e1";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geographic Analysis"
        description="Revenue distribution and top-performing countries across the world."
        icon={Globe}
      />

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Country</CardTitle>
          {tooltipContent && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{tooltipContent}</p>
          )}
        </CardHeader>
        <CardContent>
          {geoMap.isLoading ? (
            <LoadingSkeleton height={340} />
          ) : geoMap.isError ? (
            <ErrorAlert message={geoMap.error?.message} onRetry={geoMap.refetch} />
          ) : (
            <ComposableMap projectionConfig={{ scale: 140 }} height={340}>
              <ZoomableGroup>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const name = geo.properties.name;
                      const rev = revenueByCountry[name] ?? 0;
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={rev > 0 ? colorScale(rev) : emptyFill}
                          stroke={stroke}
                          strokeWidth={0.3}
                          onMouseEnter={() =>
                            setTooltipContent(rev > 0 ? `${name}: ${fmt(rev)}` : name)
                          }
                          onMouseLeave={() => setTooltipContent("")}
                          style={{ hover: { fill: "#f59e0b", outline: "none" }, pressed: { outline: "none" } }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          {topCountries.isLoading ? (
            <LoadingSkeleton type="table" />
          ) : topCountries.isError ? (
            <ErrorAlert message={topCountries.error?.message} onRetry={topCountries.refetch} />
          ) : (
            <DataTable columns={TABLE_COLS} rows={topCountries.data.data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
