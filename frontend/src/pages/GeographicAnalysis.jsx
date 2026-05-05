import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import useFilterStore from "../store/filterStore";
import { fetchGeoMap, fetchTopCountries } from "../api/client";
import DataTable from "../components/ui/DataTable";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorAlert from "../components/ui/ErrorAlert";

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
  const [tooltipContent, setTooltipContent] = useState("");

  const geoMap = useQuery({ queryKey: ["geo-map", startDate, endDate], queryFn: () => fetchGeoMap(startDate, endDate) });
  const topCountries = useQuery({ queryKey: ["top-countries", startDate, endDate], queryFn: () => fetchTopCountries(startDate, endDate) });

  const revenueByCountry = Object.fromEntries(
    (geoMap.data?.data ?? []).map((d) => [d.country, d.revenue])
  );
  const maxRevenue = Math.max(...Object.values(revenueByCountry), 1);
  const colorScale = scaleLinear().domain([0, maxRevenue]).range(["#dbeafe", "#1d4ed8"]);

  return (
    <div className="space-y-6">
      {/* Map */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">Revenue by Country</h2>
        {tooltipContent && (
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{tooltipContent}</p>
        )}
        {geoMap.isLoading ? <LoadingSkeleton /> : geoMap.isError ? (
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
                        fill={rev > 0 ? colorScale(rev) : "#f1f5f9"}
                        stroke="#cbd5e1"
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
      </div>

      {/* Top Countries Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Top Countries</h2>
        {topCountries.isLoading ? <LoadingSkeleton /> : topCountries.isError ? (
          <ErrorAlert message={topCountries.error?.message} onRetry={topCountries.refetch} />
        ) : (
          <DataTable columns={TABLE_COLS} rows={topCountries.data.data} />
        )}
      </div>
    </div>
  );
}
