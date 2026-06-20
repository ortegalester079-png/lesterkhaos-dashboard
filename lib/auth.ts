import { cookies } from "next/headers";

/*
 * Candado simple por contraseña (un solo usuario).
 * Si no hay APP_PASSWORD configurada (local), NO hay candado.
 */

export const COOKIE = "lk_auth";

export function authRequired(): boolean {
  return Boolean(process.env.APP_PASSWORD);
}

export function isAuthed(): boolean {
  const pw = process.env.APP_PASSWORD;
  if (!pw) return true; // sin password => acceso libre (desarrollo local)
  return cookies().get(COOKIE)?.value === pw;
}
