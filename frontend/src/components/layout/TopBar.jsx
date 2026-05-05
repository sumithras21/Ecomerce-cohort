import DateRangePicker from "../filters/DateRangePicker";
import useFilterStore from "../../store/filterStore";

export default function TopBar({ title }) {
  const { darkMode, toggleDarkMode } = useFilterStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900">
      <h1 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <DateRangePicker />
        <button
          onClick={toggleDarkMode}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
