"use client";

import { useMemo, useState } from "react";
import {
  Send,
  Plus,
  Wand2,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Target,
  Hash,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import {
  ESTADOS_PIEZA,
  OBJETIVOS,
  PLATAFORMAS,
  FORMATOS,
  EMOCIONES,
  ETAPAS_EMBUDO,
} from "@/lib/options";
import type { EstadoPieza, PiezaContenido } from "@/lib/types";
import {
  generarCopy,
  ETIQUETAS_PLATAFORMA,
  type CopyMultiplataforma,
} from "@/lib/platform-copy";
import { uid } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { FilterSelect, ALL } from "@/components/shared/filter-select";
import { EjemploNotice } from "@/components/shared/ejemplo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Field, MiniSelect } from "@/components/shared/form-bits";
import { CopyButton } from "@/components/shared/copy-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const ESTADO_VARIANT: Record<EstadoPieza, "muted" | "warning" | "secondary" | "success" | "default" | "viral"> = {
  idea: "muted",
  guion: "secondary",
  grabado: "warning",
  editado: "warning",
  programado: "default",
  publicado: "success",
};

export default function CommunityPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Community />
    </HydrationGate>
  );
}

function Community() {
  const piezas = useAppStore((s) => s.piezas);
  const [plataforma, setPlataforma] = useState(ALL);
  const [estado, setEstado] = useState(ALL);
  const [objetivo, setObjetivo] = useState(ALL);

  const filtradas = useMemo(
    () =>
      piezas.filter((p) => {
        if (plataforma !== ALL && p.plataforma !== plataforma) return false;
        if (estado !== ALL && p.estado !== estado) return false;
        if (objetivo !== ALL && p.objetivo !== objetivo) return false;
        return true;
      }),
    [piezas, plataforma, estado, objetivo]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 04"
        title="Community Manager"
        description="Una idea, todas las plataformas. El copy se adapta al canal sin perder la voz."
      >
        <NuevaPiezaDialog />
      </PageHeader>

      {piezas.some((p) => /^p_\d{3}$/.test(p.id)) && (
        <EjemploNotice texto="Piezas de ejemplo (compartidas con el Calendario). Crea las tuyas con “Nueva pieza” y borra estas." />
      )}

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <FilterSelect value={plataforma} onChange={setPlataforma} options={PLATAFORMAS} placeholder="Plataforma" allLabel="Todas las plataformas" className="w-[200px]" />
          <FilterSelect value={estado} onChange={setEstado} options={ESTADOS_PIEZA} placeholder="Estado" allLabel="Todo estado" />
          <FilterSelect value={objetivo} onChange={setObjetivo} options={OBJETIVOS} placeholder="Objetivo" allLabel="Todo objetivo" />
        </CardContent>
      </Card>

      {filtradas.length === 0 ? (
        <EmptyState icon={Send} title="Sin piezas" description="Crea una pieza nueva para empezar a preparar tus publicaciones." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((p) => (
            <PiezaCard key={p.id} pieza={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PiezaCard({ pieza: p }: { pieza: PiezaContenido }) {
  const updatePieza = useAppStore((s) => s.updatePieza);
  const removePieza = useAppStore((s) => s.removePieza);

  return (
    <Card className="card-hover flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary">{p.plataforma}</Badge>
          <div className="flex items-center gap-1.5">
            <Badge variant={ESTADO_VARIANT[p.estado]} className="capitalize">
              {p.estado}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                {ESTADOS_PIEZA.map((s) => (
                  <DropdownMenuItem key={s} className="capitalize" onClick={() => updatePieza(p.id, { estado: s })}>
                    {s}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400" onClick={() => removePieza(p.id)}>
                  <Trash2 /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm font-medium text-foreground">{p.tituloInterno}</p>
        <p className="font-display text-base leading-snug text-foreground/90">
          “{p.hook}”
        </p>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-0.5 text-muted-foreground">
            <Target className="h-3 w-3" /> {p.objetivo}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-0.5 text-muted-foreground capitalize">
            {p.formato}
          </span>
          {p.keywordManychat && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-primary">
              <Hash className="h-3 w-3" /> {p.keywordManychat}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
          <CopyDialog pieza={p} />
          <Button
            size="sm"
            variant={p.estado === "publicado" ? "secondary" : "default"}
            className="flex-1"
            onClick={() =>
              updatePieza(p.id, {
                estado: p.estado === "publicado" ? "publicado" : "programado",
              })
            }
            disabled={p.estado === "publicado" || p.estado === "programado"}
          >
            <CheckCircle2 />
            {p.estado === "programado" || p.estado === "publicado"
              ? "Listo para publicar"
              : "Marcar listo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CopyDialog({ pieza }: { pieza: PiezaContenido }) {
  const copy = generarCopy(pieza);
  const orden: (keyof CopyMultiplataforma)[] = [
    "instagram",
    "tiktok",
    "youtubeShorts",
    "threads",
    "whatsapp",
    "emailSubject",
    "emailBody",
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wand2 /> Generar copy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto scroll-thin">
        <DialogHeader>
          <DialogTitle>Copy multiplataforma</DialogTitle>
          <DialogDescription>
            Generado en la voz @lesterkhaos. Crudo, humano, sin humo. Copia y ajusta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {orden.map((k) => (
            <div key={k} className="rounded-lg border border-border bg-secondary/20 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="eyebrow">{ETIQUETAS_PLATAFORMA[k]}</p>
                <CopyButton text={copy[k]} />
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {copy[k]}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NuevaPiezaDialog() {
  const addPieza = useAppStore((s) => s.addPieza);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    tituloInterno: "",
    hook: "",
    guion: "",
    descripcion: "",
    cta: "",
    keywordManychat: "",
    plataforma: "Instagram",
    estado: "idea",
    objetivo: "DM",
    formato: "reel",
    emocion: "verdad",
    etapaEmbudo: "TOFU",
    anguloPsicologico: "",
    fecha: new Date().toISOString().slice(0, 16),
  });

  function guardar() {
    if (!f.hook.trim()) return;
    addPieza({
      id: uid("p"),
      tituloInterno: f.tituloInterno || f.hook.slice(0, 40),
      hook: f.hook,
      guion: f.guion,
      descripcion: f.descripcion,
      cta: f.cta,
      keywordManychat: f.keywordManychat,
      plataforma: f.plataforma as PiezaContenido["plataforma"],
      estado: f.estado as EstadoPieza,
      fechaPublicacion: new Date(f.fecha).toISOString(),
      objetivo: f.objetivo as PiezaContenido["objetivo"],
      formato: f.formato as PiezaContenido["formato"],
      anguloPsicologico: f.anguloPsicologico,
      emocion: f.emocion as PiezaContenido["emocion"],
      etapaEmbudo: f.etapaEmbudo as PiezaContenido["etapaEmbudo"],
      assets: [],
      notasGrabacion: "",
    });
    setOpen(false);
    setF({ ...f, tituloInterno: "", hook: "", guion: "", descripcion: "", cta: "", keywordManychat: "", anguloPsicologico: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nueva pieza
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto scroll-thin">
        <DialogHeader>
          <DialogTitle>Nueva pieza de contenido</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Título interno">
              <Input value={f.tituloInterno} onChange={(e) => setF({ ...f, tituloInterno: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Hook">
              <Textarea value={f.hook} onChange={(e) => setF({ ...f, hook: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Descripción">
              <Textarea value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Ángulo psicológico">
              <Input value={f.anguloPsicologico} onChange={(e) => setF({ ...f, anguloPsicologico: e.target.value })} />
            </Field>
          </div>
          <Field label="CTA">
            <Input value={f.cta} onChange={(e) => setF({ ...f, cta: e.target.value })} />
          </Field>
          <Field label="Keyword ManyChat">
            <Input value={f.keywordManychat} onChange={(e) => setF({ ...f, keywordManychat: e.target.value })} />
          </Field>
          <Field label="Plataforma">
            <MiniSelect value={f.plataforma} onChange={(v) => setF({ ...f, plataforma: v })} options={PLATAFORMAS} />
          </Field>
          <Field label="Estado">
            <MiniSelect value={f.estado} onChange={(v) => setF({ ...f, estado: v })} options={ESTADOS_PIEZA} />
          </Field>
          <Field label="Objetivo">
            <MiniSelect value={f.objetivo} onChange={(v) => setF({ ...f, objetivo: v })} options={OBJETIVOS} />
          </Field>
          <Field label="Formato">
            <MiniSelect value={f.formato} onChange={(v) => setF({ ...f, formato: v })} options={FORMATOS} />
          </Field>
          <Field label="Emoción">
            <MiniSelect value={f.emocion} onChange={(v) => setF({ ...f, emocion: v })} options={EMOCIONES} />
          </Field>
          <Field label="Etapa del embudo">
            <MiniSelect value={f.etapaEmbudo} onChange={(v) => setF({ ...f, etapaEmbudo: v })} options={ETAPAS_EMBUDO} />
          </Field>
          <div className="col-span-2">
            <Field label="Fecha de publicación">
              <Input type="datetime-local" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={guardar}>Guardar pieza</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
