/*
 * Helper de servidor para llamar a Claude API.
 * SOLO se importa desde rutas /api/* (usa la API key de .env.local).
 * No importar desde componentes del navegador.
 */

import type { AvatarProfile, Playbook } from "./types";

const API_KEY = process.env.ANTHROPIC_API_KEY;
// Modelo configurable. Sonnet 4.6 = mejor estratega; Haiku 4.5 = más barato.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export type Msg = { role: "user" | "assistant"; content: string };

const cap = (s: string | undefined, n = 1800) =>
  s && s.trim() ? (s.length > n ? s.slice(0, n) + "…" : s) : "";

/**
 * Construye el bloque de contexto de marca (avatar + playbook) que se inyecta
 * en TODAS las funciones de IA. Es lo que hace que la IA "te conozca".
 */
export function marcaContext(
  avatar?: AvatarProfile | null,
  playbook?: Playbook | null
): string {
  const partes: string[] = [];

  if (avatar) {
    partes.push(`PERFIL DEL AVATAR:
- ${avatar.nombre}, ${avatar.edad} años, ${avatar.genero}
- Miedos: ${avatar.miedosPrincipales.join(", ")}
- Aspiraciones: ${avatar.aspiraciones.join(", ")}
- Problemas que resuelves: ${avatar.problemasClave.join(", ")}
- Jerga: ${avatar.jerga} | Motivación de compra: ${avatar.motivacionCompra}
- Objetivo: ${avatar.objetos} | Nicho: ${avatar.nicho}`);
  }

  if (playbook) {
    const p = playbook;
    const campos: [string, string][] = [
      ["NICHO Y SUB-NICHO", p.subNicho],
      ["AVATAR PROFUNDO (dolores, lenguaje, objeciones)", p.avatarProfundo],
      ["ESTRATEGIA DE EMBUDO (TOFU/MOFU/BOFU)", p.estrategiaEmbudo],
      ["PILARES DE CONTENIDO", p.pilaresContenido],
      ["ESTRATEGIAS DE COMUNIDAD (handraising, rituales, Ramiro Cubría, etc.)", p.estrategiasComunidad],
      ["ESTILO DE COMUNICACIÓN (voz, do's & don'ts)", p.estiloComunicacion],
      ["EJEMPLOS DE MIS GUIONES (mi voz)", p.guionesPropios],
      ["GUIONES DE COMPETENCIA QUE ADMIRO", p.guionesCompetencia],
    ];
    for (const [titulo, valor] of campos) {
      const v = cap(valor);
      if (v) partes.push(`${titulo}:\n${v}`);
    }
  }

  if (partes.length === 0) {
    return "NOTA: el usuario aún no definió su Avatar ni su Base de Conocimiento. Sugiérele completarlos para respuestas más afiladas.";
  }
  return partes.join("\n\n");
}

export interface ClaudeResult {
  ok: boolean;
  text?: string;
  error?: string;
}

export async function callClaude(
  messages: Msg[],
  opts: { system?: string; maxTokens?: number; webSearch?: boolean } = {}
): Promise<ClaudeResult> {
  if (!API_KEY) {
    return {
      ok: false,
      error: "API key no configurada. Agrega ANTHROPIC_API_KEY a .env.local",
    };
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: opts.maxTokens ?? 1024,
        ...(opts.system ? { system: opts.system } : {}),
        ...(opts.webSearch
          ? { tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }] }
          : {}),
        messages,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: json.error?.message || `Claude API error: ${res.status}`,
      };
    }
    // Une todos los bloques de texto (con búsqueda web puede haber varios).
    const text = Array.isArray(json.content)
      ? json.content
          .filter((b: { type?: string }) => b.type === "text")
          .map((b: { text?: string }) => b.text ?? "")
          .join("\n")
          .trim()
      : "";
    return { ok: true, text };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error de red al contactar a Claude.",
    };
  }
}

export async function askClaude(
  prompt: string,
  maxTokens = 1024
): Promise<ClaudeResult> {
  return callClaude([{ role: "user", content: prompt }], { maxTokens });
}

/** Extrae el primer bloque JSON de una respuesta de texto. */
export function extractJSON<T>(text: string): T | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
