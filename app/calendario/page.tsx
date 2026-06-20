"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  Clock,
  Target,
  Film,
  Hash,
  GripVertical,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import {
  ESTADOS_PIEZA,
  OBJETIVOS,
  PLATAFORMAS,
  FORMATOS,
  ETAPAS_EMBUDO,
} from "@/lib/options";
import type { EstadoPieza, PiezaContenido } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { FilterSelect, ALL } from "@/components/shared/filter-select";
import { EjemploNotice } from "@/components/shared/ejemplo-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const HOY = new Date("2026-06-16T12:00:00");
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const PLAT_COLOR: Record<string, string> = {
  Instagram: "border-l-pink-500/70",
  TikTok: "border-l-cyan-400/70",
  "YouTube Shorts": "border-l-red-500/70",
  Threads: "border-l-zinc-300/70",
  "WhatsApp Community": "border-l-emerald-500/70",
  Email: "border-l-amber-400/70",
};

const ESTADO_VARIANT: Record<EstadoPieza, "muted" | "warning" | "secondary" | "success" | "default"> = {
  idea: "muted",
  guion: "secondary",
  grabado: "warning",
  editado: "warning",
  programado: "default",
  publicado: "success",
};

export default function CalendarioPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Calendario />
    </HydrationGate>
  );
}

type Vista = "mensual" | "semanal" | "diaria";

function Calendario() {
  const piezas = useAppStore((s) => s.piezas);
  const moverPiezaFecha = useAppStore((s) => s.moverPiezaFecha);

  const [vista, setVista] = useState<Vista>("mensual");
  const [cursor, setCursor] = useState(new Date(HOY));
  const [selId, setSelId] = useState<string | null>(null);

  // Filtros
  const [plataforma, setPlataforma] = useState(ALL);
  const [estado, setEstado] = useState(ALL);
  const [objetivo, setObjetivo] = useState(ALL);
  const [etapa, setEtapa] = useState(ALL);
  const [formato, setFormato] = useState(ALL);

  const filtradas = useMemo(
    () =>
      piezas.filter((p) => {
        if (plataforma !== ALL && p.plataforma !== plataforma) return false;
        if (estado !== ALL && p.estado !== estado) return false;
        if (objetivo !== ALL && p.objetivo !== objetivo) return false;
        if (etapa !== ALL && p.etapaEmbudo !== etapa) return false;
        if (formato !== ALL && p.formato !== formato) return false;
        return true;
      }),
    [piezas, plataforma, estado, objetivo, etapa, formato]
  );

  function eventosDe(fecha: Date): PiezaContenido[] {
    const key = fecha.toISOString().slice(0, 10);
    return filtradas
      .filter((p) => p.fechaPublicacion.slice(0, 10) === key)
      .sort((a, b) => a.fechaPublicacion.localeCompare(b.fechaPublicacion));
  }

  function onDrop(fecha: Date, id: string) {
    const pieza = piezas.find((p) => p.id === id);
    if (!pieza) return;
    const original = new Date(pieza.fechaPublicacion);
    const nueva = new Date(fecha);
    nueva.setHours(original.getHours(), original.getMinutes(), 0, 0);
    moverPiezaFecha(id, nueva.toISOString());
  }

  function navegar(dir: number) {
    const d = new Date(cursor);
    if (vista === "mensual") d.setMonth(d.getMonth() + dir);
    else if (vista === "semanal") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  }

  const seleccionada = piezas.find((p) => p.id === selId) ?? null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 05"
        title="Calendario de Contenido"
        description="Tu ritmo de publicación de un vistazo. Arrastra una pieza para reprogramarla."
      />

      {piezas.some((p) => /^p_\d{3}$/.test(p.id)) && (
        <EjemploNotice texto="Publicaciones de ejemplo. Edítalas, arrástralas o bórralas; crea las tuyas desde Community Manager." />
      )}

      {/* Controles */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navegar(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[180px] text-center font-display text-lg">
                {vista === "mensual"
                  ? `${MESES[cursor.getMonth()]} ${cursor.getFullYear()}`
                  : cursor.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
              </span>
              <Button variant="outline" size="icon" onClick={() => navegar(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(HOY))}>
                Hoy
              </Button>
            </div>
            <Tabs value={vista} onValueChange={(v) => setVista(v as Vista)}>
              <TabsList>
                <TabsTrigger value="mensual">Mensual</TabsTrigger>
                <TabsTrigger value="semanal">Semanal</TabsTrigger>
                <TabsTrigger value="diaria">Diaria</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect value={plataforma} onChange={setPlataforma} options={PLATAFORMAS} placeholder="Plataforma" allLabel="Todas" className="w-[170px]" />
            <FilterSelect value={estado} onChange={setEstado} options={ESTADOS_PIEZA} placeholder="Estado" allLabel="Todo estado" />
            <FilterSelect value={objetivo} onChange={setObjetivo} options={OBJETIVOS} placeholder="Objetivo" allLabel="Todo objetivo" />
            <FilterSelect value={etapa} onChange={setEtapa} options={ETAPAS_EMBUDO} placeholder="Embudo" allLabel="Todo embudo" className="w-[130px]" />
            <FilterSelect value={formato} onChange={setFormato} options={FORMATOS} placeholder="Formato" allLabel="Todo formato" className="w-[130px]" />
          </div>
        </CardContent>
      </Card>

      {vista === "mensual" && (
        <MesGrid cursor={cursor} eventosDe={eventosDe} onDrop={onDrop} onSelect={setSelId} />
      )}
      {vista === "semanal" && (
        <SemanaGrid cursor={cursor} eventosDe={eventosDe} onDrop={onDrop} onSelect={setSelId} />
      )}
      {vista === "diaria" && (
        <DiaLista cursor={cursor} eventos={eventosDe(cursor)} onSelect={setSelId} />
      )}

      <DetallePanel
        pieza={seleccionada}
        open={!!seleccionada}
        onClose={() => setSelId(null)}
      />
    </div>
  );
}

// ----- Vista mensual -----

function MesGrid({
  cursor,
  eventosDe,
  onDrop,
  onSelect,
}: {
  cursor: Date;
  eventosDe: (d: Date) => PiezaContenido[];
  onDrop: (d: Date, id: string) => void;
  onSelect: (id: string) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const primero = new Date(year, month, 1);
  // Lunes = 0
  const offset = (primero.getDay() + 6) % 7;
  const inicio = new Date(year, month, 1 - offset);

  const celdas: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return d;
  });

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {DIAS.map((d) => (
          <div key={d} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {celdas.map((fecha, i) => {
          const enMes = fecha.getMonth() === month;
          const esHoy = fecha.toDateString() === HOY.toDateString();
          const eventos = eventosDe(fecha);
          return (
            <DayCell key={i} fecha={fecha} onDrop={onDrop}>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium",
                    !enMes && "text-muted-foreground/40",
                    esHoy &&
                      "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  )}
                >
                  {fecha.getDate()}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {eventos.map((e) => (
                  <EventChip key={e.id} pieza={e} onSelect={onSelect} />
                ))}
              </div>
            </DayCell>
          );
        })}
      </div>
    </Card>
  );
}

function DayCell({
  fecha,
  onDrop,
  children,
}: {
  fecha: Date;
  onDrop: (d: Date, id: string) => void;
  children: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(fecha, id);
      }}
      className={cn(
        "min-h-[110px] border-b border-r border-border p-1.5 transition-colors",
        over && "bg-primary/10"
      )}
    >
      {children}
    </div>
  );
}

function EventChip({
  pieza,
  onSelect,
}: {
  pieza: PiezaContenido;
  onSelect: (id: string) => void;
}) {
  const hora = new Date(pieza.fechaPublicacion).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <button
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", pieza.id)}
      onClick={() => onSelect(pieza.id)}
      className={cn(
        "group flex w-full items-center gap-1 rounded border-l-2 bg-secondary/60 px-1.5 py-1 text-left text-[11px] transition-colors hover:bg-secondary",
        PLAT_COLOR[pieza.plataforma] ?? "border-l-primary"
      )}
    >
      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
      <span className="shrink-0 tabular-nums text-muted-foreground">{hora}</span>
      <span className="truncate font-medium">{pieza.tituloInterno}</span>
    </button>
  );
}

// ----- Vista semanal -----

function SemanaGrid({
  cursor,
  eventosDe,
  onDrop,
  onSelect,
}: {
  cursor: Date;
  eventosDe: (d: Date) => PiezaContenido[];
  onDrop: (d: Date, id: string) => void;
  onSelect: (id: string) => void;
}) {
  const offset = (cursor.getDay() + 6) % 7;
  const inicio = new Date(cursor);
  inicio.setDate(cursor.getDate() - offset);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {dias.map((fecha, i) => {
        const esHoy = fecha.toDateString() === HOY.toDateString();
        return (
          <Card key={i} className={cn("min-h-[300px]", esHoy && "ring-1 ring-primary/40")}>
            <div className="border-b border-border p-2 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {DIAS[i]}
              </p>
              <p className={cn("font-display text-lg", esHoy && "text-primary")}>
                {fecha.getDate()}
              </p>
            </div>
            <DayCell fecha={fecha} onDrop={onDrop}>
              <div className="space-y-1">
                {eventosDe(fecha).map((e) => (
                  <EventChip key={e.id} pieza={e} onSelect={onSelect} />
                ))}
              </div>
            </DayCell>
          </Card>
        );
      })}
    </div>
  );
}

// ----- Vista diaria -----

function DiaLista({
  cursor,
  eventos,
  onSelect,
}: {
  cursor: Date;
  eventos: PiezaContenido[];
  onSelect: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        {eventos.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nada programado para este día.
          </p>
        )}
        {eventos.map((e) => {
          const hora = new Date(e.fechaPublicacion).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border-l-2 border border-border bg-secondary/20 p-3 text-left transition-colors hover:bg-secondary/40",
                PLAT_COLOR[e.plataforma] ?? "border-l-primary"
              )}
            >
              <span className="w-12 shrink-0 font-display tabular-nums text-muted-foreground">
                {hora}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.tituloInterno}</p>
                <p className="truncate text-xs text-muted-foreground">“{e.hook}”</p>
              </div>
              <Badge variant="secondary">{e.plataforma}</Badge>
              <Badge variant={ESTADO_VARIANT[e.estado]} className="capitalize">
                {e.estado}
              </Badge>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ----- Panel lateral de detalle -----

function DetallePanel({
  pieza,
  open,
  onClose,
}: {
  pieza: PiezaContenido | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        {pieza && (
          <div className="space-y-5 p-6">
            <SheetHeader>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{pieza.plataforma}</Badge>
                <Badge variant={ESTADO_VARIANT[pieza.estado]} className="capitalize">
                  {pieza.estado}
                </Badge>
                <Badge variant="outline">{pieza.etapaEmbudo}</Badge>
              </div>
              <SheetTitle className="font-display text-2xl">
                {pieza.tituloInterno}
              </SheetTitle>
              <SheetDescription className="flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(pieza.fechaPublicacion).toLocaleString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="inline-flex items-center gap-1 capitalize">
                  <Film className="h-3 w-3" /> {pieza.formato}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Target className="h-3 w-3" /> {pieza.objetivo}
                </span>
                {pieza.keywordManychat && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Hash className="h-3 w-3" /> {pieza.keywordManychat}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>

            <Bloque label="Hook">{pieza.hook}</Bloque>
            <Bloque label="Guion completo">{pieza.guion}</Bloque>
            <Bloque label="Caption / Descripción">{pieza.descripcion}</Bloque>
            <Bloque label="CTA">{pieza.cta}</Bloque>
            <div className="grid grid-cols-2 gap-3">
              <Bloque label="Ángulo psicológico">{pieza.anguloPsicologico}</Bloque>
              <Bloque label="Emoción principal" capitalize>{pieza.emocion}</Bloque>
            </div>
            <Bloque label="Assets necesarios">
              {pieza.assets.length ? (
                <ul className="list-inside list-disc space-y-0.5">
                  {pieza.assets.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                "—"
              )}
            </Bloque>
            <Bloque label="Notas de grabación">
              {pieza.notasGrabacion || "—"}
            </Bloque>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Bloque({
  label,
  children,
  capitalize,
}: {
  label: string;
  children: React.ReactNode;
  capitalize?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="eyebrow">{label}</p>
      <div
        className={cn(
          "whitespace-pre-line rounded-lg bg-secondary/30 p-3 text-sm leading-relaxed text-foreground/90",
          capitalize && "capitalize"
        )}
      >
        {children}
      </div>
    </div>
  );
}
