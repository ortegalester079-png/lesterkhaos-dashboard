import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  delta?: number; // variación % vs periodo anterior
  hint?: string;
  format?: boolean; // formatear número grande
  accent?: boolean; // resaltar con acento terracota
}

/** Tarjeta de métrica reutilizable. */
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  format = true,
  accent = false,
}: StatCardProps) {
  const display =
    typeof value === "number" && format ? formatNumber(value) : value;
  const positive = (delta ?? 0) >= 0;

  return (
    <Card
      className={cn(
        "card-hover p-5",
        accent && "ring-1 ring-inset ring-primary/30"
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4",
              accent ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-foreground">
        {display}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              positive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
