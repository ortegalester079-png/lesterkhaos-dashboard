import { NextResponse } from "next/server";
import type { AvatarProfile, Playbook } from "@/lib/types";
import { askClaude, marcaContext } from "@/lib/claude-server";

/*
 * Optimizador de guiones: audita un guion contra el playbook + avatar y
 * devuelve análisis + mejoras concretas.
 */

interface RequestBody {
  script: string;
  avatar: AvatarProfile;
  playbook?: Playbook | null;
  objetivo?: string;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const { script, avatar, playbook, objetivo } = body;
  if (!script || !avatar) {
    return NextResponse.json({ ok: false, error: "Falta script o avatar." }, { status: 400 });
  }

  const prompt = `Eres un estratega de contenido experto en persuasión psicológica. Audita un guion y di QUÉ LE FALTA para resonar con el avatar y respetar el estilo de la marca.

${marcaContext(avatar, playbook)}
${objetivo ? `\nObjetivo del contenido: ${objetivo}` : ""}

GUION:
"""
${script}
"""

ANALIZA:
1. ¿El gancho (primer segundo) impacta y toca sus miedos/aspiraciones?
2. ¿Hay tensión/curiosidad mantenida?
3. ¿El CTA es claro y resonante con su motivación?
4. ¿La jerga y el tono son los del avatar?
5. ¿Falta estructura (problema→solución) o validación?

FORMATO EXACTO:
ANÁLISIS: [1-2 párrafos: fortalezas y debilidades clave]

MEJORAS:
- [mejora específica con reemplazo concreto]
- [mejora específica con reemplazo concreto]
- [mejora específica con reemplazo concreto]`;

  const r = await askClaude(prompt);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }

  const { analisis, mejoras } = parseResponse(r.text ?? "");
  return NextResponse.json({ ok: true, analisis, mejoras });
}

function parseResponse(content: string): { analisis: string; mejoras: string[] } {
  const partes = content.split(/MEJORAS:/i);
  const analisis = (partes[0] ?? "").replace(/ANÁLISIS:/i, "").trim();
  const mejorasText = partes[1] ?? "";
  const mejoras = mejorasText
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 5)
    .slice(0, 5);
  return { analisis, mejoras };
}
