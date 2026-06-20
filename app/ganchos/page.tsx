"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Search,
  Plus,
  ArrowUpDown,
  ExternalLink,
  Eye,
  Bookmark,
  Share2,
  Wand2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import {
  EMOCIONES,
  ESTADOS_GANCHO_LIST,
  FORMATOS,
  NICHOS,
  TIPOS_GANCHO,
} from "@/lib/options";
import type { EstadoGancho, Gancho } from "@/lib/types";
import { formatDateShort, formatNumber, uid } from "@/lib/utils";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const ESTADO_VARIANT: Record<EstadoGancho, "viral" | "success" | "warning" | "muted" | "danger"> = {
  viral: "viral",
  probado: "success",
  pendiente: "warning",
  adaptar: "muted",
  descartar: "danger",
};

export default function GanchosPage() {
  return (
    <HydrationGate fallback={<Skeleton />}>
      <Ganchos />
    </HydrationGate>
  );
}

function Ganchos() {
  const router = useRouter();
  const ganchos = useAppStore((s) => s.ganchos);
  const updateGancho = useAppStore((s) => s.updateGancho);
  const removeGancho = useAppStore((s) => s.removeGancho);
  const setHookPendiente = useAppStore((s) => s.setHookPendiente);

  const [q, setQ] = useState("");
  const [nicho, setNicho] = useState(ALL);
  const [emocion, setEmocion] = useState(ALL);
  const [tipo, setTipo] = useState(ALL);
  const [formato, setFormato] = useState(ALL);
  const [estado, setEstado] = useState(ALL);
  const [ordenVistas, setOrdenVistas] = useState(false);

  const filtrados = useMemo(() => {
    let r = ganchos.filter((g) => {
      if (q && !`${g.texto} ${g.fuente}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (nicho !== ALL && g.nicho !== nicho) return false;
      if (emocion !== ALL && g.emocion !== emocion) return false;
      if (tipo !== ALL && g.tipo !== tipo) return false;
      if (formato !== ALL && g.formato !== formato) return false;
      if (estado !== ALL && g.estado !== estado) return false;
      return true;
    });
    if (ordenVistas) r = [...r].sort((a, b) => b.vistas - a.vistas);
    return r;
  }, [ganchos, q, nicho, emocion, tipo, formato, estado, ordenVistas]);

  function usarGancho(g: Gancho) {
    setHookPendiente({
      texto: g.texto,
      origen: `Baúl de Ganchos · ${g.fuente}`,
      emocion: g.emocion,
      nicho: g.nicho,
    });
    router.push("/guiones");
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 01"
        title="Baúl de Ganchos"
        description="Guarda, clasifica, busca y reutiliza hooks potentes. El gancho correcto decide si te ven o te ignoran."
      >
        <NuevoGanchoDialog />
      </PageHeader>

      {ganchos.some((g) => g.fuente === "Ejemplo") && (
        <EjemploNotice texto="Estos ganchos son plantillas de inspiración. Usa “Usar este gancho”, edítalos o bórralos y guarda los tuyos." />
      )}

      {/* Barra de filtros */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por texto o fuente…"
              className="pl-9"
            />
          </div>
          <FilterSelect value={nicho} onChange={setNicho} options={NICHOS} placeholder="Nicho" allLabel="Todos los nichos" />
          <FilterSelect value={emocion} onChange={setEmocion} options={EMOCIONES} placeholder="Emoción" allLabel="Toda emoción" />
          <FilterSelect value={tipo} onChange={setTipo} options={TIPOS_GANCHO} placeholder="Tipo" allLabel="Todo tipo" className="w-[180px]" />
          <FilterSelect value={formato} onChange={setFormato} options={FORMATOS} placeholder="Formato" allLabel="Todo formato" className="w-[140px]" />
          <FilterSelect value={estado} onChange={setEstado} options={ESTADOS_GANCHO_LIST} placeholder="Estado" allLabel="Todo estado" className="w-[140px]" />
          <Button
            variant={ordenVistas ? "default" : "outline"}
            size="sm"
            onClick={() => setOrdenVistas((v) => !v)}
          >
            <ArrowUpDown /> Vistas
          </Button>
        </CardContent>
      </Card>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtrados.length} ganchos
      </p>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Sin ganchos para estos filtros"
          description="Ajusta los filtros o agrega un gancho nuevo al baúl."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((g) => (
            <Card key={g.id} className="card-hover flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={ESTADO_VARIANT[g.estado]} className="capitalize">
                    {g.estado}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                      {ESTADOS_GANCHO_LIST.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          className="capitalize"
                          onClick={() => updateGancho(g.id, { estado: s })}
                        >
                          {s}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-400"
                        onClick={() => removeGancho(g.id)}
                      >
                        <Trash2 /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="font-display text-lg leading-snug text-foreground">
                  “{g.texto}”
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="capitalize">{g.nicho}</Badge>
                  <Badge variant="outline" className="capitalize">{g.emocion}</Badge>
                  <Badge variant="muted">{g.formato}</Badge>
                </div>

                <p className="rounded-md bg-secondary/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                  Tipo: <span className="text-foreground">{g.tipo}</span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <LevelBar value={g.nivelDolor} label="Dolor" />
                  <LevelBar value={g.nivelCuriosidad} label="Curiosidad" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <Stat icon={Eye} value={g.vistas} />
                  <Stat icon={Bookmark} value={g.guardados} />
                  <Stat icon={Share2} value={g.compartidos} />
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="truncate">{g.fuente}</span>
                  <a
                    href={g.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    original <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Guardado {formatDateShort(g.fechaGuardada)}
                  </span>
                  <Button size="sm" onClick={() => usarGancho(g)}>
                    <Wand2 /> Usar este gancho
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, value }: { icon: typeof Eye; value: number }) {
  return (
    <div className="rounded-md bg-secondary/40 py-1.5">
      <Icon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
      <p className="mt-0.5 font-medium tabular-nums">{formatNumber(value)}</p>
    </div>
  );
}

function NuevoGanchoDialog() {
  const addGancho = useAppStore((s) => s.addGancho);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    texto: "",
    nicho: "ego",
    emocion: "verdad",
    tipo: TIPOS_GANCHO[0] as string,
    formato: "reel",
    estado: "pendiente",
    fuente: "@lesterkhaos",
    link: "",
    nivelDolor: 7,
    nivelCuriosidad: 7,
  });

  function guardar() {
    if (!form.texto.trim()) return;
    addGancho({
      id: uid("g"),
      texto: form.texto.trim(),
      nicho: form.nicho as Gancho["nicho"],
      emocion: form.emocion as Gancho["emocion"],
      tipo: form.tipo as Gancho["tipo"],
      formato: form.formato as Gancho["formato"],
      estado: form.estado as EstadoGancho,
      fuente: form.fuente || "@lesterkhaos",
      link: form.link,
      nivelDolor: Number(form.nivelDolor),
      nivelCuriosidad: Number(form.nivelCuriosidad),
      vistas: 0,
      guardados: 0,
      compartidos: 0,
      fechaGuardada: new Date().toISOString().slice(0, 10),
    });
    setOpen(false);
    setForm((f) => ({ ...f, texto: "", link: "" }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nuevo gancho
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agregar gancho al baúl</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Texto del gancho">
            <Textarea
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
              placeholder="No estás cansado, estás…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nicho">
              <MiniSelect value={form.nicho} onChange={(v) => setForm({ ...form, nicho: v })} options={NICHOS} />
            </Field>
            <Field label="Emoción">
              <MiniSelect value={form.emocion} onChange={(v) => setForm({ ...form, emocion: v })} options={EMOCIONES} />
            </Field>
            <Field label="Tipo de gancho">
              <MiniSelect value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} options={TIPOS_GANCHO} />
            </Field>
            <Field label="Formato">
              <MiniSelect value={form.formato} onChange={(v) => setForm({ ...form, formato: v })} options={FORMATOS} />
            </Field>
            <Field label="Estado">
              <MiniSelect value={form.estado} onChange={(v) => setForm({ ...form, estado: v })} options={ESTADOS_GANCHO_LIST} />
            </Field>
            <Field label="Fuente / creador">
              <Input value={form.fuente} onChange={(e) => setForm({ ...form, fuente: e.target.value })} />
            </Field>
            <Field label="Nivel de dolor (1-10)">
              <Input type="number" min={1} max={10} value={form.nivelDolor} onChange={(e) => setForm({ ...form, nivelDolor: Number(e.target.value) })} />
            </Field>
            <Field label="Nivel de curiosidad (1-10)">
              <Input type="number" min={1} max={10} value={form.nivelCuriosidad} onChange={(e) => setForm({ ...form, nivelCuriosidad: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Link del contenido original">
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={guardar}>Guardar gancho</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Skeleton() {
  return <div className="h-screen animate-pulse" />;
}
