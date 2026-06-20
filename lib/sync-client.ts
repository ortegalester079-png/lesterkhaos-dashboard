/*
 * Cliente de sincronización (navegador → servidor).
 * Cada X segundos, manda el estado completo a /api/sync.
 * El servidor lo guarda en KV (la nube).
 *
 * Si KV no está configurado, esto es un no-op silencioso.
 */

let syncTimer: NodeJS.Timeout | null = null;

export function startSync(getState: () => unknown, intervalMs = 5000): void {
  if (syncTimer) return;
  syncTimer = setInterval(() => {
    const state = getState();
    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }).catch(() => {}); // silencioso — si falla, sigue
  }, intervalMs);
}

export function stopSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}
