"use client";

import { useState } from "react";
import {
  Eye,
  UserPlus,
  MessageCircle,
  Bookmark,
  Share2,
  Target,
  MessagesSquare,
  Flame,
  Repeat,
  Ban,
  Heart,
  Plus,
  BarChart3,
  Instagram,
  RefreshCw,
  Settings2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { syncInstagram } from "@/lib/instagram";
import {
  agregar,
  enVentana,
  esBombazo,
  tasaConversacion,
  tasaConversionLead,
  topPor,
  umbralBombazo,
  type Ventana,
} from "@/lib/metrics";
import type { PiezaMetrica } from "@/lib/types";
import { EMOCIONES, FORMATOS, PLATAFORMAS, TIPOS_GANCHO } from "@/lib/options";
import { formatDateTime, formatNumber, formatPercent, uid } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { StatCard } from "@/components/shared/stat-card";
import { Sparkline } from "@/components/shared/sparkline";
import { EmptyState } from "@/components/shared/empty-state";
import { Field, MiniSelect } from "@/components/shared/form-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const CRITERIOS: { key: keyof PiezaMetrica; label: string }[] = [
  { key: "vistas", label: "Vistas" },
  { key: "guardados", label: "Guardados" },
  { key: "compartidos", label: "Compartidos" },
  { key: "dms", label: "DMs" },
  { key: "leads", label: "Leads" },
];

export default function MetricasPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Metricas />
    </HydrationGate>
  );
}

function Metricas() {
  const metricas = useAppStore((s) => s.metricas);
  const [ventana, setVentana] = useState<Ventana>(30);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 02"
        title="Métricas"
        description="No mides vanidad: mides señales de conversación. Vistas que no abren un DM son ruido."
      >
        <InstagramSync />
        <RegistrarPiezaDialog />
      </PageHeader>

      {metricas.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Aún no hay métricas reales"
          description="Este módulo arranca vacío a propósito: aquí solo van tus datos reales, nada inventado. Registra una pieza publicada con sus números y empezarás a ver tarjetas, bombazos y tu top 5."
        >
          <RegistrarPiezaDialog />
        </EmptyState>
      ) : (
        <Tabs
          value={String(ventana)}
          onValueChange={(v) => setVentana(Number(v) as Ventana)}
        >
          <TabsList>
            <TabsTrigger value="7">7 días</TabsTrigger>
            <TabsTrigger value="30">30 días</TabsTrigger>
            <TabsTrigger value="90">90 días</TabsTrigger>
          </TabsList>

          {[7, 30, 90].map((d) => (
            <TabsContent key={d} value={String(d)}>
              <VentanaPanel piezas={metricas} dias={d as Ventana} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

/** Conexión y sincronización con Instagram (API de Meta). */
function InstagramSync() {
  const ig = useAppStore((s) => s.instagram);
  const setInstagramConfig = useAppStore((s) => s.setInstagramConfig);
  const disconnectInstagram = useAppStore((s) => s.disconnectInstagram);
  const importMetricas = useAppStore((s) => s.importMetricas);

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(ig.token);
  const [userId, setUserId] = useState(ig.userId);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  function flash(tipo: "ok" | "error", texto: string) {
    setMsg({ tipo, texto });
    window.setTimeout(() => setMsg(null), 6000);
  }

  async function conectar() {
    if (!token.trim()) {
      flash("error", "Pega el token de acceso.");
      return;
    }
    setBusy(true);
    const r = await syncInstagram(token.trim(), userId.trim());
    setBusy(false);
    if (!r.ok) {
      flash("error", r.error ?? "No se pudo conectar.");
      return;
    }
    setInstagramConfig({ connected: true, token: token.trim(), userId: userId.trim() });
    const nuevas = importMetricas(r.items ?? []);
    setOpen(false);
    flash("ok", `Conectado. Importé ${r.count} piezas (${nuevas} nuevas).`);
  }

  async function sincronizar() {
    setBusy(true);
    const r = await syncInstagram(ig.token, ig.userId);
    setBusy(false);
    if (!r.ok) {
      flash("error", r.error ?? "Error al sincronizar.");
      return;
    }
    const nuevas = importMetricas(r.items ?? []);
    flash("ok", `Sincronizado: ${r.count} piezas (${nuevas} nuevas).`);
  }

  return (
    <>
      {ig.connected ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={sincronizar} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Sincronizar
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="Ajustes de conexión">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Instagram /> Conectar Instagram
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-primary" /> Conectar Instagram
            </DialogTitle>
            <DialogDescription>
              Pega tu token de acceso de Instagram. Con el método “Generate
              Instagram Access Token” el ID es opcional (déjalo vacío). Los datos
              quedan guardados solo en este navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Field label="Token de acceso">
              <Textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="IGAA… o EAAG… (token de Meta)"
                className="min-h-[90px] font-mono text-xs"
              />
            </Field>
            <Field label="Instagram Business Account ID (opcional)">
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Déjalo vacío si usaste Instagram Login"
              />
            </Field>
            <p className="rounded-md bg-secondary/40 p-2.5 text-xs text-muted-foreground">
              ¿No tienes el token? Te dejé la guía clic por clic en el chat y en el
              archivo <span className="text-foreground">CLAUDE.md</span> →
              “Conectar Instagram”. El token suele durar ~60 días; cuando caduque,
              vuelve aquí y pega uno nuevo.
            </p>

            {ig.connected && (
              <div className="flex items-center justify-between rounded-md border border-border p-2.5 text-xs">
                <span className="text-muted-foreground">
                  {ig.lastSync
                    ? `Última sincronización: ${formatDateTime(ig.lastSync)}`
                    : "Conectado, sin sincronizar aún."}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() => {
                    disconnectInstagram();
                    setToken("");
                    setUserId("");
                    setOpen(false);
                    flash("ok", "Instagram desconectado.");
                  }}
                >
                  Desconectar
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={conectar} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              {ig.connected ? "Guardar y sincronizar" : "Conectar y sincronizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aviso flotante de resultado */}
      {msg && (
        <div
          className={`fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            msg.tipo === "ok"
              ? "border-emerald-500/40 bg-card text-emerald-300"
              : "border-destructive/50 bg-card text-red-300"
          }`}
        >
          {msg.tipo === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span className="text-foreground/90">{msg.texto}</span>
        </div>
      )}
    </>
  );
}

/** Formulario para registrar las métricas reales de una pieza publicada. */
function RegistrarPiezaDialog() {
  const addMetrica = useAppStore((s) => s.addMetrica);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    titulo: "",
    plataforma: "Instagram",
    formato: "reel",
    fecha: new Date().toISOString().slice(0, 10),
    emocion: "verdad",
    tipoHook: TIPOS_GANCHO[5] as string,
    vistas: 0,
    likes: 0,
    comentarios: 0,
    guardados: 0,
    compartidos: 0,
    seguidoresNuevos: 0,
    dms: 0,
    clicsPerfil: 0,
    respuestasStories: 0,
    keywordsManychat: 0,
    leads: 0,
    llamadas: 0,
    ventas: 0,
    porQueFunciono: "",
    emocionTocada: "",
    queRepetir: "",
    queEvitar: "",
  });

  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: Number(e.target.value) } as typeof f);

  function guardar() {
    if (!f.titulo.trim()) return;
    addMetrica({
      id: uid("m"),
      titulo: f.titulo.trim(),
      plataforma: f.plataforma as PiezaMetrica["plataforma"],
      formato: f.formato as PiezaMetrica["formato"],
      fecha: f.fecha,
      emocion: f.emocion as PiezaMetrica["emocion"],
      tipoHook: f.tipoHook as PiezaMetrica["tipoHook"],
      vistas: f.vistas,
      likes: f.likes,
      comentarios: f.comentarios,
      guardados: f.guardados,
      compartidos: f.compartidos,
      seguidoresNuevos: f.seguidoresNuevos,
      dms: f.dms,
      clicsPerfil: f.clicsPerfil,
      respuestasStories: f.respuestasStories,
      keywordsManychat: f.keywordsManychat,
      leads: f.leads,
      llamadas: f.llamadas,
      ventas: f.ventas,
      porQueFunciono: f.porQueFunciono,
      emocionTocada: f.emocionTocada,
      queRepetir: f.queRepetir,
      queEvitar: f.queEvitar,
    });
    setOpen(false);
    setF({ ...f, titulo: "", vistas: 0, likes: 0, comentarios: 0, guardados: 0, compartidos: 0, seguidoresNuevos: 0, dms: 0, clicsPerfil: 0, respuestasStories: 0, keywordsManychat: 0, leads: 0, llamadas: 0, ventas: 0, porQueFunciono: "", emocionTocada: "", queRepetir: "", queEvitar: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Registrar pieza
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto scroll-thin">
        <DialogHeader>
          <DialogTitle>Registrar métricas de una pieza</DialogTitle>
          <DialogDescription>
            Pon los números reales de una publicación tuya. Mientras una API no
            esté conectada, los cargas a mano aquí.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-3">
            <Field label="Título de la pieza">
              <Input value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ej: Reel — No es disciplina" />
            </Field>
          </div>
          <Field label="Plataforma">
            <MiniSelect value={f.plataforma} onChange={(v) => setF({ ...f, plataforma: v })} options={PLATAFORMAS} />
          </Field>
          <Field label="Formato">
            <MiniSelect value={f.formato} onChange={(v) => setF({ ...f, formato: v })} options={FORMATOS} />
          </Field>
          <Field label="Fecha">
            <Input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
          </Field>
          <Field label="Emoción">
            <MiniSelect value={f.emocion} onChange={(v) => setF({ ...f, emocion: v })} options={EMOCIONES} />
          </Field>
          <div className="col-span-2">
            <Field label="Tipo de hook">
              <MiniSelect value={f.tipoHook} onChange={(v) => setF({ ...f, tipoHook: v })} options={TIPOS_GANCHO} />
            </Field>
          </div>

          <Field label="Vistas"><Input type="number" value={f.vistas} onChange={num("vistas")} /></Field>
          <Field label="Likes"><Input type="number" value={f.likes} onChange={num("likes")} /></Field>
          <Field label="Comentarios"><Input type="number" value={f.comentarios} onChange={num("comentarios")} /></Field>
          <Field label="Guardados"><Input type="number" value={f.guardados} onChange={num("guardados")} /></Field>
          <Field label="Compartidos"><Input type="number" value={f.compartidos} onChange={num("compartidos")} /></Field>
          <Field label="Seguidores nuevos"><Input type="number" value={f.seguidoresNuevos} onChange={num("seguidoresNuevos")} /></Field>
          <Field label="DMs recibidos"><Input type="number" value={f.dms} onChange={num("dms")} /></Field>
          <Field label="Clics al perfil"><Input type="number" value={f.clicsPerfil} onChange={num("clicsPerfil")} /></Field>
          <Field label="Respuestas a stories"><Input type="number" value={f.respuestasStories} onChange={num("respuestasStories")} /></Field>
          <Field label="Keywords ManyChat"><Input type="number" value={f.keywordsManychat} onChange={num("keywordsManychat")} /></Field>
          <Field label="Leads"><Input type="number" value={f.leads} onChange={num("leads")} /></Field>
          <Field label="Llamadas"><Input type="number" value={f.llamadas} onChange={num("llamadas")} /></Field>
          <Field label="Ventas"><Input type="number" value={f.ventas} onChange={num("ventas")} /></Field>

          <div className="col-span-2 sm:col-span-3">
            <Field label="Por qué funcionó (opcional)">
              <Textarea value={f.porQueFunciono} onChange={(e) => setF({ ...f, porQueFunciono: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <Field label="Qué repetir / qué evitar (opcional)">
              <Textarea value={f.queRepetir} onChange={(e) => setF({ ...f, queRepetir: e.target.value })} />
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

function VentanaPanel({ piezas, dias }: { piezas: PiezaMetrica[]; dias: Ventana }) {
  const v = enVentana(piezas, dias);
  const a = agregar(v);
  const umbral = umbralBombazo(piezas);
  const trend = [...v]
    .sort((x, y) => +new Date(x.fecha) - +new Date(y.fecha))
    .map((p) => p.vistas);

  const [criterio, setCriterio] = useState<keyof PiezaMetrica>("vistas");
  const top = topPor(v, criterio, 5);

  return (
    <div className="space-y-6">
      {/* Tarjetas visuales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vistas totales" value={a.vistas} icon={Eye} accent />
        <StatCard label="Seguidores nuevos" value={a.seguidoresNuevos} icon={UserPlus} />
        <StatCard label="DMs recibidos" value={a.dms} icon={MessageCircle} />
        <StatCard label="Guardados" value={a.guardados} icon={Bookmark} />
        <StatCard label="Compartidos" value={a.compartidos} icon={Share2} />
        <StatCard
          label="Tasa de conversación"
          value={formatPercent(tasaConversacion(a))}
          icon={MessagesSquare}
          format={false}
          hint="comentarios + respuestas + DMs / vistas"
        />
        <StatCard
          label="Conversión a lead"
          value={formatPercent(tasaConversionLead(a))}
          icon={Target}
          format={false}
          hint="leads / DMs"
        />
        <StatCard label="Llamadas / Ventas" value={`${a.llamadas} / ${a.ventas}`} format={false} icon={Heart} />
      </div>

      {/* Tendencia */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de vistas · {dias} días · {a.piezas} piezas</CardTitle>
        </CardHeader>
        <CardContent>
          <Sparkline data={trend} height={120} className="h-32" />
        </CardContent>
      </Card>

      {/* Top 5 */}
      <Card>
        <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" /> Mejores 5 piezas
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {CRITERIOS.map((c) => (
              <button
                key={c.key}
                onClick={() => setCriterio(c.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  criterio === c.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {top.map((p, i) => (
            <PiezaFila key={p.id} pieza={p} rank={i + 1} criterio={criterio} bombazo={esBombazo(p, umbral)} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PiezaFila({
  pieza,
  rank,
  criterio,
  bombazo,
}: {
  pieza: PiezaMetrica;
  rank: number;
  criterio: keyof PiezaMetrica;
  bombazo: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-secondary/20">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-display text-sm">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{pieza.titulo}</p>
          <p className="text-xs text-muted-foreground">
            {pieza.plataforma} · {pieza.formato} · {pieza.tipoHook}
          </p>
        </div>
        {bombazo && <Badge variant="viral">Bombazo</Badge>}
        <div className="text-right">
          <p className="font-display text-base tabular-nums">
            {formatNumber(pieza[criterio] as number)}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {CRITERIOS.find((c) => c.key === criterio)?.label}
          </p>
        </div>
      </button>

      {open && (
        <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
          <Explica icon={Flame} title="Por qué funcionó" text={pieza.porQueFunciono} />
          <Explica icon={Heart} title="Emoción que tocó" text={pieza.emocionTocada} />
          <Explica icon={Repeat} title="Qué repetir" text={pieza.queRepetir} accent />
          <Explica icon={Ban} title="Qué evitar" text={pieza.queEvitar} danger />
        </div>
      )}
    </div>
  );
}

function Explica({
  icon: Icon,
  title,
  text,
  accent,
  danger,
}: {
  icon: typeof Flame;
  title: string;
  text: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p
        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
          accent ? "text-primary" : danger ? "text-red-400" : "text-muted-foreground"
        }`}
      >
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}
