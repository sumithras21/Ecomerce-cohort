import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";

export default function KpiCard({ title, value, subtitle, color = "blue" }) {
  const colors = {
    blue: "from-blue-500/10 to-blue-400/5",
    green: "from-emerald-500/10 to-emerald-400/5",
    purple: "from-violet-500/10 to-violet-400/5",
    orange: "from-amber-500/10 to-amber-400/5",
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[color]}`}>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {subtitle && (
        <CardContent>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
        </CardContent>
      )}
    </Card>
  );
}
