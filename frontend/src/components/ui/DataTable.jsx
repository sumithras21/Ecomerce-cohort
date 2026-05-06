import { useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

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
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="h-9 pl-9 text-sm"
            placeholder="Search rows..."
            aria-label="Search table rows"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[hsl(var(--muted-foreground))]" htmlFor="rowsPerPage">
            Rows
          </label>
          <Select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="h-9 w-20 text-xs"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <Button onClick={exportCsv} variant="outline" size="sm" className="h-9">
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[hsl(var(--muted))]">
            <tr>
              {columns.map((col) => {
                const sortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    onClick={() => sortable && handleSort(col.key)}
                    className={clsx(
                      "px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]",
                      sortable && "cursor-pointer select-none hover:text-[hsl(var(--foreground))]"
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {visible.map((row, i) => (
              <tr
                key={i}
                className="bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))]"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      "px-4 py-3 text-[hsl(var(--foreground))]",
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
        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>
            Page {currentPage + 1} of {total}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === total - 1}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
