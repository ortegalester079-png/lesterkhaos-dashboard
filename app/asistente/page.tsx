"use client";

import { useRef, useState, useEffect } from "react";
import { Bot, Send, Loader2, User, Sparkles, AlertCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { chatAsistente, type ChatMsg } from "@/lib/claude-api";
import { PageHeader } from "@/components/shared/page-header";
import { HydrationGate } from "@/components/shared/hydration-gate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUGERENCIAS = [
  "¿Qué tipo de contenido debería priorizar esta semana según mi data?",
  "Dame 3 hooks para mi próximo reel basados en lo que funcionó.",
  "¿Qué estoy haciendo mal comparado con mi competencia?",
  "Arma un plan de contenido de 7 días para convertir a DM.",
];

export default function AsistentePage() {
  return (
    <HydrationGate fallback={<div className="h-screen" />}>
      <Asistente />
    </HydrationGate>
  );
}

function Asistente() {
  const avatar = useAppStore((s) => s.avatar);
  const playbook = useAppStore((s) => s.playbook);
  const metricas = useAppStore((s) => s.metricas);
  const competidores = useAppStore((s) => s.competidores);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function enviar(texto?: string) {
    const mensaje = (texto ?? input).trim();
    if (!mensaje || busy) return;
    setError(null);

    const nuevos: ChatMsg[] = [...messages, { role: "user", content: mensaje }];
    setMessages(nuevos);
    setInput("");
    setBusy(true);

    const r = await chatAsistente({
      messages: nuevos,
      avatar,
      playbook,
      metricas,
      competidores,
      webSearch,
    });
    setBusy(false);

    if (!r.ok) {
      setError(r.error ?? "Error al responder.");
      return;
    }
    setMessages([...nuevos, { role: "assistant", content: r.text ?? "" }]);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Estrategia"
        title="Asistente Estratégico"
        description="Tu Head de Contenido con IA. Conoce tu avatar, tus métricas y tu competencia."
      />

      {!avatar && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-muted-foreground">
              Responde mejor si completas tu{" "}
              <a href="/avatar" className="text-primary underline">
                Perfil del Avatar
              </a>
              . Aun así, ya puedes preguntarle.
            </span>
          </CardContent>
        </Card>
      )}

      <Card className="flex h-[calc(100vh-260px)] min-h-[420px] flex-col">
        {/* Mensajes */}
        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">Pregúntale a tu estratega</p>
              <p className="mb-5 max-w-md text-sm text-muted-foreground">
                Tiene acceso a tu avatar, métricas y competencia. Empieza con una
                de estas:
              </p>
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="rounded-lg border border-border bg-secondary/30 p-3 text-left text-sm text-foreground/90 transition-colors hover:border-primary/40 hover:bg-secondary/60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === "user" ? "bg-secondary" : "bg-primary/15 ring-1 ring-primary/30"
                }`}
              >
                {m.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-secondary text-foreground"
                    : "border border-border bg-card text-foreground/90"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-red-300">{error}</p>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <button
              onClick={() => setWebSearch((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                webSearch
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              title="Deja que el asistente busque en internet en tiempo real"
            >
              <Globe className="h-3.5 w-3.5" />
              Buscar en web {webSearch ? "· ON" : "· OFF"}
            </button>
            <span className="text-[11px] text-muted-foreground">
              {webSearch
                ? "Investigará tu nicho/marketing en vivo (un poco más lento)."
                : "Responde solo con tu contexto guardado."}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para salto de línea)"
              className="max-h-32 min-h-[44px] resize-none"
            />
            <Button onClick={() => enviar()} disabled={busy || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
              {busy ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
