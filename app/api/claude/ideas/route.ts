import { NextResponse } from "next/server";
import type {
  AvatarProfile,
  Competidor,
  PiezaMetrica,
  Playbook,
} from "@/lib/types";
import { askClaude, marcaContext } from "@/lib/claude-server";

/*
 * Generador de ideas con Claude.
 * Analiza playbook + avatar + métricas + competencia → ideas específicas
 * cubriendo reels, carruseles e historias.
 */

interface RequestBody {
  avatar: AvatarProfile;
  metricas: PiezaMetrica[];
  competidores: Competidor[];
  playbook?: Playbook | null;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const { avatar, metricas, competidores, playbook } = body;
  if (!avatar || !metricas || !competidores) {
    return NextResponse.json(
      { ok: false, error: "Faltan avatar, métricas o competidores." },
      { status: 400 }
    );
  }

  const r = await askClaude(construirPrompt(avatar, metricas, competidores, playbook));
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ideas: parseIdeas(r.text ?? "") });
}

function construirPrompt(
  avatar: AvatarProfile,
  metricas: PiezaMetrica[],
  competidores: Competidor[],
  playbook?: Playbook | null
): string {
  const metricasResumen = metricas.slice(0, 8).map((m) => {
    const tasa =
      m.vistas > 0
        ? (((m.comentarios + m.guardados + m.compartidos) / m.vistas) * 100).toFixed(1)
        : "0";
    return `- "${m.titulo}": ${m.vistas} vistas, ${m.comentarios} comentarios, ${m.guardados} guardados. Tasa: ${tasa}%. Emoción: ${m.emocion}.`;
  });

  const competidoresResumen = competidores.slice(0, 3).flatMap((c) =>
    c.reels.slice(0, 2).map((r) => {
      const tasa =
        r.vistas > 0
          ? (((r.comentarios + (r.guardados ?? 0)) / r.vistas) * 100).toFixed(1)
          : "0";
      return `- ${c.nombre}: "${r.titulo}" (${r.vistas} vistas, tasa ${tasa}%). Hook: "${r.hook}". Emoción: ${r.emocionDominante}`;
    })
  );

  return `Eres un estratega de contenido experto en marca personal. Analiza el contexto de marca y la data real del usuario, y sugiere 6 ideas de contenido ÚNICAS Y PRÁCTICAS.

${marcaContext(avatar, playbook)}

ÚLTIMAS MÉTRICAS (qué funcionó):
${metricasResumen.join("\n") || "Sin datos aún."}

REFERENTES (qué funciona en el nicho):
${competidoresResumen.join("\n") || "Sin datos aún."}

INSTRUCCIONES:
1. Detecta el PATRÓN (emociones/formatos que funcionaron) y respeta el estilo y las estrategias del playbook.
2. Cruza con lo que funciona en los referentes.
3. Da 6 ideas NUEVAS, específicas (no genéricas), con variedad de formato: incluye al menos 2 reels, 2 carruseles y 2 historias (con mecánica de handraising para convertir a DM cuando aplique). Incluye el hook de cada una y marca el formato entre corchetes al inicio, ej: "[Reel] ...", "[Carrusel] ...", "[Historia/handraising] ...".

Responde SOLO con la lista, una idea por línea empezando con "1.", "2.", etc.`;
}

function parseIdeas(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => /^\d+\./.test(line.trim()))
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((idea) => idea.length > 10);
}
