"use client";

import { useState } from "react";
import { ScanSearch, Loader2, Copy, Check, AlertCircle, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { auditarPerfil, type ProfileAuditResponse } from "@/lib/claude-api";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { Field } from "@/components/shared/form-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AuditoriaPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Auditoria />
    </HydrationGate>
  );
}

function Auditoria() {
  const avatar = useAppStore((s) => s.avatar);
  const playbook = useAppStore((s) => s.playbook);
  const [bio, setBio] = useState("");
  const [highlights, setHighlights] = useState("");
  const [pinnedReels, setPinnedReels] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileAuditResponse | null>(null);
  const [copied, setCopied] = useState(false);

  async function auditar() {
    setError(null);
    if (!bio.trim()) {
      setError("Pega al menos tu bio actual.");
      return;
    }
    setBusy(true);
    const r = await auditarPerfil({ bio, highlights, pinnedReels, avatar, playbook });
    setBusy(false);
    if (!r.ok) {
      setError(r.error ?? "Error al auditar.");
      return;
    }
    setResult(r);
  }

  function copiarBio() {
    if (result?.propuestaBio) {
      navigator.clipboard.writeText(result.propuestaBio);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Inteligencia"
        title="Auditoría de Perfil"
        description="Bio, highlights, reels pineados y primera impresión. La IA los revisa contra tu avatar."
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Inputs */}
        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanSearch className="h-4 w-4 text-primary" /> Tu perfil actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!avatar && (
              <div className="flex items-start gap-2 rounded-md bg-secondary/40 p-2.5 text-xs text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Mejor con{" "}
                  <a href="/avatar" className="text-primary underline">
                    Perfil del Avatar
                  </a>{" "}
                  completo, pero funciona igual.
                </span>
              </div>
            )}
            <Field label="Bio actual (pégala tal cual)">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tu bio de Instagram, línea por línea…"
                className="min-h-[100px]"
              />
            </Field>
            <Field label="Highlights actuales (nombres, separados por coma)">
              <Textarea
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Inicio, Testimonios, Quién soy, Servicios…"
                className="min-h-[60px]"
              />
            </Field>
            <Field label="Reels pineados (describe los 3 actuales)">
              <Textarea
                value={pinnedReels}
                onChange={(e) => setPinnedReels(e.target.value)}
                placeholder="1) Reel sobre… 2) Reel de… 3) …"
                className="min-h-[60px]"
              />
            </Field>
            <Button className="w-full" onClick={auditar} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <ScanSearch />}
              {busy ? "Auditando…" : "Auditar perfil"}
            </Button>
            {error && <p className="text-sm text-red-300">{error}</p>}
          </CardContent>
        </Card>

        {/* Resultado */}
        <div className="space-y-6">
          {!result ? (
            <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <CardContent className="space-y-2 py-16">
                <ScanSearch className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">El análisis aparecerá aquí</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Pega tu bio y pulsa “Auditar perfil”. Recibirás una bio reescrita
                  + mejoras para highlights, pines y primera impresión.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {result.propuestaBio && (
                <Card className="border-primary/40">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Bio propuesta
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={copiarBio}>
                      {copied ? <Check /> : <Copy />}
                      {copied ? "Copiada" : "Copiar"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line rounded-lg bg-secondary/30 p-3 text-sm leading-relaxed text-foreground">
                      {result.propuestaBio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {result.secciones?.map((s) => (
                <Card key={s.titulo}>
                  <CardHeader>
                    <CardTitle className="text-base">{s.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <p className="eyebrow mb-0.5 text-muted-foreground">Diagnóstico</p>
                      <p className="text-foreground/90">{s.diagnostico}</p>
                    </div>
                    <div className="rounded-md border-l-2 border-primary/60 bg-secondary/20 p-2.5">
                      <p className="eyebrow mb-0.5 text-primary">Sugerencia</p>
                      <p className="text-foreground/90">{s.sugerencia}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
