import type {
  BloqueGuion,
  GuionGenerado,
  InputsGuion,
  TonoVariante,
} from "./types";
import { uid } from "./utils";

/*
 * Motor de guiones por plantillas — voz @lesterkhaos.
 * Determinista y offline. Sigue la estructura de 7 pasos para reels.
 *
 * Para sustituirlo por IA real (Claude), reemplaza `generarGuion` por una
 * llamada a la API con el system prompt de marca. Ver CLAUDE.md →
 * "Integraciones futuras → Generación con IA".
 */

const SYSTEM_VOICE = `Voz @lesterkhaos: directa, incómoda, humana, psicológica, espiritual
sin religiosidad barata, elegante y cruda. Sin frases de autoayuda genérica.
Le habla a alguien que por fuera produce y lidera, pero por dentro vive
ansiedad, vacío, apego o autosabotaje.`;

/** Inflexiones de tono por variante. */
const tonoLead: Record<TonoVariante, string> = {
  base: "",
  agresiva: "Sin anestesia: ",
  elegante: "Con calma, pero sin esquivarlo: ",
  espiritual: "Respira antes de leer esto. ",
  corta: "",
};

function golpe(inputs: InputsGuion, variante: TonoVariante): string {
  const { tema, emocion } = inputs;
  const base = `Lo que llamas ${tema.toLowerCase()} muchas veces es solo una forma elegante de no sentir ${emocion}.`;
  switch (variante) {
    case "agresiva":
      return `Deja de mentirte: ${base.toLowerCase()}`;
    case "elegante":
      return `Quizá nadie te lo dijo así: ${base}`;
    case "espiritual":
      return `${base} Y tu cuerpo lo sabe antes que tu mente.`;
    case "corta":
      return base;
    default:
      return base;
  }
}

function desarrollo(inputs: InputsGuion): string {
  return `Funcionas. Cumples. Lideras. Por fuera todo está bien.
Pero por dentro hay un ruido que la agenda tapa pero no apaga.
${inputs.tema} se volvió el lugar donde escondes lo que no quieres mirar.`;
}

function ejemplo(inputs: InputsGuion): string {
  return `Piensa en la última vez que te detuviste de verdad.
No de vacaciones con el teléfono encendido: detenerte.
Si la sola idea te incomoda, ahí tienes la respuesta sobre ${inputs.tema}.`;
}

function giro(inputs: InputsGuion, variante: TonoVariante): string {
  const base = `${inputs.tema} no es el problema. Es la solución que encontraste para no sentir ${inputs.emocion}.
El día que dejes de huir, no vas a rendir menos. Vas a vivir más presente.`;
  if (variante === "espiritual") {
    return `${base}
La paz no llega cuando controlas más. Llega cuando dejas de escapar de ti.`;
  }
  return base;
}

function cierre(inputs: InputsGuion): string {
  return `No te pido que lo dejes todo.
Te pido que, por una vez, no llenes el silencio. A ver qué te dice.`;
}

function ctaPara(inputs: InputsGuion): string {
  const palabra = inputs.tema
    .split(" ")[0]
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÑ]/g, "");
  switch (inputs.objetivo) {
    case "DM":
      return `Si esto te tocó, escríbeme "${palabra || "VERDAD"}" por DM. No para venderte nada: para hacerte la pregunta que estás evitando.`;
    case "lead":
      return `Comenta "${palabra || "VERDAD"}" y te mando el diagnóstico de 3 preguntas que uso con mis clientes.`;
    case "venta":
      return `Si llevas meses así, hablemos. Link en bio para una conversación honesta, sin guion de ventas.`;
    case "interacción":
      return `Responde con una sola palabra: ¿de qué te distrae tu ${inputs.tema.toLowerCase()}?`;
    default:
      return `Guarda esto para el día que lo niegues. Y compártelo con quien finge estar bien.`;
  }
}

/** Genera los bloques según el formato. */
function construirBloques(
  inputs: InputsGuion,
  variante: TonoVariante
): BloqueGuion[] {
  const hookLinea = `${tonoLead[variante]}${inputs.hook}`;

  // Formatos no-reel: estructura adaptada
  if (inputs.formato === "Carrusel") {
    return [
      { paso: "Slide 1 — Hook", contenido: hookLinea },
      { paso: "Slide 2 — Golpe", contenido: golpe(inputs, variante) },
      { paso: "Slide 3-5 — Desarrollo", contenido: desarrollo(inputs) },
      { paso: "Slide 6 — Ejemplo", contenido: ejemplo(inputs) },
      { paso: "Slide 7 — Giro", contenido: giro(inputs, variante) },
      { paso: "Slide 8 — Cierre + CTA", contenido: `${cierre(inputs)}\n\n${ctaPara(inputs)}` },
    ];
  }

  if (inputs.formato === "Email") {
    return [
      { paso: "Asunto", contenido: inputs.hook },
      { paso: "Apertura", contenido: golpe(inputs, variante) },
      { paso: "Cuerpo", contenido: `${desarrollo(inputs)}\n\n${ejemplo(inputs)}` },
      { paso: "Giro", contenido: giro(inputs, variante) },
      { paso: "Cierre + CTA", contenido: `${cierre(inputs)}\n\n${ctaPara(inputs)}` },
    ];
  }

  if (inputs.formato === "Thread") {
    return [
      { paso: "1/ Hook", contenido: hookLinea },
      { paso: "2/ Golpe", contenido: golpe(inputs, variante) },
      { paso: "3/ Desarrollo", contenido: desarrollo(inputs) },
      { paso: "4/ Ejemplo", contenido: ejemplo(inputs) },
      { paso: "5/ Giro", contenido: giro(inputs, variante) },
      { paso: "6/ Cierre + CTA", contenido: `${cierre(inputs)}\n\n${ctaPara(inputs)}` },
    ];
  }

  if (inputs.formato === "Story sequence") {
    return [
      { paso: "Story 1", contenido: hookLinea },
      { paso: "Story 2", contenido: golpe(inputs, variante) },
      { paso: "Story 3", contenido: ejemplo(inputs) },
      { paso: "Story 4 — Sticker", contenido: ctaPara({ ...inputs, objetivo: "interacción" }) },
    ];
  }

  // Reels (30/60/90) y Podcast corto → estructura completa de 7 pasos
  const bloques: BloqueGuion[] = [
    { paso: "1 · Hook directo", contenido: hookLinea },
    { paso: "2 · Golpe psicológico", contenido: golpe(inputs, variante) },
    { paso: "3 · Desarrollo", contenido: desarrollo(inputs) },
    { paso: "4 · Ejemplo concreto", contenido: ejemplo(inputs) },
    { paso: "5 · Giro de conciencia", contenido: giro(inputs, variante) },
    { paso: "6 · Cierre", contenido: cierre(inputs) },
    { paso: "7 · CTA", contenido: ctaPara(inputs) },
  ];

  // Variante corta: comprime a 4 bloques
  if (variante === "corta" || inputs.formato === "Reel 30s") {
    return [
      { paso: "1 · Hook", contenido: hookLinea },
      { paso: "2 · Golpe + giro", contenido: `${golpe(inputs, variante)} ${giro(inputs, variante)}` },
      { paso: "3 · Cierre", contenido: cierre(inputs) },
      { paso: "4 · CTA", contenido: ctaPara(inputs) },
    ];
  }

  return bloques;
}

function construirCaption(inputs: InputsGuion): string {
  const palabra = inputs.tema.split(" ")[0].toUpperCase();
  return `${inputs.hook}

No es motivación. Es un espejo.
Si funcionas por fuera pero por dentro estás cansado de fingir, esto es para ti.

${ctaPara(inputs)}

#${palabra.toLowerCase().replace(/[^a-z]/g, "")} #psicologia #ego #sombra #conciencia #lesterkhaos`;
}

/** Punto de entrada del motor. */
export function generarGuion(
  inputs: InputsGuion,
  variante: TonoVariante = "base"
): GuionGenerado {
  return {
    id: uid("guion"),
    inputs,
    variante,
    bloques: construirBloques(inputs, variante),
    caption: construirCaption(inputs),
    creadoEn: new Date().toISOString(),
  };
}

export { SYSTEM_VOICE };
