"use client";

import { useState } from "react";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setError(null);
    if (!password.trim()) {
      setError("Ingresa la contraseña.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password.trim() }),
    });
    setBusy(false);
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? "Contraseña incorrecta.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">@lesterkhaos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresa la contraseña</p>
        </div>

        <div className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Contraseña"
            disabled={busy}
            autoFocus
          />
          <Button onClick={login} disabled={busy} className="w-full">
            {busy ? <Loader2 className="animate-spin" /> : <Lock />}
            {busy ? "Verificando…" : "Entrar"}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
