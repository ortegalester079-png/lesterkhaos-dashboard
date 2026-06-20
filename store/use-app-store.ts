"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AvatarProfile,
  Competidor,
  DiagnosticoSemanal,
  Gancho,
  GuionGenerado,
  HookPendiente,
  Idea,
  InstagramConfig,
  PiezaContenido,
  PiezaMetrica,
  Playbook,
  ReelCompetencia,
  Tendencia,
} from "@/lib/types";
import {
  competidores as seedCompetidores,
  diagnosticoSemanal as seedDiagnostico,
  ganchos as seedGanchos,
  ideas as seedIdeas,
  piezasContenido as seedPiezas,
  piezasMetrica as seedMetricas,
  tendencias as seedTendencias,
} from "@/lib/mock-data";

/*
 * Store central del tablero.
 * - Inicializa con datos mock.
 * - Persiste en localStorage (clave: lesterkhaos-store).
 * - Para datos reales: reemplaza los seeds por un fetch y/o sincroniza
 *   las acciones add/update/remove con tu API (ver CLAUDE.md).
 */

interface AppState {
  // Colecciones
  ganchos: Gancho[];
  metricas: PiezaMetrica[];
  competidores: Competidor[];
  piezas: PiezaContenido[];
  tendencias: Tendencia[];
  ideas: Idea[];
  guiones: GuionGenerado[];
  diagnostico: DiagnosticoSemanal;
  instagram: InstagramConfig;
  avatar: AvatarProfile | null;
  playbook: Playbook | null;

  // Flujo entre módulos: gancho/idea/reel -> Generador de Guiones
  hookPendiente: HookPendiente | null;
  setHookPendiente: (h: HookPendiente | null) => void;

  // Acciones — Avatar / Playbook
  setAvatar: (a: AvatarProfile) => void;
  setPlaybook: (p: Playbook) => void;

  // Acciones — Diagnóstico
  setDiagnostico: (d: DiagnosticoSemanal) => void;

  // Acciones — Instagram
  setInstagramConfig: (c: Partial<InstagramConfig>) => void;
  disconnectInstagram: () => void;
  /** Inserta o actualiza métricas traídas de Instagram (upsert por id). */
  importMetricas: (items: PiezaMetrica[]) => number;

  // Acciones — Ganchos
  addGancho: (g: Gancho) => void;
  updateGancho: (id: string, patch: Partial<Gancho>) => void;
  removeGancho: (id: string) => void;

  // Acciones — Métricas (datos reales que registra el usuario)
  addMetrica: (m: PiezaMetrica) => void;
  updateMetrica: (id: string, patch: Partial<PiezaMetrica>) => void;
  removeMetrica: (id: string) => void;

  // Acciones — Piezas de contenido (Community + Calendario)
  addPieza: (p: PiezaContenido) => void;
  updatePieza: (id: string, patch: Partial<PiezaContenido>) => void;
  removePieza: (id: string) => void;
  moverPiezaFecha: (id: string, fechaISO: string) => void;

  // Acciones — Competencia
  addCompetidor: (c: Competidor) => void;
  removeCompetidor: (id: string) => void;
  addReel: (competidorId: string, reel: ReelCompetencia) => void;
  removeReel: (competidorId: string, reelId: string) => void;

  // Acciones — Tendencias
  addTendencia: (t: Tendencia) => void;
  removeTendencia: (id: string) => void;

  // Acciones — Ideas
  addIdea: (i: Idea) => void;
  updateIdea: (id: string, patch: Partial<Idea>) => void;
  removeIdea: (id: string) => void;

  // Acciones — Guiones
  addGuion: (g: GuionGenerado) => void;
  removeGuion: (id: string) => void;

  // Mantenimiento
  resetDemo: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

const seedState = {
  ganchos: seedGanchos,
  metricas: seedMetricas,
  competidores: seedCompetidores,
  piezas: seedPiezas,
  tendencias: seedTendencias,
  ideas: seedIdeas,
  guiones: [] as GuionGenerado[],
  diagnostico: seedDiagnostico,
  instagram: {
    connected: false,
    token: "",
    userId: "",
    lastSync: null,
  } as InstagramConfig,
  avatar: null as AvatarProfile | null,
  playbook: null as Playbook | null,
  hookPendiente: null as HookPendiente | null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...seedState,

      setHookPendiente: (h) => set({ hookPendiente: h }),

      setAvatar: (a) => set({ avatar: a }),
      setPlaybook: (p) => set({ playbook: p }),

      setDiagnostico: (d) => set({ diagnostico: d }),

      setInstagramConfig: (c) =>
        set((s) => ({ instagram: { ...s.instagram, ...c } })),
      disconnectInstagram: () =>
        set({
          instagram: { connected: false, token: "", userId: "", lastSync: null },
        }),
      importMetricas: (items) => {
        let nuevas = 0;
        set((s) => {
          const byId = new Map(s.metricas.map((m) => [m.id, m]));
          for (const item of items) {
            if (!byId.has(item.id)) nuevas++;
            // upsert: conserva el análisis editorial existente si ya existía
            const prev = byId.get(item.id);
            byId.set(item.id, prev ? { ...item, porQueFunciono: prev.porQueFunciono, emocionTocada: prev.emocionTocada, queRepetir: prev.queRepetir, queEvitar: prev.queEvitar, emocion: prev.emocion, tipoHook: prev.tipoHook } : item);
          }
          return {
            metricas: Array.from(byId.values()).sort(
              (a, b) => +new Date(b.fecha) - +new Date(a.fecha)
            ),
            instagram: { ...s.instagram, lastSync: new Date().toISOString() },
          };
        });
        return nuevas;
      },

      addGancho: (g) => set((s) => ({ ganchos: [g, ...s.ganchos] })),
      updateGancho: (id, patch) =>
        set((s) => ({
          ganchos: s.ganchos.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeGancho: (id) =>
        set((s) => ({ ganchos: s.ganchos.filter((g) => g.id !== id) })),

      addMetrica: (m) => set((s) => ({ metricas: [m, ...s.metricas] })),
      updateMetrica: (id, patch) =>
        set((s) => ({
          metricas: s.metricas.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        })),
      removeMetrica: (id) =>
        set((s) => ({ metricas: s.metricas.filter((m) => m.id !== id) })),

      addPieza: (p) => set((s) => ({ piezas: [p, ...s.piezas] })),
      updatePieza: (id, patch) =>
        set((s) => ({
          piezas: s.piezas.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePieza: (id) =>
        set((s) => ({ piezas: s.piezas.filter((p) => p.id !== id) })),
      moverPiezaFecha: (id, fechaISO) =>
        set((s) => ({
          piezas: s.piezas.map((p) =>
            p.id === id ? { ...p, fechaPublicacion: fechaISO } : p
          ),
        })),

      addCompetidor: (c) =>
        set((s) => ({ competidores: [c, ...s.competidores] })),
      removeCompetidor: (id) =>
        set((s) => ({
          competidores: s.competidores.filter((c) => c.id !== id),
        })),
      addReel: (competidorId, reel) =>
        set((s) => ({
          competidores: s.competidores.map((c) =>
            c.id === competidorId ? { ...c, reels: [reel, ...c.reels] } : c
          ),
        })),
      removeReel: (competidorId, reelId) =>
        set((s) => ({
          competidores: s.competidores.map((c) =>
            c.id === competidorId
              ? { ...c, reels: c.reels.filter((r) => r.id !== reelId) }
              : c
          ),
        })),

      addTendencia: (t) => set((s) => ({ tendencias: [t, ...s.tendencias] })),
      removeTendencia: (id) =>
        set((s) => ({ tendencias: s.tendencias.filter((t) => t.id !== id) })),

      addIdea: (i) => set((s) => ({ ideas: [i, ...s.ideas] })),
      updateIdea: (id, patch) =>
        set((s) => ({
          ideas: s.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      removeIdea: (id) =>
        set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) })),

      addGuion: (g) => set((s) => ({ guiones: [g, ...s.guiones] })),
      removeGuion: (id) =>
        set((s) => ({ guiones: s.guiones.filter((g) => g.id !== id) })),

      resetDemo: () => set({ ...seedState }),

      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "lesterkhaos-store",
      // v2: se eliminaron las métricas y competidores inventados. La migración
      // limpia esos datos en navegadores que ya tenían guardada la versión 1.
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        if (version < 2) {
          return {
            ...state,
            metricas: [],
            competidores: [],
            diagnostico: seedDiagnostico,
          };
        }
        return state;
      },
      // Solo se persisten las colecciones; el estado efímero (gancho en
      // tránsito, flag de hidratación) no se guarda.
      partialize: (s) => ({
        ganchos: s.ganchos,
        metricas: s.metricas,
        competidores: s.competidores,
        piezas: s.piezas,
        tendencias: s.tendencias,
        ideas: s.ideas,
        guiones: s.guiones,
        diagnostico: s.diagnostico,
        instagram: s.instagram,
        avatar: s.avatar,
        playbook: s.playbook,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Cargar desde la nube cuando el store se rehidrata.
        if (typeof window !== "undefined") {
          loadFromCloud().catch(() => {});
        }
      },
    }
  )
);

/** Carga el estado desde la nube (si existe) y lo reemplaza en el store. */
async function loadFromCloud(): Promise<void> {
  try {
    const res = await fetch("/api/load");
    const data = await res.json();
    if (data.ok && data.state) {
      useAppStore.setState(data.state);
    }
  } catch {
    // silencioso — si falla, usa lo del navegador
  }
}

/** Hook para iniciar sincronización periódica (llámalo desde AppShell). */
export function useCloudSync(): void {
  const { useEffect } = require("react");
  useEffect(() => {
    // Inicia sincronización cada 5s
    const timer = setInterval(() => {
      const state = useAppStore.getState();
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ganchos: state.ganchos,
          metricas: state.metricas,
          competidores: state.competidores,
          piezas: state.piezas,
          tendencias: state.tendencias,
          ideas: state.ideas,
          guiones: state.guiones,
          diagnostico: state.diagnostico,
          instagram: state.instagram,
          avatar: state.avatar,
          playbook: state.playbook,
        }),
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, []);
}
