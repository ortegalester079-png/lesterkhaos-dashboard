import type { PiezaMetrica } from "./types";

/*
 * Cliente del navegador para la sincronización con Instagram.
 * Llama a nuestra ruta /api/instagram/sync (que es la que habla con Meta).
 */

export interface SyncResult {
  ok: boolean;
  items?: PiezaMetrica[];
  count?: number;
  error?: string;
}

export async function syncInstagram(
  token: string,
  userId: string
): Promise<SyncResult> {
  try {
    const res = await fetch("/api/instagram/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    });
    return (await res.json()) as SyncResult;
  } catch {
    return { ok: false, error: "No se pudo contactar el servidor local." };
  }
}
