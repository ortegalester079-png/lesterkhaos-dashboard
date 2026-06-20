import type { PiezaContenido, Plataforma } from "./types";

/*
 * Generador de copy por plataforma — voz @lesterkhaos.
 * Reglas: crudo, humano, psicológico, directo. Sin coach barato, sin humo,
 * sin promesas de dinero fácil, sin motivación vacía, sin sonar a agencia.
 * Le habla a quien funciona por fuera y se rompe por dentro.
 */

export interface CopyMultiplataforma {
  instagram: string;
  tiktok: string;
  youtubeShorts: string;
  threads: string;
  whatsapp: string;
  emailSubject: string;
  emailBody: string;
}

function hashtags(p: PiezaContenido): string {
  const base = p.anguloPsicologico
    .toLowerCase()
    .split(" ")[0]
    .replace(/[^a-záéíóúñ]/g, "");
  return `#${base || "verdad"} #psicologia #ego #sombra #conciencia #lesterkhaos`;
}

function cta(p: PiezaContenido): string {
  if (p.keywordManychat) {
    return `Si te tocó, escribe "${p.keywordManychat}" por DM. No para venderte nada: para hacerte la pregunta que estás evitando.`;
  }
  return p.cta || "Guárdalo para el día que lo niegues.";
}

export function generarCopy(p: PiezaContenido): CopyMultiplataforma {
  const gancho = p.hook;

  return {
    instagram: `${gancho}

${p.descripcion}

No es motivación. Es un espejo. Si funcionas por fuera pero por dentro estás cansado de fingir, esto es para ti.

${cta(p)}

${hashtags(p)}`,

    tiktok: `${gancho}

${p.anguloPsicologico}. Sin filtros.
${cta(p)}
#fyp #psicologia #saludmental #lesterkhaos`,

    youtubeShorts: `${gancho.replace(/\.$/, "")} | @lesterkhaos`,

    threads: `${gancho}

${p.descripcion || p.anguloPsicologico}

¿Te pasa o te incomoda? Te leo abajo.`,

    whatsapp: `🖤 ${gancho}

${p.descripcion || p.anguloPsicologico}

Hoy publiqué algo sobre esto. ${cta(p)}`,

    emailSubject: gancho.length > 60 ? gancho.slice(0, 57) + "…" : gancho,

    emailBody: `${gancho}

No te escribo para motivarte. Te escribo porque sé lo que es sostener una imagen mientras por dentro algo se apaga.

${p.anguloPsicologico}.

Responde este correo con una sola palabra: ¿qué estás evitando sentir?

— Lester`,
  };
}

export const ETIQUETAS_PLATAFORMA: Record<keyof CopyMultiplataforma, string> = {
  instagram: "Caption · Instagram",
  tiktok: "Descripción · TikTok",
  youtubeShorts: "Título · YouTube Shorts",
  threads: "Post · Threads",
  whatsapp: "Mensaje · WhatsApp Community",
  emailSubject: "Asunto · Email",
  emailBody: "Cuerpo · Email",
};

/** Plataformas soportadas, para selectores. */
export const PLATAFORMAS_LIST: Plataforma[] = [
  "Instagram",
  "TikTok",
  "YouTube Shorts",
  "Threads",
  "WhatsApp Community",
  "Email",
];
