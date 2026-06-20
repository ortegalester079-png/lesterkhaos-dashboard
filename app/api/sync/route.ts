import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { kvSet } from "@/lib/server-store";

export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const ok = await kvSet(data);
  return NextResponse.json({ ok });
}
