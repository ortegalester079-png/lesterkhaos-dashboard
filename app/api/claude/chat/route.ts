import { NextResponse } from "next/server";
import type {
  AvatarProfile,
  Competidor,
  PiezaMetrica,
  Playbook,
} from "@/lib/types";
import { callClaude, marcaContext, type Msg } from "@/lib/claude-server";

/*
 * Asistente Estratégico: chat que actúa como "Head de Contenido" con TODO
 * el contexto del usuario (playbook + avatar + métricas + competencia).
 */

interface RequestBody {
  messages: Msg[];
  avatar?: AvatarProfile | null;
  playbook?: Playbook | null;
  metricas?: PiezaMetrica[];
  competidores?: Competidor[];
  webSearch?: boolean;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const { messages, avatar, playbook, metricas = [], competidores = [], webSearch } = body;
  if (!messages || messages.length === 0) {
    return NextResponse.json({ ok: false, error: "Falta el mensaje." }, { status: 400 });
  }

  const metricasTxt =
    metricas.length > 0
      ? metricas
          .slice(0, 8)
          .map(
            (m) =>
              `- "${m.titulo}" (${m.formato}): ${m.vistas} vistas, ${m.comentarios} coment., ${m.guardados} guardados. Emoción: ${m.emocion}.`
          )
          .join("\n")
      : "Sin métricas cargadas todavía.";

  const compTxt =
    competidores.length > 0
      ? competidores
          .slice(0, 3)
          .map((c) => `- ${c.nombre} (${c.usuario}): ${c.observacionEstrategica}`)
          .join("\n")
      : "Sin competidores cargados todavía.";

  const system = `Eres el "Head de Contenido" de la marca personal @lesterkhaos. Eres analista de datos, estratega de contenido y guionista a la vez. Hablas español, directo y accionable, sin relleno ni autoayuda genérica. Dominas reels, carruseles e historias (incluido handraising para hacer levantar la mano en stories y convertir a DM) y la construcción de comunidad. Basa tus respuestas en el contexto de marca y la data de abajo; cita números cuando existan.

${marcaContext(avatar, playbook)}

MÉTRICAS RECIENTES:
${metricasTxt}

COMPETENCIA / REFERENTES:
${compTxt}

Reglas:
- Respeta el estilo de comunicación y las estrategias del playbook (si existen).
- Prioriza conversión a conversación privada (DM) y comunidad.
- Sé concreto: da hooks, estructuras y pasos, no teoría. Adapta al formato pedido.`;

  const r = await callClaude(messages.slice(-12), { system, maxTokens: 1500, webSearch });
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, text: r.text });
}
