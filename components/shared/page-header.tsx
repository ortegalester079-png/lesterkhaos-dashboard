import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode; // acciones a la derecha
  className?: string;
}

/** Encabezado consistente para cada módulo. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
