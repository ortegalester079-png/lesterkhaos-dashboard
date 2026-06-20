"use client";

import { useState } from "react";
import { BookOpen, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import type { Playbook } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { Field } from "@/components/shared/form-bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const VACIO: Playbook = {
  subNicho: "",
  avatarProfundo: "",
  estrategiaEmbudo: "",
  pilaresContenido: "",
  estrategiasComunidad: "",
  estiloComunicacion: "",
  guionesPropios: "",
  guionesCompetencia: "",
  actualizado: "",
};

interface CampoDef {
  key: keyof Omit<Playbook, "actualizado">;
  label: string;
  placeholder: string;
  rows: number;
}

const CAMPOS: CampoDef[] = [
  {
    key: "subNicho",
    label: "Nicho y sub-nicho",
    placeholder:
      "Ej: Marca personal en psicología masculina / alto rendimiento. Sub-nicho: emprendedores que funcionan por fuera y se rompen por dentro.",
    rows: 2,
  },
  {
    key: "avatarProfundo",
    label: "Avatar profundo (dolores, lenguaje exacto, objeciones, deseos)",
    placeholder:
      "Cómo habla, qué frases usa, qué teme decir en voz alta, qué objeciones tiene para comprar, qué desea de verdad…",
    rows: 5,
  },
  {
    key: "estrategiaEmbudo",
    label: "Estrategia de embudo (TOFU / MOFU / BOFU)",
    placeholder:
      "TOFU: cómo atraes (temas, ganchos). MOFU: cómo nutres (historias, casos). BOFU: cómo cierras (CTA, oferta, DM).",
    rows: 4,
  },
  {
    key: "pilaresContenido",
    label: "Pilares de contenido",
    placeholder: "3-5 pilares/temas recurrentes que sostienen tu marca.",
    rows: 3,
  },
  {
    key: "estrategiasComunidad",
    label: "Estrategias de comunidad (handraising, rituales, Ramiro Cubría, etc.)",
    placeholder:
      "Describe handraising en historias, rituales (ej. domingo de reflexión), dinámicas de comunidad y cualquier marco que sigas (Ramiro Cubría, etc.).",
    rows: 5,
  },
  {
    key: "estiloComunicacion",
    label: "Estilo de comunicación (voz, do's & don'ts, frases marca)",
    placeholder:
      "Tono, palabras que SÍ usas, palabras que evitas, ejemplos de tus frases más tú.",
    rows: 4,
  },
  {
    key: "guionesPropios",
    label: "Tus mejores guiones (ejemplos de tu voz)",
    placeholder:
      "Pega 2-4 guiones tuyos que funcionaron. La IA aprende tu voz de aquí.",
    rows: 6,
  },
  {
    key: "guionesCompetencia",
    label: "Guiones de competencia que admiras (y por qué)",
    placeholder:
      "Pega guiones/hooks de referentes + una línea de por qué funcionan.",
    rows: 6,
  },
];

export default function PlaybookPage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <PlaybookEditor />
    </HydrationGate>
  );
}

function PlaybookEditor() {
  const playbook = useAppStore((s) => s.playbook);
  const setPlaybook = useAppStore((s) => s.setPlaybook);

  const [form, setForm] = useState<Playbook>(playbook ?? VACIO);
  const [guardado, setGuardado] = useState(false);

  function set(key: keyof Playbook, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function guardar() {
    setPlaybook({ ...form, actualizado: new Date().toISOString() });
    setGuardado(true);
    window.setTimeout(() => setGuardado(false), 3000);
  }

  const llenos = CAMPOS.filter((c) => form[c.key]?.trim()).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Estrategia · el cerebro del sistema"
        title="Base de Conocimiento"
        description="Tu playbook. Lo que pegues aquí lo usa TODA la IA (ideas, guiones, asistente, diagnóstico, auditoría). Llénalo una vez."
      />

      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-foreground/90">
            <p className="font-medium">
              Esto es lo que hace que la IA “te conozca”.
            </p>
            <p className="text-muted-foreground">
              Cuanto más detalle pegues (avatar real, tus guiones, estrategias
              como handraising o las de Ramiro Cubría), más afiladas y “tuyas”
              serán todas las respuestas. Completados: {llenos}/{CAMPOS.length}.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-3xl space-y-5">
        {CAMPOS.map((c) => (
          <Card key={c.key}>
            <CardContent className="pt-6">
              <Field label={c.label}>
                <Textarea
                  value={form[c.key] as string}
                  onChange={(e) => set(c.key, e.target.value)}
                  placeholder={c.placeholder}
                  className="min-h-[60px]"
                  rows={c.rows}
                />
              </Field>
            </CardContent>
          </Card>
        ))}

        <div className="sticky bottom-4 flex items-center gap-3">
          <Button onClick={guardar} className="gap-2 shadow-lg">
            {guardado ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {guardado ? "Guardado ✓" : "Guardar playbook"}
          </Button>
          {playbook?.actualizado && !guardado && (
            <span className="text-xs text-muted-foreground">
              Última actualización guardada.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
