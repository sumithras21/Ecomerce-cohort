import useFilterStore from "../store/filterStore";

export default function useChartTheme() {
  const darkMode = useFilterStore((s) => s.darkMode);

  return {
    darkMode,
    grid: darkMode ? "#1f2937" : "#e5e7eb",
    axis: darkMode ? "#9ca3af" : "#6b7280",
    tooltip: {
      contentStyle: {
        background: darkMode ? "rgb(17 24 39)" : "#ffffff",
        border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: 8,
        fontSize: 12,
        color: darkMode ? "#f3f4f6" : "#111827",
      },
      labelStyle: { color: darkMode ? "#f3f4f6" : "#111827", fontWeight: 500 },
      itemStyle: { color: darkMode ? "#e5e7eb" : "#374151" },
      cursor: { fill: darkMode ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.06)" },
    },
    primary: "#3b82f6",
    accent: "#6366f1",
    success: "#10b981",
    warning: "#f59e0b",
    purple: "#8b5cf6",
    danger: "#ef4444",
  };
}
