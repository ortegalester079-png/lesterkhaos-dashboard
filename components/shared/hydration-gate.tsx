"use client";

import { useEffect, useState } from "react";

/**
 * Evita el desajuste de hidratación entre el HTML del servidor y el estado
 * persistido en localStorage (Zustand). Muestra un fallback hasta montar.
 */
export function HydrationGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
