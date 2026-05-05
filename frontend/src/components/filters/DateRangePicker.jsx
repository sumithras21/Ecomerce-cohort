import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useFilterStore from "../../store/filterStore";

export default function DateRangePicker() {
  const { startDate, endDate, setDateRange, clearDateRange } = useFilterStore();

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  return (
    <div className="flex items-center gap-2">
      <ReactDatePicker
        selected={start}
        onChange={(date) => setDateRange(date ? date.toISOString().split("T")[0] : null, endDate)}
        selectsStart
        startDate={start}
        endDate={end}
        placeholderText="Start date"
        dateFormat="yyyy-MM-dd"
        className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      />
      <span className="text-gray-400">–</span>
      <ReactDatePicker
        selected={end}
        onChange={(date) => setDateRange(startDate, date ? date.toISOString().split("T")[0] : null)}
        selectsEnd
        startDate={start}
        endDate={end}
        minDate={start}
        placeholderText="End date"
        dateFormat="yyyy-MM-dd"
        className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
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
