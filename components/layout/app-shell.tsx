"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useCloudSync } from "@/store/use-app-store";

/** Estructura base: sidebar fija a la izquierda + contenido desplazable. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(true);
  const [checked, setChecked] = useState(false);

  // Inicia sincronización con la nube
  useCloudSync();

  // Verifica si hay candado y si está autenticado (excepto en /login)
  useEffect(() => {
    if (pathname === "/login") {
      setChecked(true);
      return;
    }
    fetch("/api/auth-check")
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok && data.needsAuth) {
          setAuthed(false);
          router.push("/login");
        } else {
          setAuthed(true);
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [router, pathname]);

  // La página de login se muestra sola, sin shell ni candado.
  if (pathname === "/login") return <>{children}</>;

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authed) return null; // redirigiendo a /login

  return (
    <div id="app-root" className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-72">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
