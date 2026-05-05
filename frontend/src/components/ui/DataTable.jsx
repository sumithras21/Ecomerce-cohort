import { useState } from "react";
import clsx from "clsx";

export default function DataTable({ columns, rows, pageSize = 10 }) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const v1 = a[sortKey];
        const v2 = b[sortKey];
        if (typeof v1 === "number") return sortAsc ? v1 - v2 : v2 - v1;
        return sortAsc
          ? String(v1).localeCompare(String(v2))
          : String(v2).localeCompare(String(v1));
      })
    : rows;

  const total = Math.ceil(sorted.length / pageSize);
  const visible = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setPage(0);
  }

  const exportCsv = () => {
    const header = columns.map((c) => c.label).join(",");
    const body = rows
      .map((r) => columns.map((c) => JSON.stringify(r[c.key] ?? "")).join(","))
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={exportCsv}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={clsx(
                    "px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300",
                    col.sortable !== false && "cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {col.label}
                  {sortKey === col.key && (sortAsc ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {visible.map((row, i) => (
              <tr key={i} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-900 dark:text-gray-100">
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Page {page + 1} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}
              className="rounded px-2 py-1 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">
              ‹ Prev
            </button>
            <button disabled={page === total - 1} onClick={() => setPage(page + 1)}
              className="rounded px-2 py-1 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
