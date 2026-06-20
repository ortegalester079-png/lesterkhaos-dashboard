import type { PiezaMetrica } from "./types";
import { median } from "./utils";

/** "Hoy" de referencia del demo. Cambia a `new Date()` con datos reales. */
export const HOY = new Date("2026-06-16T12:00:00");

export type Ventana = 7 | 30 | 90;

/** Filtra piezas dentro de los últimos N días respecto a HOY. */
export function enVentana(
  piezas: PiezaMetrica[],
  dias: Ventana
): PiezaMetrica[] {
  const desde = new Date(HOY);
  desde.setDate(desde.getDate() - dias);
  return piezas.filter((p) => new Date(p.fecha) >= desde);
}

export interface Agregado {
  vistas: number;
  likes: number;
  comentarios: number;
  guardados: number;
  compartidos: number;
  seguidoresNuevos: number;
  dms: number;
  clicsPerfil: number;
  respuestasStories: number;
  keywordsManychat: number;
  leads: number;
  llamadas: number;
  ventas: number;
  piezas: number;
}

const CAMPOS: (keyof Agregado)[] = [
  "vistas",
  "likes",
  "comentarios",
  "guardados",
  "compartidos",
  "seguidoresNuevos",
  "dms",
  "clicsPerfil",
  "respuestasStories",
  "keywordsManychat",
  "leads",
  "llamadas",
  "ventas",
];

/** Suma todas las métricas de un conjunto de piezas. */
export function agregar(piezas: PiezaMetrica[]): Agregado {
  const base: Agregado = {
    vistas: 0,
    likes: 0,
    comentarios: 0,
    guardados: 0,
    compartidos: 0,
    seguidoresNuevos: 0,
    dms: 0,
    clicsPerfil: 0,
    respuestasStories: 0,
    keywordsManychat: 0,
    leads: 0,
    llamadas: 0,
    ventas: 0,
    piezas: 0,
  };
  for (const p of piezas) {
    for (const c of CAMPOS) {
      base[c] += (p[c as keyof PiezaMetrica] as number) ?? 0;
    }
  }
  base.piezas = piezas.length;
  return base;
}

/**
 * Tasa de conversación: interacciones que abren diálogo (comentarios +
 * respuestas a stories + DMs) sobre vistas.
 */
export function tasaConversacion(a: Agregado): number {
  if (a.vistas === 0) return 0;
  return ((a.comentarios + a.respuestasStories + a.dms) / a.vistas) * 100;
}

/** Tasa de conversión a lead: leads sobre DMs. */
export function tasaConversionLead(a: Agregado): number {
  if (a.dms === 0) return 0;
  return (a.leads / a.dms) * 100;
}

/** Variación % entre dos valores. */
export function delta(actual: number, previo: number): number {
  if (previo === 0) return actual > 0 ? 100 : 0;
  return ((actual - previo) / previo) * 100;
}

/**
 * Marca como "bombazo" cualquier pieza que duplique la mediana de vistas
 * de los últimos 30 días.
 */
export function umbralBombazo(piezas: PiezaMetrica[]): number {
  const ventana30 = enVentana(piezas, 30);
  return median(ventana30.map((p) => p.vistas)) * 2;
}

export function esBombazo(pieza: PiezaMetrica, umbral: number): boolean {
  return umbral > 0 && pieza.vistas >= umbral;
}

/** Top N piezas por un campo. */
export function topPor(
  piezas: PiezaMetrica[],
  campo: keyof PiezaMetrica,
  n = 5
): PiezaMetrica[] {
  return [...piezas]
    .sort((a, b) => (b[campo] as number) - (a[campo] as number))
    .slice(0, n);
}
