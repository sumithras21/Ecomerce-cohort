import { useState } from "react";
import clsx from "clsx";

export default function DataTable({ columns, rows, pageSize = 10 }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = search
    ? rows.filter((row) =>
        columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(search.toLowerCase()))
      )
    : rows;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const v1 = a[sortKey];
        const v2 = b[sortKey];
        if (typeof v1 === "number") return sortAsc ? v1 - v2 : v2 - v1;
        return sortAsc
          ? String(v1).localeCompare(String(v2))
          : String(v2).localeCompare(String(v1));
      })
    : filtered;

  const total = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const currentPage = Math.min(page, total - 1);
  const visible = sorted.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none sm:w-64 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          placeholder="Search rows..."
          aria-label="Search table rows"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="rowsPerPage">Rows</label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        <button
          onClick={exportCsv}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Export CSV
        </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
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
                  <td
                    key={col.key}
                    className={clsx(
                      "px-4 py-3 text-gray-900 dark:text-gray-100",
                      typeof row[col.key] === "number" && "text-right tabular-nums"
                    )}
                  >
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
          <span>Page {currentPage + 1} of {total}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}
              className="rounded px-2 py-1 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">
              ‹ Prev
            </button>
            <button disabled={currentPage === total - 1} onClick={() => setPage(currentPage + 1)}
              className="rounded px-2 py-1 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800">
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
