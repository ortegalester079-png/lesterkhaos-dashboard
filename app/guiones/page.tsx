"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PenLine,
  Sparkles,
  Save,
  CalendarPlus,
  Flame,
  Feather,
  Wind,
  Scissors,
  Inbox,
  Trash2,
  Clapperboard,
  Wand2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/use-app-store";
import {
  EMOCIONES,
  OBJETIVOS,
  ETAPAS_EMBUDO,
  FORMATOS_GUION,
} from "@/lib/options";
import type {
  FormatoContenido,
  FormatoGuion,
  GuionGenerado,
  InputsGuion,
  TonoVariante,
} from "@/lib/types";
import { generarGuion } from "@/lib/script-generator";
import { optimizarScript } from "@/lib/claude-api";
import { formatDateTime, uid } from "@/lib/utils";
import type { AvatarProfile } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { Field, MiniSelect } from "@/components/shared/form-bits";
import { CopyButton } from "@/components/shared/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DURACION_POR_FORMATO: Record<FormatoGuion, string> = {
  "Reel 30s": "30s",
  "Reel 60s": "60s",
  "Reel 90s": "90s",
  Carrusel: "8 slides",
  "Story sequence": "4 stories",
  Thread: "6 tuits",
  "Podcast corto": "5 min",
  Email: "200 palabras",
};

const FORMATO_A_CONTENIDO: Record<FormatoGuion, FormatoContenido> = {
  "Reel 30s": "reel",
  "Reel 60s": "reel",
  "Reel 90s": "reel",
  Carrusel: "carrusel",
  "Story sequence": "story",
  Thread: "thread",
  "Podcast corto": "reel",
  Email: "email",
};

const VARIANTES: { tono: TonoVariante; label: string; icon: typeof Flame }[] = [
  { tono: "agresiva", label: "Más agresiva", icon: Flame },
  { tono: "elegante", label: "Más elegante", icon: Feather },
  { tono: "espiritual", label: "Más espiritual", icon: Wind },
  { tono: "corta", label: "Más corta", icon: Scissors },
];

/** Resume el avatar guardado en una línea para el campo de texto del guion. */
function describeAvatar(a: AvatarProfile): string {
  const miedos = a.miedosPrincipales.slice(0, 2).join(", ");
  return `${a.nombre} (${a.edad}). Teme: ${miedos || "—"}. Busca: ${
    a.aspiraciones[0] || "—"
  }.`;
}

export default function GuionesPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Guiones />
    </HydrationGate>
  );
}

/** Audita el guion contra el avatar usando Claude API. */
function ScriptOptimizer({
  script,
  objetivo,
}: {
  script: string;
  objetivo: string;
}) {
  const avatar = useAppStore((s) => s.avatar);
  const playbook = useAppStore((s) => s.playbook);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    analisis?: string;
    mejoras?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function optimizar() {
    setError(null);
    if (!avatar) {
      setError("Primero completa tu Perfil del Avatar.");
      return;
    }
    setBusy(true);
    const r = await optimizarScript({ script, avatar, playbook, objetivo });
    setBusy(false);
    if (!r.ok) {
      setError(r.error ?? "Error al optimizar.");
      return;
    }
    setResult({ analisis: r.analisis, mejoras: r.mejoras });
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" /> Optimizar con IA
        </CardTitle>
        <Button size="sm" onClick={optimizar} disabled={busy || !avatar}>
          {busy ? <Loader2 className="animate-spin" /> : <Wand2 />}
          {busy ? "Analizando…" : "Auditar guion"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {!avatar && (
          <p className="text-xs text-muted-foreground">
            Claude audita tu guion contra tu cliente ideal.{" "}
            <Link href="/avatar" className="text-primary underline">
              Completa tu Perfil del Avatar
            </Link>{" "}
            para activarlo.
          </p>
        )}
        {error && <p className="text-sm text-red-300">{error}</p>}
        {result?.analisis && (
          <div className="rounded-lg bg-secondary/30 p-3 text-sm">
            <p className="eyebrow mb-1 text-primary">Análisis</p>
            <p className="whitespace-pre-line text-foreground/90">
              {result.analisis}
            </p>
          </div>
        )}
        {result?.mejoras && result.mejoras.length > 0 && (
          <div className="space-y-1.5">
            <p className="eyebrow text-primary">Mejoras sugeridas</p>
            {result.mejoras.map((m, i) => (
              <p
                key={i}
                className="rounded-md border-l-2 border-primary/60 bg-background/40 px-3 py-2 text-sm text-foreground/90"
              >
                {m}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Guiones() {
  const router = useRouter();
  const hookPendiente = useAppStore((s) => s.hookPendiente);
  const setHookPendiente = useAppStore((s) => s.setHookPendiente);
  const addGuion = useAppStore((s) => s.addGuion);
  const addPieza = useAppStore((s) => s.addPieza);
  const guiones = useAppStore((s) => s.guiones);
  const removeGuion = useAppStore((s) => s.removeGuion);
  const avatarStore = useAppStore((s) => s.avatar);

  const [inputs, setInputs] = useState<InputsGuion>({
    hook: "",
    tema: "",
    emocion: "verdad",
    avatar: avatarStore
      ? describeAvatar(avatarStore)
      : "Emprendedor/dueño que funciona por fuera y se rompe por dentro",
    formato: "Reel 60s",
    duracion: "60s",
    objetivo: "DM",
    etapaEmbudo: "TOFU",
  });
  const [guion, setGuion] = useState<GuionGenerado | null>(null);
  const [origen, setOrigen] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Recibe el gancho enviado desde Baúl / Competencia / Tendencias.
  useEffect(() => {
    if (hookPendiente) {
      setInputs((prev) => ({
        ...prev,
        hook: hookPendiente.texto,
        emocion: hookPendiente.emocion ?? prev.emocion,
        tema: hookPendiente.nicho ?? prev.tema,
      }));
      setOrigen(hookPendiente.origen);
      setHookPendiente(null);
    }
  }, [hookPendiente, setHookPendiente]);

  function set<K extends keyof InputsGuion>(key: K, value: InputsGuion[K]) {
    setInputs((p) => {
      const next = { ...p, [key]: value };
      if (key === "formato") next.duracion = DURACION_POR_FORMATO[value as FormatoGuion];
      return next;
    });
  }

  function generar(tono: TonoVariante = "base") {
    if (!inputs.hook.trim()) return;
    const g = generarGuion(
      { ...inputs, tema: inputs.tema || "tu rutina" },
      tono
    );
    setGuion(g);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function regenerarComo(formato: FormatoGuion, tono: TonoVariante = "base") {
    if (!inputs.hook.trim()) return;
    const next = { ...inputs, formato, duracion: DURACION_POR_FORMATO[formato] };
    setInputs(next);
    setGuion(generarGuion({ ...next, tema: next.tema || "tu rutina" }, tono));
  }

  function guardar() {
    if (guion) addGuion(guion);
  }

  function enviarACalendario() {
    if (!guion) return;
    const cuerpo = guion.bloques.map((b) => `${b.paso}\n${b.contenido}`).join("\n\n");
    addPieza({
      id: uid("p"),
      tituloInterno: `Guion · ${inputs.hook.slice(0, 36)}…`,
      hook: inputs.hook,
      guion: cuerpo,
      descripcion: guion.caption,
      cta: guion.bloques[guion.bloques.length - 1]?.contenido ?? "",
      keywordManychat: "",
      plataforma: "Instagram",
      estado: "guion",
      fechaPublicacion: new Date().toISOString(),
      objetivo: inputs.objetivo,
      formato: FORMATO_A_CONTENIDO[inputs.formato],
      anguloPsicologico: inputs.tema,
      emocion: inputs.emocion,
      etapaEmbudo: inputs.etapaEmbudo,
      assets: [],
      notasGrabacion: "Generado desde el Generador de Guiones.",
    });
    router.push("/calendario");
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 07"
        title="Generador de Guiones"
        description="Convierte un gancho en un guion listo para grabar, en tu voz. Sin autoayuda genérica."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Formulario */}
        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" /> Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {origen && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                <Inbox className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Gancho recibido de <span className="text-foreground">{origen}</span>
                </span>
              </div>
            )}
            <Field label="Hook">
              <Textarea
                value={inputs.hook}
                onChange={(e) => set("hook", e.target.value)}
                placeholder="No estás cansado, estás…"
                className="min-h-[72px]"
              />
            </Field>
            <Field label="Tema / nicho">
              <Input value={inputs.tema} onChange={(e) => set("tema", e.target.value)} placeholder="trabajo, control, ambición…" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Emoción principal">
                <MiniSelect value={inputs.emocion} onChange={(v) => set("emocion", v as InputsGuion["emocion"])} options={EMOCIONES} />
              </Field>
              <Field label="Formato">
                <MiniSelect value={inputs.formato} onChange={(v) => set("formato", v as FormatoGuion)} options={FORMATOS_GUION} />
              </Field>
              <Field label="Duración">
                <Input value={inputs.duracion} onChange={(e) => set("duracion", e.target.value)} />
              </Field>
              <Field label="Objetivo">
                <MiniSelect value={inputs.objetivo} onChange={(v) => set("objetivo", v as InputsGuion["objetivo"])} options={OBJETIVOS} />
              </Field>
              <Field label="Etapa del embudo">
                <MiniSelect value={inputs.etapaEmbudo} onChange={(v) => set("etapaEmbudo", v as InputsGuion["etapaEmbudo"])} options={ETAPAS_EMBUDO} />
              </Field>
            </div>
            <Field label="Avatar">
              <Textarea value={inputs.avatar} onChange={(e) => set("avatar", e.target.value)} className="min-h-[60px] text-xs" />
            </Field>
            <Button className="w-full" onClick={() => generar("base")} disabled={!inputs.hook.trim()}>
              <Sparkles /> Generar guion
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <div ref={resultRef} className="space-y-6">
          {!guion ? (
            <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <CardContent className="space-y-2 py-16">
                <Clapperboard className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">Tu guion aparecerá aquí</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Completa el hook y pulsa “Generar guion”. Luego ajústalo con las
                  variantes de tono.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Acciones de variante */}
              <Card>
                <CardContent className="flex flex-wrap items-center gap-2 p-4">
                  <span className="mr-1 text-xs text-muted-foreground">Variantes:</span>
                  {VARIANTES.map((v) => {
                    const Icon = v.icon;
                    return (
                      <Button
                        key={v.tono}
                        variant={guion.variante === v.tono ? "default" : "outline"}
                        size="sm"
                        onClick={() => generar(v.tono)}
                      >
                        <Icon /> {v.label}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="sm" onClick={() => regenerarComo("Story sequence")}>
                    <Sparkles /> Story sequence
                  </Button>
                </CardContent>
              </Card>

              {/* Guion */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Guion · {guion.inputs.formato}
                    <Badge variant="secondary" className="capitalize">{guion.variante}</Badge>
                  </CardTitle>
                  <CopyButton
                    label="Copiar guion"
                    text={guion.bloques.map((b) => `${b.paso}\n${b.contenido}`).join("\n\n")}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {guion.bloques.map((b) => (
                    <div key={b.paso} className="rounded-lg border-l-2 border-primary/60 bg-secondary/30 p-3">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                        {b.paso}
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                        {b.contenido}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Caption */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Caption</CardTitle>
                  <CopyButton text={guion.caption} label="Copiar caption" />
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {guion.caption}
                  </p>
                </CardContent>
              </Card>

              {/* Optimizador con IA */}
              <ScriptOptimizer
                script={guion.bloques
                  .map((b) => `${b.paso}\n${b.contenido}`)
                  .join("\n\n")}
                objetivo={guion.inputs.objetivo}
              />

              {/* Acciones finales */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={guardar}>
                  <Save /> Guardar guion
                </Button>
                <Button variant="outline" onClick={enviarACalendario}>
                  <CalendarPlus /> Enviar al calendario
                </Button>
              </div>
            </>
          )}

          {/* Guiones guardados */}
          {guiones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Guiones guardados ({guiones.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {guiones.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/20 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{g.inputs.hook}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.inputs.formato} · {g.variante} · {formatDateTime(g.creadoEn)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setGuion(g)}>
                        Ver
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeGuion(g.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
