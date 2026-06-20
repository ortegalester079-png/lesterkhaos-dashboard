"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Repeat,
  Ban,
  Brain,
  FlaskConical,
  Lightbulb,
  Flame,
  Compass,
  Wand2,
  Heart,
  Film,
  Target,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { enVentana, tasaConversacion, agregar } from "@/lib/metrics";
import { generarDiagnosticoIA } from "@/lib/claude-api";
import type { PiezaMetrica } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DiagnosticoPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Diagnostico />
    </HydrationGate>
  );
}

/** Suma un campo agrupando por otra propiedad de la pieza. */
function agruparPor(
  piezas: PiezaMetrica[],
  campoClave: keyof PiezaMetrica,
  campoMetrica: keyof PiezaMetrica
): { clave: string; valor: number }[] {
  const map = new Map<string, number>();
  for (const p of piezas) {
    const k = String(p[campoClave]);
    map.set(k, (map.get(k) ?? 0) + (p[campoMetrica] as number));
  }
  return Array.from(map.entries())
    .map(([clave, valor]) => ({ clave, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function Diagnostico() {
  const metricas = useAppStore((s) => s.metricas);
  const diag = useAppStore((s) => s.diagnostico);

  // Ventana de la semana (7 días)
  const semana = enVentana(metricas, 7);
  const a = agregar(semana);

  const respuesta = (p: PiezaMetrica) =>
    p.comentarios + p.respuestasStories + p.dms;

  const emociones = agruparPor(semana, "emocion", "dms");
  const hooks = [...semana].sort((x, y) => respuesta(y) - respuesta(x)).slice(0, 3);
  const formatosDM = agruparPor(semana, "formato", "dms");
  const conLeads = [...semana].filter((p) => p.leads > 0).sort((x, y) => y.leads - x.leads);
  const viewsVacias = [...semana]
    .filter((p) => p.vistas > 30000)
    .sort((x, y) => x.dms / x.vistas - y.dms / y.vistas)
    .slice(0, 3);

  const sinResumen =
    diag.loQueFunciono.length === 0 &&
    diag.loQueNoFunciono.length === 0 &&
    !diag.patronDetectado;
  const sinDatos = metricas.length === 0 && sinResumen;

  if (sinDatos) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          eyebrow="Módulo 09"
          title="Diagnóstico Semanal"
          description="No mires los números: léelos. Qué tocó nervio, qué fue ruido y qué probar la próxima semana."
        />
        <EmptyState
          icon={Stethoscope}
          title="El diagnóstico se construye con tus datos"
          description="No inventamos análisis. En cuanto registres tus piezas en el módulo Métricas, esta página leerá esos números reales y te dirá qué funcionó, qué fue ruido y qué probar la próxima semana."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Módulo 09"
        title="Diagnóstico Semanal"
        description="No mires los números: léelos. Qué tocó nervio, qué fue ruido y qué probar la próxima semana."
      >
        <GenerarDiagnosticoIA />
        {diag.semana && (
          <Badge variant="secondary" className="h-8 px-3 text-sm">
            {diag.semana}
          </Badge>
        )}
      </PageHeader>

      {/* Lectura analítica automática */}
      <p className="eyebrow mb-3">Lectura de los datos · últimos 7 días</p>
      <div className="grid gap-4 lg:grid-cols-3">
        <InsightCard icon={Heart} title="Emociones que más respuesta generaron">
          <Ranking items={emociones.slice(0, 4).map((e) => ({ label: e.clave, value: `${e.valor} DMs` }))} />
        </InsightCard>

        <InsightCard icon={Flame} title="Hooks con más fuerza">
          <ol className="space-y-2">
            {hooks.map((h, i) => (
              <li key={h.id} className="flex items-start gap-2 text-sm">
                <span className="font-display text-primary">{i + 1}.</span>
                <span>
                  <span className="text-foreground">{h.titulo}</span>
                  <span className="block text-xs text-muted-foreground">
                    {h.tipoHook} · {respuesta(h)} interacciones de diálogo
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </InsightCard>

        <InsightCard icon={Film} title="Formatos que trajeron más DMs">
          <Ranking items={formatosDM.map((f) => ({ label: f.clave, value: `${f.valor} DMs` }))} />
        </InsightCard>

        <InsightCard icon={Target} title="Piezas que atrajeron leads">
          {conLeads.length ? (
            <ul className="space-y-1.5 text-sm">
              {conLeads.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-foreground">{p.titulo}</span>
                  <Badge variant="success">{p.leads} leads</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin leads esta semana.</p>
          )}
        </InsightCard>

        <InsightCard icon={Eye} title="Views vacías (alcance sin conversación)">
          <ul className="space-y-1.5 text-sm">
            {viewsVacias.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-foreground">{p.titulo}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatNumber(p.vistas)} vistas · {p.dms} DMs
                </span>
              </li>
            ))}
          </ul>
        </InsightCard>

        <InsightCard icon={Brain} title="Pulso general">
          <div className="space-y-1.5 text-sm">
            <Row label="Vistas (7d)" value={formatNumber(a.vistas)} />
            <Row label="DMs" value={String(a.dms)} />
            <Row label="Leads" value={String(a.leads)} />
            <Row label="Tasa de conversación" value={`${tasaConversacion(a).toFixed(1)}%`} />
          </div>
        </InsightCard>
      </div>

      {/* Resumen estratégico de 8 puntos */}
      <p className="eyebrow mb-3 mt-10">Resumen estratégico de la semana</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <ResumenLista icon={ThumbsUp} n="1" title="Lo que funcionó" items={diag.loQueFunciono} accent="success" />
        <ResumenLista icon={ThumbsDown} n="2" title="Lo que no funcionó" items={diag.loQueNoFunciono} accent="danger" />
        <ResumenTexto icon={Repeat} n="3" title="Patrón detectado" text={diag.patronDetectado} />
        <ResumenTexto icon={FlaskConical} n="4" title="Hipótesis" text={diag.hipotesis} />
        <ResumenTexto icon={Compass} n="5" title="Próximo experimento" text={diag.proximoExperimento} accent />
        <DecisionCard decision={diag.decisionEstrategica} />
      </div>

      {/* Ideas y hooks recomendados */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> 6 · 5 ideas nuevas para la semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {diag.ideasNuevas.map((idea, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="font-display text-primary">{i + 1}.</span>
                  <span className="text-foreground/90">{idea}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <HooksRecomendados hooks={diag.hooksRecomendados} />
      </div>
    </div>
  );
}

/** Botón que genera el diagnóstico estratégico con Claude a partir de las métricas. */
function GenerarDiagnosticoIA() {
  const metricas = useAppStore((s) => s.metricas);
  const avatar = useAppStore((s) => s.avatar);
  const playbook = useAppStore((s) => s.playbook);
  const setDiagnostico = useAppStore((s) => s.setDiagnostico);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function generar() {
    setMsg(null);
    if (metricas.length === 0) {
      setMsg({ tipo: "error", texto: "Necesitas métricas para diagnosticar." });
      return;
    }
    setBusy(true);
    const r = await generarDiagnosticoIA({ metricas, avatar, playbook });
    setBusy(false);
    if (!r.ok) {
      setMsg({ tipo: "error", texto: r.error ?? "Error al generar." });
      return;
    }
    if (r.diagnostico) setDiagnostico(r.diagnostico);
    setMsg({ tipo: "ok", texto: "Diagnóstico actualizado con IA." });
    window.setTimeout(() => setMsg(null), 5000);
  }

  return (
    <>
      <Button onClick={generar} disabled={busy || metricas.length === 0}>
        {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {busy ? "Analizando…" : "Generar con IA"}
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

function InsightCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Heart;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Ranking({ items }: { items: { label: string; value: string }[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it) => (
        <li key={it.label} className="flex items-center justify-between text-sm">
          <span className="capitalize text-foreground">{it.label}</span>
          <span className="text-xs text-muted-foreground">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function ResumenLista({
  icon: Icon,
  n,
  title,
  items,
  accent,
}: {
  icon: typeof ThumbsUp;
  n: string;
  title: string;
  items: string[];
  accent: "success" | "danger";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4 w-4 ${accent === "success" ? "text-emerald-400" : "text-red-400"}`} />
          <span className="text-muted-foreground">{n} ·</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
              <span className={accent === "success" ? "text-emerald-400" : "text-red-400"}>•</span>
              {it}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ResumenTexto({
  icon: Icon,
  n,
  title,
  text,
  accent,
}: {
  icon: typeof Repeat;
  n: string;
  title: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "ring-1 ring-inset ring-primary/30" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{n} ·</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
      </CardContent>
    </Card>
  );
}

function DecisionCard({ decision }: { decision: string }) {
  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Compass className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">8 ·</span> Decisión estratégica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-lg leading-snug text-foreground">{decision}</p>
      </CardContent>
    </Card>
  );
}

function HooksRecomendados({ hooks }: { hooks: string[] }) {
  const router = useRouter();
  const setHookPendiente = useAppStore((s) => s.setHookPendiente);

  function usar(texto: string) {
    setHookPendiente({ texto, origen: "Diagnóstico Semanal" });
    router.push("/guiones");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" /> 7 · 3 hooks recomendados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hooks.map((h, i) => (
          <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-sm text-foreground/90">“{h}”</p>
            <Button size="sm" variant="ghost" className="shrink-0" onClick={() => usar(h)}>
              <Wand2 /> Usar
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
