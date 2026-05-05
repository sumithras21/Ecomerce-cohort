import useFilterStore from "../../store/filterStore";

const inputCls =
  "rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200";

export default function DateRangePicker() {
  const { startDate, endDate, setDateRange, clearDateRange } = useFilterStore();

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate ?? ""}
        max={endDate ?? undefined}
        onChange={(e) => setDateRange(e.target.value || null, endDate)}
        className={inputCls}
      />
      <span className="text-gray-400 text-xs">–</span>
      <input
        type="date"
        value={endDate ?? ""}
        min={startDate ?? undefined}
        onChange={(e) => setDateRange(startDate, e.target.value || null)}
        className={inputCls}
      />
      {(startDate || endDate) && (
        <button
          onClick={clearDateRange}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      )}
    </div>
  );
}
