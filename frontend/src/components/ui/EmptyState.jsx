export default function EmptyState({ title = "No data available", description = "Try changing filters and retry." }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/60">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
