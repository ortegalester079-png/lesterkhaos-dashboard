import { cn } from "@/lib/utils";

interface LevelBarProps {
  value: number; // 1-10
  max?: number;
  label?: string;
  className?: string;
}

/** Barra de nivel 1-10 (dolor, curiosidad, potencia). */
export function LevelBar({ value, max = 10, label, className }: LevelBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums">{value}/{max}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
