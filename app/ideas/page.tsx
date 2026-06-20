"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  Plus,
  PenLine,
  Archive,
  MoreVertical,
  Trash2,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import {
  CATEGORIAS_IDEA,
  EMOCIONES,
  ESTADOS_IDEA,
  ETAPAS_EMBUDO,
  FORMATOS,
} from "@/lib/options";
import type { EstadoIdea, Gancho, Idea, Nicho } from "@/lib/types";
import { formatDateShort, uid } from "@/lib/utils";
import { generarIdeasConIA } from "@/lib/claude-api";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { FilterSelect, ALL } from "@/components/shared/filter-select";
import { EjemploNotice } from "@/components/shared/ejemplo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LevelBar } from "@/components/shared/level-bar";
import { Field, MiniSelect } from "@/components/shared/form-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const ESTADO_VARIANT: Record<EstadoIdea, "muted" | "success" | "default" | "secondary" | "danger" | "warning"> = {
  cruda: "muted",
  buena: "success",
  "convertir en hook": "default",
  "convertir en guion": "secondary",
  descartar: "danger",
  publicada: "warning",
};

export default function IdeasPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Ideas />
    </HydrationGate>
  );
}

function Ideas() {
  const ideas = useAppStore((s) => s.ideas);
  const [categoria, setCategoria] = useState(ALL);
  const [emocion, setEmocion] = useState(ALL);
  const [estado, setEstado] = useState(ALL);
  const [etapa, setEtapa] = useState(ALL);

  const filtradas = useMemo(
    () =>
      ideas.filter((i) => {
        if (categoria !== ALL && i.categoria !== categoria) return false;
        if (emocion !== ALL && i.emocion !== emocion) return false;
        if (estado !== ALL && i.estado !== estado) return false;
        if (etapa !== ALL && i.etapaEmbudo !== etapa) return false;
        return true;
      }),
    [ideas, categoria, emocion, estado, etapa]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 08"
        title="Biblioteca de Ideas"
        description="El cementerio de las buenas ideas es la memoria. Captura la chispa cruda antes de que se apague."
      >
        <GeneradorIdeasIA />
        <NuevaIdeaDialog />
      </PageHeader>

      {ideas.some((i) => i.origen === "Ejemplo") && (
        <EjemploNotice texto="Ideas de muestra para arrancar. Captura las tuyas con “Nueva idea” y borra estas cuando quieras." />
      )}

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <FilterSelect value={categoria} onChange={setCategoria} options={CATEGORIAS_IDEA} placeholder="Categoría" allLabel="Toda categoría" />
          <FilterSelect value={emocion} onChange={setEmocion} options={EMOCIONES} placeholder="Emoción" allLabel="Toda emoción" />
          <FilterSelect value={estado} onChange={setEstado} options={ESTADOS_IDEA} placeholder="Estado" allLabel="Todo estado" className="w-[190px]" />
          <FilterSelect value={etapa} onChange={setEtapa} options={ETAPAS_EMBUDO} placeholder="Embudo" allLabel="Todo embudo" className="w-[130px]" />
        </CardContent>
      </Card>

      <p className="mb-4 text-sm text-muted-foreground">{filtradas.length} ideas</p>

      {filtradas.length === 0 ? (
        <EmptyState icon={Lightbulb} title="Sin ideas para estos filtros" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((i) => (
            <IdeaCard key={i.id} idea={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea: i }: { idea: Idea }) {
  const router = useRouter();
  const updateIdea = useAppStore((s) => s.updateIdea);
  const removeIdea = useAppStore((s) => s.removeIdea);
  const addGancho = useAppStore((s) => s.addGancho);
  const setHookPendiente = useAppStore((s) => s.setHookPendiente);

  function aGuion() {
    setHookPendiente({ texto: i.idea, origen: "Biblioteca de Ideas", emocion: i.emocion });
    router.push("/guiones");
  }

  function aHook() {
    // "apego"/"pareja" no existen como nicho de gancho → se mapean a "relaciones".
    const nichoMap: Record<string, Nicho> = {
      apego: "relaciones",
      pareja: "relaciones",
    };
    const gancho: Gancho = {
      id: uid("g"),
      texto: i.idea,
      nicho: nichoMap[i.categoria] ?? (i.categoria as Nicho),
      emocion: i.emocion,
      tipo: "Nadie te dice esto sobre [X]",
      nivelDolor: i.nivelPotencia,
      nivelCuriosidad: i.nivelPotencia,
      formato: i.posibleFormato,
      fuente: `Idea · ${i.origen}`,
      link: "",
      vistas: 0,
      guardados: 0,
      compartidos: 0,
      fechaGuardada: new Date().toISOString().slice(0, 10),
      estado: "pendiente",
    };
    addGancho(gancho);
    updateIdea(i.id, { estado: "convertir en hook" });
  }

  return (
    <Card className="card-hover flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={ESTADO_VARIANT[i.estado]} className="capitalize">
            {i.estado}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
              {ESTADOS_IDEA.map((s) => (
                <DropdownMenuItem key={s} className="capitalize" onClick={() => updateIdea(i.id, { estado: s })}>
                  {s}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-400" onClick={() => removeIdea(i.id)}>
                <Trash2 /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="font-display text-lg leading-snug text-foreground">{i.idea}</p>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="capitalize">{i.categoria}</Badge>
          <Badge variant="outline" className="capitalize">{i.emocion}</Badge>
          <Badge variant="muted">{i.etapaEmbudo}</Badge>
          <Badge variant="muted" className="capitalize">{i.posibleFormato}</Badge>
        </div>

        <LevelBar value={i.nivelPotencia} label="Potencia" />

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{i.origen}</span>
          <span>{formatDateShort(i.fecha)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={aHook}>
            <Archive /> A gancho
          </Button>
          <Button size="sm" onClick={aGuion}>
            <PenLine /> A guion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GeneradorIdeasIA() {
  const avatar = useAppStore((s) => s.avatar);
  const playbook = useAppStore((s) => s.playbook);
  const metricas = useAppStore((s) => s.metricas);
  const competidores = useAppStore((s) => s.competidores);
  const addIdea = useAppStore((s) => s.addIdea);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const puedoGenerar = avatar && metricas.length > 0 && competidores.length > 0;

  async function generar() {
    if (!puedoGenerar) {
      setMsg({
        tipo: "error",
        texto: "Necesitas: perfil del avatar, al menos 1 métrica y 1 competidor.",
      });
      return;
    }

    setBusy(true);
    const res = await generarIdeasConIA({ avatar, metricas, competidores, playbook });
    setBusy(false);

    if (!res.ok) {
      setMsg({ tipo: "error", texto: res.error || "Error al generar ideas." });
      return;
    }

    let creadas = 0;
    for (const idea of res.ideas ?? []) {
      addIdea({
        id: uid("i"),
        idea,
        categoria: "negocio",
        emocion: "verdad",
        nivelPotencia: 8,
        etapaEmbudo: "TOFU",
        posibleFormato: "reel",
        origen: "IA (Claude)",
        fecha: new Date().toISOString().slice(0, 10),
        estado: "buena",
      });
      creadas++;
    }

    setMsg({ tipo: "ok", texto: `Generé ${creadas} ideas basadas en tu avatar y data.` });
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={generar}
        disabled={!puedoGenerar || busy}
        title={
          !puedoGenerar
            ? "Completa: Perfil del Avatar + al menos 1 métrica y 1 competidor"
            : ""
        }
      >
        {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {busy ? "Generando..." : "Generar ideas con IA"}
      </Button>

      {msg && (
        <div
          className={`fixed bottom-4 right-4 z-[60] flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            msg.tipo === "ok"
              ? "border-emerald-500/40 bg-card text-emerald-300"
              : "border-destructive/50 bg-card text-red-300"
          }`}
        >
          {msg.tipo === "ok" ? (
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span className="text-foreground/90">{msg.texto}</span>
        </div>
      )}
    </>
  );
}

function NuevaIdeaDialog() {
  const addIdea = useAppStore((s) => s.addIdea);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    idea: "",
    categoria: "ego",
    emocion: "verdad",
    nivelPotencia: 7,
    etapaEmbudo: "TOFU",
    posibleFormato: "reel",
    origen: "Idea propia",
    estado: "cruda",
  });

  function guardar() {
    if (!f.idea.trim()) return;
    addIdea({
      id: uid("i"),
      idea: f.idea.trim(),
      categoria: f.categoria as Idea["categoria"],
      emocion: f.emocion as Idea["emocion"],
      nivelPotencia: Number(f.nivelPotencia),
      etapaEmbudo: f.etapaEmbudo as Idea["etapaEmbudo"],
      posibleFormato: f.posibleFormato as Idea["posibleFormato"],
      origen: f.origen,
      fecha: new Date().toISOString().slice(0, 10),
      estado: f.estado as EstadoIdea,
    });
    setOpen(false);
    setF({ ...f, idea: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nueva idea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Capturar idea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Idea">
            <Textarea value={f.idea} onChange={(e) => setF({ ...f, idea: e.target.value })} placeholder="Esa frase suelta que no quieres olvidar…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <MiniSelect value={f.categoria} onChange={(v) => setF({ ...f, categoria: v })} options={CATEGORIAS_IDEA} />
            </Field>
            <Field label="Emoción">
              <MiniSelect value={f.emocion} onChange={(v) => setF({ ...f, emocion: v })} options={EMOCIONES} />
            </Field>
            <Field label="Etapa del embudo">
              <MiniSelect value={f.etapaEmbudo} onChange={(v) => setF({ ...f, etapaEmbudo: v })} options={ETAPAS_EMBUDO} />
            </Field>
            <Field label="Posible formato">
              <MiniSelect value={f.posibleFormato} onChange={(v) => setF({ ...f, posibleFormato: v })} options={FORMATOS} />
            </Field>
            <Field label="Estado">
              <MiniSelect value={f.estado} onChange={(v) => setF({ ...f, estado: v })} options={ESTADOS_IDEA} />
            </Field>
            <Field label="Nivel de potencia (1-10)">
              <Input type="number" min={1} max={10} value={f.nivelPotencia} onChange={(e) => setF({ ...f, nivelPotencia: Number(e.target.value) })} />
            </Field>
            <div className="col-span-2">
              <Field label="Origen">
                <Input value={f.origen} onChange={(e) => setF({ ...f, origen: e.target.value })} />
              </Field>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={guardar}>Guardar idea</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
