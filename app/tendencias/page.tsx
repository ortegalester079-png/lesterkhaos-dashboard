"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ExternalLink,
  Plus,
  Wand2,
  Flame,
  Bell,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { ETIQUETAS_TENDENCIA } from "@/lib/options";
import type { EtiquetaTendencia, Tendencia } from "@/lib/types";
import { formatDateShort, uid } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { FilterSelect, ALL } from "@/components/shared/filter-select";
import { EjemploNotice } from "@/components/shared/ejemplo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LevelBar } from "@/components/shared/level-bar";
import { Field } from "@/components/shared/form-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ETIQUETA_VARIANT: Record<EtiquetaTendencia, "default" | "secondary" | "danger" | "warning" | "muted"> = {
  "potencial de gancho": "default",
  explicativo: "secondary",
  polémico: "danger",
  emocional: "warning",
  ignorar: "muted",
};

const FUENTES_SUGERIDAS = [
  "Blog de OpenAI",
  "Blog de Anthropic",
  "Novedades de IA",
  "Tendencias de Instagram",
  "Tendencias de TikTok",
  "X / Twitter",
  "Newsletter de marketing/psicología",
  "Temas virales del nicho",
];

export default function TendenciasPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Tendencias />
    </HydrationGate>
  );
}

function Tendencias() {
  const tendencias = useAppStore((s) => s.tendencias);
  const [vista, setVista] = useState<"resumen" | "todas">("resumen");
  const [etiqueta, setEtiqueta] = useState(ALL);
  const [fuente, setFuente] = useState(ALL);

  const fuentes = useMemo(
    () => Array.from(new Set(tendencias.map((t) => t.fuente))),
    [tendencias]
  );

  const filtradas = useMemo(
    () =>
      tendencias.filter((t) => {
        if (etiqueta !== ALL && t.etiqueta !== etiqueta) return false;
        if (fuente !== ALL && t.fuente !== fuente) return false;
        return true;
      }),
    [tendencias, etiqueta, fuente]
  );

  const top5 = [...tendencias]
    .sort((a, b) => b.nivelPotencial - a.nivelPotencial)
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 06"
        title="Tendencias"
        description="Señales diarias del entorno traducidas a posibles ganchos, reels y carruseles para tu marca."
      >
        <NuevaTendenciaDialog />
      </PageHeader>

      {tendencias.some((t) => /^t_\d{3}$/.test(t.id)) && (
        <EjemploNotice texto="Tendencias de muestra. Registra las reales del día con “Nueva tendencia” y borra estas." />
      )}

      {/* Aviso de resumen Slack */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Resumen diario · 7:00 AM</p>
            <p className="text-muted-foreground">
              Sin integración de Slack conectada todavía: usa la vista “Resumen
              diario” (top 5 del día). Cuando conectes Slack, este mismo resumen se
              enviará automáticamente. Ver CLAUDE.md → Integraciones futuras.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={vista} onValueChange={(v) => setVista(v as "resumen" | "todas")}>
          <TabsList>
            <TabsTrigger value="resumen">Resumen diario</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
        {vista === "todas" && (
          <div className="flex flex-wrap gap-3">
            <FilterSelect value={etiqueta} onChange={setEtiqueta} options={ETIQUETAS_TENDENCIA} placeholder="Etiqueta" allLabel="Toda etiqueta" className="w-[180px]" />
            <FilterSelect value={fuente} onChange={setFuente} options={fuentes} placeholder="Fuente" allLabel="Toda fuente" className="w-[200px]" capitalize={false} />
          </div>
        )}
      </div>

      {vista === "resumen" ? (
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-primary" /> Top 5 con más potencial hoy
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {top5.map((t, i) => (
              <TendenciaCard key={t.id} tendencia={t} rank={i + 1} />
            ))}
          </div>
        </div>
      ) : filtradas.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Sin tendencias para estos filtros" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtradas.map((t) => (
            <TendenciaCard key={t.id} tendencia={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TendenciaCard({ tendencia: t, rank }: { tendencia: Tendencia; rank?: number }) {
  const router = useRouter();
  const setHookPendiente = useAppStore((s) => s.setHookPendiente);
  const removeTendencia = useAppStore((s) => s.removeTendencia);

  function usarHook() {
    setHookPendiente({
      texto: t.posibleHook,
      origen: `Tendencia · ${t.fuente}`,
    });
    router.push("/guiones");
  }

  return (
    <Card className="card-hover flex flex-col">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {rank && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-display text-sm text-primary">
                {rank}
              </span>
            )}
            <Badge variant={ETIQUETA_VARIANT[t.etiqueta]} className="capitalize">
              {t.etiqueta}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => removeTendencia(t.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg leading-snug">{t.titulo}</CardTitle>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {t.fuente} · {formatDateShort(t.fecha)}
          <a href={t.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            link <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-foreground/90">{t.resumen}</p>
        <LevelBar value={t.nivelPotencial} label="Nivel de potencial" />

        <Detalle label="Por qué puede servir" text={t.porQueSirve} />
        <Detalle label="Cómo adaptarla a tu marca" text={t.comoAdaptarla} accent />

        <div className="grid grid-cols-1 gap-2 rounded-lg bg-secondary/30 p-3 text-xs">
          <Idea label="Hook" text={t.posibleHook} />
          <Idea label="Reel" text={t.posibleReel} />
          <Idea label="Carrusel" text={t.posibleCarrusel} />
          <Idea label="Story" text={t.posibleStory} />
        </div>

        <Button size="sm" className="mt-auto" onClick={usarHook} disabled={!t.posibleHook || t.posibleHook === "—"}>
          <Wand2 /> Usar hook en el generador
        </Button>
      </CardContent>
    </Card>
  );
}

function Detalle({ label, text, accent }: { label: string; text: string; accent?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${accent ? "text-primary" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className="text-sm text-foreground/90">{text}</p>
    </div>
  );
}

function Idea({ label, text }: { label: string; text: string }) {
  if (!text || text === "—") return null;
  return (
    <p className="text-foreground/90">
      <span className="font-semibold text-primary">{label}: </span>
      {text}
    </p>
  );
}

function NuevaTendenciaDialog() {
  const addTendencia = useAppStore((s) => s.addTendencia);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    titulo: "",
    fuente: FUENTES_SUGERIDAS[0],
    link: "",
    resumen: "",
    nivelPotencial: 7,
    porQueSirve: "",
    comoAdaptarla: "",
    posibleHook: "",
    posibleReel: "",
    posibleCarrusel: "",
    posibleStory: "",
    etiqueta: "potencial de gancho",
  });

  function guardar() {
    if (!f.titulo.trim()) return;
    addTendencia({
      id: uid("t"),
      titulo: f.titulo.trim(),
      fuente: f.fuente,
      link: f.link,
      fecha: new Date().toISOString().slice(0, 10),
      resumen: f.resumen,
      nivelPotencial: Number(f.nivelPotencial),
      porQueSirve: f.porQueSirve,
      comoAdaptarla: f.comoAdaptarla,
      posibleHook: f.posibleHook,
      posibleReel: f.posibleReel,
      posibleCarrusel: f.posibleCarrusel,
      posibleStory: f.posibleStory,
      etiqueta: f.etiqueta as EtiquetaTendencia,
    });
    setOpen(false);
    setF({ ...f, titulo: "", link: "", resumen: "", porQueSirve: "", comoAdaptarla: "", posibleHook: "", posibleReel: "", posibleCarrusel: "", posibleStory: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nueva tendencia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto scroll-thin">
        <DialogHeader>
          <DialogTitle>Registrar tendencia</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Título">
              <Input value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
            </Field>
          </div>
          <Field label="Fuente">
            <Select value={f.fuente} onValueChange={(v) => setF({ ...f, fuente: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FUENTES_SUGERIDAS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Etiqueta">
            <Select value={f.etiqueta} onValueChange={(v) => setF({ ...f, etiqueta: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ETIQUETAS_TENDENCIA.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Link">
              <Input value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://…" />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Resumen">
              <Textarea value={f.resumen} onChange={(e) => setF({ ...f, resumen: e.target.value })} />
            </Field>
          </div>
          <Field label="Nivel de potencial (1-10)">
            <Input type="number" min={1} max={10} value={f.nivelPotencial} onChange={(e) => setF({ ...f, nivelPotencial: Number(e.target.value) })} />
          </Field>
          <Field label="Posible hook">
            <Input value={f.posibleHook} onChange={(e) => setF({ ...f, posibleHook: e.target.value })} />
          </Field>
          <div className="col-span-2">
            <Field label="Por qué puede servir">
              <Textarea value={f.porQueSirve} onChange={(e) => setF({ ...f, porQueSirve: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Cómo adaptarla a tu marca">
              <Textarea value={f.comoAdaptarla} onChange={(e) => setF({ ...f, comoAdaptarla: e.target.value })} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={guardar}>Guardar tendencia</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
