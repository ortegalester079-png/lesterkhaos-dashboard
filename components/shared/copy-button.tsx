"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Botón para copiar texto al portapapeles con feedback breve. */
export function CopyButton({
  text,
  label = "Copiar",
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={copy} className="h-7 gap-1.5 text-xs">
      {done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copiado" : label}
    </Button>
  );
}
