"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  allLabel?: string;
  className?: string;
  capitalize?: boolean;
}

export const ALL = "__all__";

/** Select de filtro con opción "todos". Reutilizable en todos los módulos. */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  allLabel = "Todos",
  className = "w-[160px]",
  capitalize = true,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem
            key={opt}
            value={opt}
            className={capitalize ? "capitalize" : ""}
          >
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
