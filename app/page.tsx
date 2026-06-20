"use client";

import Link from "next/link";
import {
  Archive,
  Eye,
  UserPlus,
  MessageCircle,
  Bookmark,
  Flame,
  ArrowRight,
  Stethoscope,
  Calendar,
  PenLine,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import {
  agregar,
  delta,
  enVentana,
  esBombazo,
  tasaConversacion,
  topPor,
  umbralBombazo,
} from "@/lib/metrics";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { Sparkline } from "@/components/shared/sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/nav";

export default function HomePage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Dashboard />
    </HydrationGate>
  );
}

function Dashboard() {
  const metricas = useAppStore((s) => s.metricas);
  const piezas = useAppStore((s) => s.piezas);
  const ganchos = useAppStore((s) => s.ganchos);
  const diagnostico = useAppStore((s) => s.diagnostico);

  const v30 = enVentana(metricas, 30);
  const v60a30 = metricas.filter((p) => {
    const d = new Date(p.fecha);
    const desde = new Date("2026-05-17");
    const hasta = new Date("2026-05-17");
    desde.setDate(desde.getDate() - 30);
    return d >= desde && d < hasta;
  });
  const a = agregar(v30);
  const aPrev = agregar(v60a30);
  const umbral = umbralBombazo(metricas);

  const trendVistas = [...v30]
    .sort((x, y) => +new Date(x.fecha) - +new Date(y.fecha))
    .map((p) => p.vistas);

  const topVistas = topPor(v30, "vistas", 3);
  const proximas = [...piezas]
    .filter((p) => p.estado === "programado" || p.estado === "editado")
    .sort((x, y) => +new Date(x.fechaPublicacion) - +new Date(y.fechaPublicacion))
    .slice(0, 4);
  const ganchosViral = ganchos.filter((g) => g.estado === "viral").length;
  const ganchosAdaptar = ganchos.filter((g) => g.estado === "adaptar").length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Content OS"
        title="Centro de mando"
        description="Tu contenido como herramienta de posicionamiento, diagnóstico psicológico y conversión a conversación privada."
      >
        <Button asChild>
          <Link href="/guiones">
            <PenLine /> Nuevo guion
          </Link>
        </Button>
      </PageHeader>

      {/* KPIs de 30 días */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Vistas (30d)"
          value={a.vistas}
          icon={Eye}
          delta={delta(a.vistas, aPrev.vistas)}
          accent
        />
        <StatCard
          label="Seguidores nuevos"
          value={a.seguidoresNuevos}
          icon={UserPlus}
          delta={delta(a.seguidoresNuevos, aPrev.seguidoresNuevos)}
        />
        <StatCard
          label="DMs"
          value={a.dms}
          icon={MessageCircle}
          delta={delta(a.dms, aPrev.dms)}
        />
        <StatCard
          label="Guardados"
          value={a.guardados}
          icon={Bookmark}
          delta={delta(a.guardados, aPrev.guardados)}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Tendencia de vistas + tasas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Tendencia de vistas · 30 días</CardTitle>
            <div className="flex gap-4 text-right text-xs">
              <div>
                <p className="text-muted-foreground">T. conversación</p>
                <p className="font-display text-lg text-foreground">
                  {formatPercent(tasaConversacion(a))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Leads</p>
                <p className="font-display text-lg text-foreground">{a.leads}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trendVistas.length > 0 ? (
              <Sparkline data={trendVistas} height={120} className="h-32" />
            ) : (
              <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
                Sin métricas todavía. Registra tus piezas reales en Métricas.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnóstico de la semana */}
        <Card className="card-hover">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" /> Diagnóstico
            </CardTitle>
            {diagnostico.semana && <Badge variant="muted">{diagnostico.semana}</Badge>}
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Patrón detectado</p>
            <p className="text-sm leading-relaxed text-foreground">
              {diagnostico.patronDetectado ||
                "Aún sin datos. El diagnóstico se genera a partir de tus métricas reales."}
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/diagnostico">
                Ver diagnóstico completo <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top piezas + próximas publicaciones */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" /> Mejores piezas (30d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topVistas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sin piezas medidas todavía. Carga tus datos reales en Métricas.
              </p>
            )}
            {topVistas.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.plataforma} · {p.formato}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {esBombazo(p, umbral) && <Badge variant="viral">Bombazo</Badge>}
                  <span className="font-display text-base tabular-nums">
                    {formatNumber(p.vistas)}
                  </span>
                </div>
              </div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/metricas">
                Ver todas las métricas <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Próximas publicaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nada programado. Agenda contenido desde el calendario.
              </p>
            )}
            {proximas.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {p.tituloInterno}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(p.fechaPublicacion)} · {p.plataforma}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {p.estado}
                </Badge>
              </div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/calendario">
                Abrir calendario <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Baúl rápido + accesos a módulos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="card-hover lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-primary" /> Baúl de Ganchos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-secondary/40 p-3">
                <p className="font-display text-2xl">{ganchosViral}</p>
                <p className="text-xs text-muted-foreground">virales</p>
              </div>
              <div className="flex-1 rounded-lg bg-secondary/40 p-3">
                <p className="font-display text-2xl">{ganchosAdaptar}</p>
                <p className="text-xs text-muted-foreground">por adaptar</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/ganchos">
                Abrir baúl <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Módulos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {navItems
              .filter((i) => i.href !== "/")
              .map((i) => {
                const Icon = i.icon;
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className="card-hover flex items-center gap-2 rounded-lg border border-border bg-secondary/20 p-3 text-sm"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="truncate">{i.label}</span>
                  </Link>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
