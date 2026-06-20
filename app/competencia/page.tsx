"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crosshair,
  ExternalLink,
  Eye,
  MessageSquare,
  Bookmark,
  Plus,
  Archive,
  PenLine,
  Sparkles,
  Trash2,
  Info,
  Users,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { NICHOS, EMOCIONES } from "@/lib/options";
import type { Competidor, ReelCompetencia } from "@/lib/types";
import { generarGuion } from "@/lib/script-generator";
import { formatDateShort, formatNumber, uid } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { Field, MiniSelect } from "@/components/shared/form-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function CompetenciaPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Competencia />
    </HydrationGate>
  );
}

function Competencia() {
  const competidores = useAppStore((s) => s.competidores);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 03"
        title="Rastreador de Competencia"
        description="No copias: diseccionas. Extrae el mecanismo psicológico y tradúcelo a tu marca."
      >
        <NuevoCompetidorDialog />
      </PageHeader>

      {/* Banner de revisión dominical */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              Ritual del domingo · 7:00 AM
            </p>
            <p className="text-muted-foreground">
              Carga los 5 reels más vistos de hasta 8 cuentas referentes. Sistema
              manual: pega links y métricas. Sin scraping ni violación de reglas de
              plataforma.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {competidores.map((c) => (
          <CompetidorCard key={c.id} competidor={c} />
        ))}
      </div>
    </div>
  );
}

function CompetidorCard({ competidor: c }: { competidor: Competidor }) {
  const removeCompetidor = useAppStore((s) => s.removeCompetidor);
  const masVisto = [...c.reels].sort((a, b) => b.vistas - a.vistas)[0];

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{c.nombre}</CardTitle>
            <Badge variant="secondary">{c.usuario}</Badge>
            <Badge variant="muted" className="capitalize">{c.nicho}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> {formatNumber(c.seguidores)} seguidores
            </span>
            <a
              href={c.linkPerfil}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              perfil <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NuevoReelDialog competidorId={c.id} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => removeCompetidor(c.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-secondary/30 p-3 text-sm">
          <p className="eyebrow mb-1">Observación estratégica</p>
          <p className="text-foreground/90">{c.observacionEstrategica}</p>
        </div>

        {masVisto && (
          <p className="text-xs text-muted-foreground">
            Reel con más vistas:{" "}
            <span className="text-foreground">{masVisto.titulo}</span> ·{" "}
            {formatNumber(masVisto.vistas)} vistas
          </p>
        )}

        <div className="grid gap-3 lg:grid-cols-2">
          {c.reels.map((r) => (
            <ReelCard key={r.id} competidorId={c.id} reel={r} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReelCard({
  competidorId,
  reel,
}: {
  competidorId: string;
  reel: ReelCompetencia;
}) {
  const router = useRouter();
  const removeReel = useAppStore((s) => s.removeReel);
  const addGancho = useAppStore((s) => s.addGancho);
  const setHookPendiente = useAppStore((s) => s.setHookPendiente);

  function guardarEnBaul() {
    addGancho({
      id: uid("g"),
      texto: reel.hook,
      nicho: "conciencia",
      emocion: reel.emocionDominante,
      tipo: "Nadie te dice esto sobre [X]",
      nivelDolor: 7,
      nivelCuriosidad: 8,
      formato: "reel",
      fuente: `Competencia · ${reel.titulo}`,
      link: reel.link,
      vistas: reel.vistas,
      guardados: reel.guardados ?? 0,
      compartidos: 0,
      fechaGuardada: new Date().toISOString().slice(0, 10),
      estado: "adaptar",
    });
  }

  function convertirEnGuion() {
    setHookPendiente({
      texto: reel.hook,
      origen: `Competencia · ${reel.titulo}`,
      emocion: reel.emocionDominante,
    });
    router.push("/guiones");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-base leading-snug">{reel.titulo}</p>
        <Badge variant="outline" className="shrink-0 capitalize">
          {reel.emocionDominante}
        </Badge>
      </div>

      <p className="rounded-md bg-background/40 px-2.5 py-1.5 text-sm text-foreground/90">
        “{reel.hook}”
      </p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <Meta label="Tema" value={reel.temaCentral} />
        <Meta label="CTA" value={reel.cta} />
        <Meta label="Estructura" value={reel.estructura} full />
      </dl>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" /> {formatNumber(reel.vistas)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> {formatNumber(reel.comentarios)}
        </span>
        {reel.guardados != null && (
          <span className="inline-flex items-center gap-1">
            <Bookmark className="h-3 w-3" /> {formatNumber(reel.guardados)}
          </span>
        )}
        <span className="ml-auto">{formatDateShort(reel.fechaPublicacion)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={guardarEnBaul}>
          <Archive /> Guardar en Baúl
        </Button>
        <Button variant="outline" size="sm" onClick={convertirEnGuion}>
          <PenLine /> Convertir en guion
        </Button>
        <VersionAvatarDialog reel={reel} />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => removeReel(competidorId, reel.id)}
        >
          <Trash2 /> Descartar
        </Button>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground/90">{value}</dd>
    </div>
  );
}

/** "Crear versión para mi avatar": descompone y adapta, sin copia literal. */
function VersionAvatarDialog({ reel }: { reel: ReelCompetencia }) {
  const router = useRouter();
  const setHookPendiente = useAppStore((s) => s.setHookPendiente);
  const [open, setOpen] = useState(false);

  const adaptado = generarGuion(
    {
      hook: `Para el que funciona por fuera: ${reel.tipoDolor.toLowerCase()} no es debilidad, es información.`,
      tema: reel.temaCentral,
      emocion: reel.emocionDominante,
      avatar: "Emprendedor/dueño que aparenta estar bien",
      formato: "Reel 60s",
      duracion: "60s",
      objetivo: "DM",
      etapaEmbudo: "TOFU",
    },
    "base"
  );

  const descomposicion = [
    { label: "Mecanismo psicológico", value: reel.mecanismoPsicologico },
    { label: "Estructura narrativa", value: reel.estructuraNarrativa },
    { label: "Emoción", value: reel.emocionDominante },
    { label: "Tensión", value: reel.tensión },
    { label: "Tipo de promesa", value: reel.tipoPromesa },
    { label: "Tipo de dolor", value: reel.tipoDolor },
  ];

  function enviarAGuiones() {
    setHookPendiente({
      texto: adaptado.bloques[0].contenido,
      origen: `Versión adaptada de "${reel.titulo}"`,
      emocion: reel.emocionDominante,
    });
    setOpen(false);
    router.push("/guiones");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Sparkles /> Versión para mi avatar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adaptación a la marca · sin copia literal</DialogTitle>
          <DialogDescription>
            Se extrae el ADN del reel y se traduce a la voz @lesterkhaos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="eyebrow">ADN extraído</p>
            {descomposicion.map((d) => (
              <div key={d.label} className="rounded-md bg-secondary/40 p-2.5 text-xs">
                <p className="text-muted-foreground">{d.label}</p>
                <p className="capitalize text-foreground/90">{d.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="eyebrow">Versión adaptada</p>
            <div className="space-y-2 rounded-md border border-border bg-background/40 p-3">
              {adaptado.bloques.map((b) => (
                <div key={b.paso}>
                  <p className="text-[10px] uppercase tracking-wide text-primary">
                    {b.paso}
                  </p>
                  <p className="whitespace-pre-line text-sm text-foreground/90">
                    {b.contenido}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
          <Button onClick={enviarAGuiones}>
            <PenLine /> Enviar al Generador de Guiones
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NuevoCompetidorDialog() {
  const addCompetidor = useAppStore((s) => s.addCompetidor);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    nombre: "",
    usuario: "@",
    nicho: "conciencia",
    seguidores: 0,
    linkPerfil: "",
    observacionEstrategica: "",
  });

  function guardar() {
    if (!f.nombre.trim()) return;
    addCompetidor({
      id: uid("c"),
      nombre: f.nombre.trim(),
      usuario: f.usuario,
      nicho: f.nicho as Competidor["nicho"],
      seguidores: Number(f.seguidores),
      linkPerfil: f.linkPerfil,
      observacionEstrategica: f.observacionEstrategica,
      reels: [],
    });
    setOpen(false);
    setF({ ...f, nombre: "", usuario: "@", seguidores: 0, linkPerfil: "", observacionEstrategica: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Competidor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar cuenta a rastrear</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre">
            <Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
          </Field>
          <Field label="Usuario">
            <Input value={f.usuario} onChange={(e) => setF({ ...f, usuario: e.target.value })} />
          </Field>
          <Field label="Nicho">
            <MiniSelect value={f.nicho} onChange={(v) => setF({ ...f, nicho: v })} options={NICHOS} />
          </Field>
          <Field label="Seguidores">
            <Input type="number" value={f.seguidores} onChange={(e) => setF({ ...f, seguidores: Number(e.target.value) })} />
          </Field>
          <div className="col-span-2">
            <Field label="Link del perfil">
              <Input value={f.linkPerfil} onChange={(e) => setF({ ...f, linkPerfil: e.target.value })} placeholder="https://instagram.com/…" />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Observación estratégica">
              <Textarea value={f.observacionEstrategica} onChange={(e) => setF({ ...f, observacionEstrategica: e.target.value })} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={guardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NuevoReelDialog({ competidorId }: { competidorId: string }) {
  const addReel = useAppStore((s) => s.addReel);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    titulo: "",
    hook: "",
    temaCentral: "",
    emocionDominante: "verdad",
    estructura: "",
    cta: "",
    vistas: 0,
    comentarios: 0,
    guardados: 0,
    link: "",
  });

  function guardar() {
    if (!f.hook.trim()) return;
    addReel(competidorId, {
      id: uid("cr"),
      titulo: f.titulo || f.hook.slice(0, 40),
      hook: f.hook,
      temaCentral: f.temaCentral,
      emocionDominante: f.emocionDominante as ReelCompetencia["emocionDominante"],
      estructura: f.estructura,
      cta: f.cta,
      vistas: Number(f.vistas),
      comentarios: Number(f.comentarios),
      guardados: Number(f.guardados),
      fechaPublicacion: new Date().toISOString().slice(0, 10),
      link: f.link,
      mecanismoPsicologico: "Por analizar",
      estructuraNarrativa: f.estructura || "Por analizar",
      tensión: "Por analizar",
      tipoPromesa: "Por analizar",
      tipoDolor: "Por analizar",
    });
    setOpen(false);
    setF({ ...f, titulo: "", hook: "", temaCentral: "", estructura: "", cta: "", vistas: 0, comentarios: 0, guardados: 0, link: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus /> Pegar reel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Cargar reel manualmente</DialogTitle>
          <DialogDescription>
            Pega el link y las métricas que veas en el reel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Hook usado">
              <Textarea value={f.hook} onChange={(e) => setF({ ...f, hook: e.target.value })} />
            </Field>
          </div>
          <Field label="Tema central">
            <Input value={f.temaCentral} onChange={(e) => setF({ ...f, temaCentral: e.target.value })} />
          </Field>
          <Field label="Emoción dominante">
            <MiniSelect value={f.emocionDominante} onChange={(v) => setF({ ...f, emocionDominante: v })} options={EMOCIONES} />
          </Field>
          <div className="col-span-2">
            <Field label="Estructura del reel">
              <Input value={f.estructura} onChange={(e) => setF({ ...f, estructura: e.target.value })} placeholder="Hook → desarrollo → giro → CTA" />
            </Field>
          </div>
          <Field label="CTA">
            <Input value={f.cta} onChange={(e) => setF({ ...f, cta: e.target.value })} />
          </Field>
          <Field label="Vistas">
            <Input type="number" value={f.vistas} onChange={(e) => setF({ ...f, vistas: Number(e.target.value) })} />
          </Field>
          <Field label="Comentarios">
            <Input type="number" value={f.comentarios} onChange={(e) => setF({ ...f, comentarios: Number(e.target.value) })} />
          </Field>
          <Field label="Guardados">
            <Input type="number" value={f.guardados} onChange={(e) => setF({ ...f, guardados: Number(e.target.value) })} />
          </Field>
          <div className="col-span-2">
            <Field label="Link del reel">
              <Input value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://…" />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={guardar}>Guardar reel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
