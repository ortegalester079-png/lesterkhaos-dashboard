/*
 * Guardado en la nube (Vercel KV / Upstash Redis vía REST).
 * Guarda TODO el estado del tablero como un único documento JSON.
 *
 * Si no hay variables de entorno configuradas (desarrollo local), todo
 * queda en null/no-op y el tablero sigue usando solo el navegador.
 *
 * Variables (las crea automáticamente la integración KV de Vercel):
 *   KV_REST_API_URL, KV_REST_API_TOKEN
 */

// Acepta los nombres de Vercel KV o de Upstash Redis (según lo que conectes).
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "lesterkhaos:state";

export function kvConfigured(): boolean {
  return Boolean(URL && TOKEN);
}

export async function kvGet(): Promise<Record<string, unknown> | null> {
  if (!kvConfigured()) return null;
  try {
    const res = await fetch(`${URL}/get/${KEY}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });
    const json = await res.json();
    if (!json?.result) return null;
    return JSON.parse(json.result as string);
  } catch {
    return null;
  }
}

export async function kvSet(data: unknown): Promise<boolean> {
  if (!kvConfigured()) return false;
  try {
    const res = await fetch(`${URL}/set/${KEY}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}
