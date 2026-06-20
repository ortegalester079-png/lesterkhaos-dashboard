import { NextResponse } from "next/server";
import { authRequired, isAuthed } from "@/lib/auth";

export async function GET() {
  if (!authRequired()) {
    return NextResponse.json({ ok: true, needsAuth: false });
  }
  return NextResponse.json({ ok: isAuthed(), needsAuth: !isAuthed() });
}
