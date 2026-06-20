import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

/**
 * Mini gráfico de línea/área en SVG puro (sin dependencias).
 * Premium y ligero. Para gráficos complejos, cambiar por recharts.
 */
export function Sparkline({
  data,
  className,
  width = 220,
  height = 56,
  fill = true,
}: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-14 w-full", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill="url(#spark-fill)" />}
      <path
        d={linePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="3"
          fill="hsl(var(--primary))"
        />
      )}
    </svg>
  );
}
