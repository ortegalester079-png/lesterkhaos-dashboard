import { NextResponse } from "next/server";
import type {
  AvatarProfile,
  DiagnosticoSemanal,
  PiezaMetrica,
  Playbook,
} from "@/lib/types";
import { askClaude, extractJSON, marcaContext } from "@/lib/claude-server";

/*
 * Diagnóstico Semanal con IA: analiza las métricas reales y devuelve un
 * diagnóstico estructurado (qué funcionó, patrón, hipótesis, experimento, etc.).
 */

interface RequestBody {
  metricas: PiezaMetrica[];
  avatar?: AvatarProfile | null;
  playbook?: Playbook | null;
  semana?: string;
}

type DiagShape = Omit<DiagnosticoSemanal, "id" | "semana">;

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const { metricas, avatar, playbook, semana } = body;
  if (!metricas || metricas.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Necesitas al menos una métrica para diagnosticar." },
      { status: 400 }
    );
  }

  const resumen = metricas
    .slice(0, 15)
    .map((m) => {
      const tasa =
        m.vistas > 0
          ? (((m.comentarios + m.guardados + m.compartidos) / m.vistas) * 100).toFixed(1)
          : "0";
      return `- "${m.titulo}" (${m.formato}, ${m.fecha}): ${m.vistas} vistas, ${m.comentarios} coment., ${m.guardados} guardados, ${m.compartidos} compart. Tasa conversación: ${tasa}%. Emoción: ${m.emocion}.`;
    })
    .join("\n");

  const prompt = `Eres analista de datos de contenido de marca personal. Analiza estas métricas reales y genera un diagnóstico semanal accionable, respetando el estilo y las estrategias del playbook.

${marcaContext(avatar, playbook)}

MÉTRICAS:
${resumen}

Devuelve SOLO un JSON válido (sin texto antes ni después) con esta forma exacta:
{
  "loQueFunciono": ["3-4 bullets concretos con números"],
  "loQueNoFunciono": ["2-3 bullets"],
  "patronDetectado": "1 frase con el patrón principal",
  "hipotesis": "1 frase: por qué pasó",
  "proximoExperimento": "1 experimento concreto para la próxima semana",
  "ideasNuevas": ["5 ideas de contenido específicas"],
  "hooksRecomendados": ["3 hooks listos para usar"],
  "decisionEstrategica": "1 decisión clara (dobla en X, baja en Y)"
}`;

  const r = await askClaude(prompt, 1600);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }

  const parsed = extractJSON<DiagShape>(r.text ?? "");
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: "La IA respondió en un formato inesperado. Intenta de nuevo." },
      { status: 400 }
    );
  }

  const diagnostico: DiagnosticoSemanal = {
    id: `diag-${Date.now()}`,
    semana: semana || new Date().toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }),
    loQueFunciono: parsed.loQueFunciono ?? [],
    loQueNoFunciono: parsed.loQueNoFunciono ?? [],
    patronDetectado: parsed.patronDetectado ?? "",
    hipotesis: parsed.hipotesis ?? "",
    proximoExperimento: parsed.proximoExperimento ?? "",
    ideasNuevas: parsed.ideasNuevas ?? [],
    hooksRecomendados: parsed.hooksRecomendados ?? [],
    decisionEstrategica: parsed.decisionEstrategica ?? "",
  };

  return NextResponse.json({ ok: true, diagnostico });
}
