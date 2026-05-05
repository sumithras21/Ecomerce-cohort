export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
      <p className="text-sm text-red-700 dark:text-red-400">{message || "Failed to load data."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
