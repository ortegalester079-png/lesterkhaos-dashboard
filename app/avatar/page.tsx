"use client";

import { useState } from "react";
import { User, Save, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import type { AvatarProfile } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { Field } from "@/components/shared/form-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AvatarPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <AvatarProfile />
    </HydrationGate>
  );
}

function AvatarProfile() {
  const avatar = useAppStore((s) => s.avatar);
  const setAvatar = useAppStore((s) => s.setAvatar);

  const [form, setForm] = useState<Partial<AvatarProfile>>(
    avatar ?? {
      nombre: "",
      edad: 35,
      genero: "masculino",
      estadoCivil: "",
      ingresos: "",
      miedosPrincipales: [],
      aspiraciones: [],
      problemasClave: [],
      jerga: "",
      dondeConsume: [],
      motivacionCompra: "",
      objetos: "",
      nicho: "",
    }
  );

  const [guardado, setGuardado] = useState(false);

  function guardar() {
    const validated: AvatarProfile = {
      nombre: form.nombre || "Mi Avatar",
      edad: form.edad || 35,
      genero: (form.genero as any) || "masculino",
      estadoCivil: form.estadoCivil || "",
      ingresos: form.ingresos || "",
      miedosPrincipales: form.miedosPrincipales || [],
      aspiraciones: form.aspiraciones || [],
      problemasClave: form.problemasClave || [],
      jerga: form.jerga || "",
      dondeConsume: form.dondeConsume || [],
      motivacionCompra: form.motivacionCompra || "",
      objetos: form.objetos || "",
      nicho: form.nicho || "",
      actualizado: new Date().toISOString(),
    };
    setAvatar(validated);
    setGuardado(true);
    window.setTimeout(() => setGuardado(false), 3000);
  }

  const parseArray = (s: string): string[] =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Configuración"
        title="Perfil del Avatar"
        description="Tu cliente ideal. Guárdalo una sola vez; sirve para todo lo demás."
      />

      <div className="space-y-6 max-w-2xl">
        {/* Datos demográficos */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-foreground">Datos demográficos</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre del avatar">
                <Input
                  value={form.nombre || ""}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej. El Emprendedor 30-40"
                />
              </Field>
              <Field label="Edad">
                <Input
                  type="number"
                  value={form.edad || 35}
                  onChange={(e) => setForm({ ...form, edad: parseInt(e.target.value) || 35 })}
                  min="16"
                  max="100"
                />
              </Field>
              <Field label="Género">
                <select
                  value={form.genero || ""}
                  onChange={(e) => setForm({ ...form, genero: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>
              <Field label="Estado civil">
                <Input
                  value={form.estadoCivil || ""}
                  onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}
                  placeholder="casado, soltero, etc."
                />
              </Field>
              <Field label="Ingresos (anuales)">
                <Input
                  value={form.ingresos || ""}
                  onChange={(e) => setForm({ ...form, ingresos: e.target.value })}
                  placeholder="ej. $50k-$100k"
                />
              </Field>
              <Field label="Nicho principal">
                <Input
                  value={form.nicho || ""}
                  onChange={(e) => setForm({ ...form, nicho: e.target.value })}
                  placeholder="ej. Emprendimiento, Espiritualidad"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Psicología */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-foreground">Psicología del avatar</h3>
            <Field label="3-5 Miedos principales (separados por coma)">
              <Textarea
                value={form.miedosPrincipales?.join(", ") || ""}
                onChange={(e) =>
                  setForm({ ...form, miedosPrincipales: parseArray(e.target.value) })
                }
                placeholder="Fracasar, quedarse atrás, no ser lo suficientemente bueno..."
                className="min-h-[80px]"
              />
            </Field>
            <Field label="3-5 Aspiraciones (separados por coma)">
              <Textarea
                value={form.aspiraciones?.join(", ") || ""}
                onChange={(e) => setForm({ ...form, aspiraciones: parseArray(e.target.value) })}
                placeholder="Libertad financiera, impacto, familia estable..."
                className="min-h-[80px]"
              />
            </Field>
            <Field label="3-5 Problemas que resuelves (separados por coma)">
              <Textarea
                value={form.problemasClave?.join(", ") || ""}
                onChange={(e) => setForm({ ...form, problemasClave: parseArray(e.target.value) })}
                placeholder="No sabe por dónde empezar, miedo a invertir, análisis parálisis..."
                className="min-h-[80px]"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Comportamiento */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-foreground">Comportamiento</h3>
            <Field label="Jerga / cómo habla">
              <Input
                value={form.jerga || ""}
                onChange={(e) => setForm({ ...form, jerga: e.target.value })}
                placeholder="coloquial, profesional, técnica, espiritual..."
              />
            </Field>
            <Field label="Dónde consume contenido (separados por coma)">
              <Input
                value={form.dondeConsume?.join(", ") || ""}
                onChange={(e) => setForm({ ...form, dondeConsume: parseArray(e.target.value) })}
                placeholder="TikTok, YouTube, LinkedIn, Reddit, Threads..."
              />
            </Field>
            <Field label="Motivación principal de compra">
              <Input
                value={form.motivacionCompra || ""}
                onChange={(e) => setForm({ ...form, motivacionCompra: e.target.value })}
                placeholder="ahorro, estatus, educación, tiempo, seguridad..."
              />
            </Field>
            <Field label="Objetivo contigo (qué busca)">
              <Input
                value={form.objetos || ""}
                onChange={(e) => setForm({ ...form, objetos: e.target.value })}
                placeholder="venta, comunidad, suscripción, educación, coaching..."
              />
            </Field>
          </CardContent>
        </Card>

        {/* Aviso */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex gap-3 pt-6">
            <AlertCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div className="text-sm text-foreground/90">
              <p className="font-medium">Usa este perfil en:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-xs text-muted-foreground">
                <li>Generador de Ideas con IA — para sugerencias específicas</li>
                <li>Script Optimizer — valida si tu guion resuena con el avatar</li>
                <li>Diagnóstico Semanal — analiza qué emociones y formatos funcionaron</li>
                <li>Todas las decisiones de contenido</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={guardar} className="gap-2">
            <Save className="h-4 w-4" />
            {guardado ? "✓ Guardado" : "Guardar perfil"}
          </Button>
        </div>
      </div>
    </div>
  );
}
