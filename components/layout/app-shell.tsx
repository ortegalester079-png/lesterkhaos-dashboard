"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useCloudSync } from "@/store/use-app-store";

/** Estructura base: sidebar fija a la izquierda + contenido desplazable. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(true); // optimista: assume authed
  const [checked, setChecked] = useState(false);

  // Inicia sincronización con la nube
  useCloudSync();

  // Verifica si hay candado y si está autenticado
  useEffect(() => {
    fetch("/api/auth-check")
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok && data.needsAuth) {
          setAuthed(false);
          router.push("/login");
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [router]);

  if (!checked) return null; // espera el check de auth

  if (!authed) return null; // irá a /login

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
