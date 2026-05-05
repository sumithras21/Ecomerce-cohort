import useFilterStore from "../../store/filterStore";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { X } from "lucide-react";

const presets = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function DateRangePicker() {
  const { startDate, endDate, setDateRange, clearDateRange } = useFilterStore();
  const applied = startDate || endDate;

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setDateRange(toIsoDate(start), toIsoDate(end));
  };

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <div className="flex items-center gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            onClick={() => applyPreset(preset.days)}
            variant="outline"
            size="sm"
            className="h-7 text-[11px]"
            aria-label={`Set date range to last ${preset.days} days`}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <Input
        type="date"
        value={startDate ?? ""}
        max={endDate ?? undefined}
        onChange={(e) => setDateRange(e.target.value || null, endDate)}
        className="h-8 w-36 text-xs"
        aria-label="Start date"
      />
      <span className="text-xs text-[hsl(var(--muted-foreground))]">to</span>
      <Input
        type="date"
        value={endDate ?? ""}
        min={startDate ?? undefined}
        onChange={(e) => setDateRange(startDate, e.target.value || null)}
        className="h-8 w-36 text-xs"
        aria-label="End date"
      />
      {applied && (
        <span className="rounded-md bg-blue-600/10 px-2 py-1 text-[11px] text-blue-700 dark:text-blue-300">
          {startDate || "Any"} to {endDate || "Any"}
        </span>
      )}
      {applied && (
        <Button onClick={clearDateRange} variant="ghost" size="icon" className="h-7 w-7" aria-label="Clear date filters">
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
