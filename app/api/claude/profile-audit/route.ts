import { NextResponse } from "next/server";
import type { AvatarProfile, Playbook } from "@/lib/types";
import { askClaude, extractJSON, marcaContext } from "@/lib/claude-server";

/*
 * Auditoría de Perfil: revisa bio, highlights, reels pineados y primera
 * impresión visual contra el playbook + avatar, y propone mejoras + bio nueva.
 */

interface RequestBody {
  bio: string;
  highlights?: string;
  pinnedReels?: string;
  avatar?: AvatarProfile | null;
  playbook?: Playbook | null;
}

interface AuditShape {
  propuestaBio: string;
  secciones: { titulo: string; diagnostico: string; sugerencia: string }[];
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const { bio, highlights, pinnedReels, avatar, playbook } = body;
  if (!bio) {
    return NextResponse.json({ ok: false, error: "Pega al menos tu bio actual." }, { status: 400 });
  }

  const prompt = `Eres experto en marca personal e Instagram. Audita el perfil contra el contexto de marca y propón mejoras concretas para maximizar conversión a seguidor y DM.

${marcaContext(avatar, playbook)}

BIO ACTUAL:
"""${bio}"""

HIGHLIGHTS ACTUALES: ${highlights || "(no proporcionados)"}
REELS PINEADOS: ${pinnedReels || "(no proporcionados)"}

Devuelve SOLO un JSON válido (sin texto extra) con esta forma:
{
  "propuestaBio": "una bio reescrita lista para pegar (máx 150 caracteres, con propuesta de valor + CTA)",
  "secciones": [
    {"titulo": "Bio", "diagnostico": "qué falla hoy", "sugerencia": "qué hacer"},
    {"titulo": "Highlights", "diagnostico": "...", "sugerencia": "qué destacados crear y en qué orden"},
    {"titulo": "Reels pineados", "diagnostico": "...", "sugerencia": "qué 3 pinear y por qué"},
    {"titulo": "Primera impresión", "diagnostico": "...", "sugerencia": "qué cambiar en los primeros 3 segundos visuales del perfil"}
  ]
}`;

  const r = await askClaude(prompt, 1400);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }

  const parsed = extractJSON<AuditShape>(r.text ?? "");
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: "La IA respondió en un formato inesperado. Intenta de nuevo." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    propuestaBio: parsed.propuestaBio ?? "",
    secciones: parsed.secciones ?? [],
  });
}
