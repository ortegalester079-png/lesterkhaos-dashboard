import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Aviso de datos de ejemplo. Se usa en los módulos cuyo contenido inicial
 * es ilustrativo (Ganchos, Ideas, Tendencias, Contenido), para que nunca se
 * confunda con datos reales. Métricas y Competencia arrancan vacías.
 */
export function EjemploNotice({
  texto = "Contenido de ejemplo para que veas cómo funciona. Edítalo, bórralo o reemplázalo por el tuyo.",
  className,
}: {
  texto?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-2.5 rounded-lg border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-muted-foreground",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
      <span>
        <span className="font-medium text-foreground">Datos de ejemplo.</span>{" "}
        {texto}
      </span>
    </div>
  );
}
