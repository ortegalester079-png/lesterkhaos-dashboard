import { NextResponse } from "next/server";
import type { PiezaMetrica } from "@/lib/types";

/*
 * Sincronización con Instagram (API de Meta).
 *
 * Soporta los DOS flujos de Meta de forma transparente:
 *  - "Instagram API con Instagram Login"  → base graph.instagram.com (lo más
 *    nuevo y simple: el usuario solo pega un token; el nodo es "me").
 *  - "Instagram API con Facebook Login"   → base graph.facebook.com (clásico,
 *    requiere el Instagram Business Account ID).
 * Probamos primero graph.instagram.com y, si falla, graph.facebook.com.
 *
 * Recibe { token, userId? }. Si userId viene vacío, se usa el nodo "me"
 * (caso típico del flujo con Instagram Login).
 *
 * Notas honestas:
 *  - Meta cambia de vez en cuando los nombres de las métricas: pedimos varios
 *    conjuntos con respaldo (si uno falla, prueba el siguiente).
 *  - Por pieza trae: vistas/alcance, likes, comentarios, guardados, compartidos.
 *    Seguidores nuevos, DMs, leads, llamadas y ventas NO son por pieza → 0.
 */

const VER = "v21.0";
const BASES = [
  `https://graph.instagram.com/${VER}`,
  `https://graph.facebook.com/${VER}`,
];

interface IgMedia {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: "REELS" | "FEED" | "STORY" | "AD";
  timestamp: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
}

const MEDIA_FIELDS =
  "id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count";

/** Trae las publicaciones probando ambas bases de la API. */
async function fetchMedia(
  node: string,
  token: string
): Promise<{ base: string; media: IgMedia[] } | { error: string }> {
  let lastError = "No se pudieron leer las publicaciones.";
  for (const base of BASES) {
    try {
      const url = `${base}/${node}/media?fields=${MEDIA_FIELDS}&limit=25&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!json.error && Array.isArray(json.data)) {
        return { base, media: json.data };
      }
      if (json.error?.message) lastError = `Instagram: ${json.error.message}`;
    } catch {
      lastError = "Error de red al contactar a Meta.";
    }
  }
  return { error: lastError };
}

/** Pide los insights de una pieza con conjuntos de métricas de respaldo. */
async function getInsights(
  base: string,
  media: IgMedia,
  token: string
): Promise<Record<string, number>> {
  const tipo = media.media_product_type;
  const sets =
    tipo === "STORY"
      ? ["reach,replies", "reach"]
      : tipo === "REELS"
        ? ["views,reach,saved,shares,total_interactions", "reach,saved,shares", "reach"]
        : ["reach,saved,shares,total_interactions", "reach,saved", "reach"];

  for (const metrics of sets) {
    try {
      const url = `${base}/${media.id}/insights?metric=${metrics}&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!json.error && Array.isArray(json.data)) {
        const map: Record<string, number> = {};
        for (const d of json.data) map[d.name] = d.values?.[0]?.value ?? 0;
        return map;
      }
    } catch {
      // intenta el siguiente conjunto
    }
  }
  return {};
}

function mapFormato(media: IgMedia): PiezaMetrica["formato"] {
  if (media.media_product_type === "REELS") return "reel";
  if (media.media_product_type === "STORY") return "story";
  return "carrusel";
}

function titulo(media: IgMedia): string {
  const cap = (media.caption ?? "").trim();
  if (!cap) return "(sin texto)";
  const linea = cap.split("\n")[0];
  return linea.length > 60 ? linea.slice(0, 57) + "…" : linea;
}

function normalize(media: IgMedia, ins: Record<string, number>): PiezaMetrica {
  const vistas = ins.views ?? ins.plays ?? ins.reach ?? 0;
  return {
    id: `ig_${media.id}`,
    titulo: titulo(media),
    plataforma: "Instagram",
    formato: mapFormato(media),
    fecha: media.timestamp.slice(0, 10),
    emocion: "verdad",
    tipoHook: "Nadie te dice esto sobre [X]",
    vistas,
    likes: media.like_count ?? 0,
    comentarios: media.comments_count ?? 0,
    guardados: ins.saved ?? 0,
    compartidos: ins.shares ?? 0,
    seguidoresNuevos: 0,
    dms: 0,
    clicsPerfil: 0,
    respuestasStories: ins.replies ?? 0,
    keywordsManychat: 0,
    leads: 0,
    llamadas: 0,
    ventas: 0,
    porQueFunciono: "",
    emocionTocada: "",
    queRepetir: "",
    queEvitar: "",
    fuenteDatos: "instagram",
    permalink: media.permalink,
  };
}

export async function POST(req: Request) {
  let body: { token?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Falta el token de acceso." },
      { status: 400 }
    );
  }
  // Si no hay ID, usamos el nodo "me" (flujo con Instagram Login).
  const node = body.userId?.trim() || "me";

  const result = await fetchMedia(node, token);
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  try {
    const items: PiezaMetrica[] = [];
    for (const m of result.media) {
      const ins = await getInsights(result.base, m, token);
      items.push(normalize(m, ins));
    }
    return NextResponse.json({ ok: true, items, count: items.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al procesar los insights.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
