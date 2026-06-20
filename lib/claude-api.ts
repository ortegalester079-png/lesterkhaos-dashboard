import type {
  AvatarProfile,
  Competidor,
  DiagnosticoSemanal,
  PiezaMetrica,
  Playbook,
} from "./types";

/*
 * Cliente del navegador para las funciones de IA (rutas /api/claude/*).
 * El servidor usa la API key de .env.local; nunca se expone al navegador.
 */

export type ChatMsg = { role: "user" | "assistant"; content: string };

async function post<T>(url: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: "No se pudo contactar el servidor." } as T;
  }
}

// ----- Generador de ideas -----
export interface IdeasAIResponse {
  ok: boolean;
  ideas?: string[];
  error?: string;
}
export function generarIdeasConIA(req: {
  avatar: AvatarProfile;
  metricas: PiezaMetrica[];
  competidores: Competidor[];
  playbook?: Playbook | null;
}): Promise<IdeasAIResponse> {
  return post<IdeasAIResponse>("/api/claude/ideas", req);
}

// ----- Optimizador de guiones -----
export interface ScriptOptimizerResponse {
  ok: boolean;
  analisis?: string;
  mejoras?: string[];
  error?: string;
}
export function optimizarScript(req: {
  script: string;
  avatar: AvatarProfile;
  playbook?: Playbook | null;
  objetivo?: string;
}): Promise<ScriptOptimizerResponse> {
  return post<ScriptOptimizerResponse>("/api/claude/script-optimizer", req);
}

// ----- Asistente Estratégico (chat) -----
export interface ChatResponse {
  ok: boolean;
  text?: string;
  error?: string;
}
export function chatAsistente(req: {
  messages: ChatMsg[];
  avatar?: AvatarProfile | null;
  playbook?: Playbook | null;
  metricas?: PiezaMetrica[];
  competidores?: Competidor[];
  webSearch?: boolean;
}): Promise<ChatResponse> {
  return post<ChatResponse>("/api/claude/chat", req);
}

// ----- Diagnóstico Semanal con IA -----
export interface DiagnosticoResponse {
  ok: boolean;
  diagnostico?: DiagnosticoSemanal;
  error?: string;
}
export function generarDiagnosticoIA(req: {
  metricas: PiezaMetrica[];
  avatar?: AvatarProfile | null;
  playbook?: Playbook | null;
  semana?: string;
}): Promise<DiagnosticoResponse> {
  return post<DiagnosticoResponse>("/api/claude/diagnostico", req);
}

// ----- Auditoría de Perfil -----
export interface ProfileAuditResponse {
  ok: boolean;
  propuestaBio?: string;
  secciones?: { titulo: string; diagnostico: string; sugerencia: string }[];
  error?: string;
}
export function auditarPerfil(req: {
  bio: string;
  highlights?: string;
  pinnedReels?: string;
  avatar?: AvatarProfile | null;
  playbook?: Playbook | null;
}): Promise<ProfileAuditResponse> {
  return post<ProfileAuditResponse>("/api/claude/profile-audit", req);
}
