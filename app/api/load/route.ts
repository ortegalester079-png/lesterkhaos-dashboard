import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { kvGet } from "@/lib/server-store";

export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const state = await kvGet();
  return NextResponse.json({ ok: true, state });
}
