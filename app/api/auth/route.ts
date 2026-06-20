import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, authRequired } from "@/lib/auth";

export async function POST(req: Request) {
  if (!authRequired()) {
    return NextResponse.json({ ok: true });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }

  const pw = process.env.APP_PASSWORD;
  if (!pw) {
    return NextResponse.json({ ok: true });
  }

  if (body.password !== pw) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta." }, { status: 401 });
  }

  const c = await cookies();
  c.set(COOKIE, pw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true });
}
