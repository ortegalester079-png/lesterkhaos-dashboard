/*
 * Listas canónicas de opciones para filtros y formularios.
 * Una sola fuente: si agregas un valor aquí, aparece en toda la UI.
 */

export const NICHOS = [
  "ego",
  "trauma",
  "identidad",
  "sombra",
  "relaciones",
  "conciencia",
  "espiritualidad",
  "negocio",
  "ansiedad",
  "dinero",
  "propósito",
  "disciplina",
  "autosabotaje",
] as const;

export const EMOCIONES = [
  "dolor",
  "culpa",
  "miedo",
  "vacío",
  "rabia",
  "vergüenza",
  "esperanza",
  "alivio",
  "curiosidad",
  "verdad",
] as const;

export const TIPOS_GANCHO = [
  "Dejá de hacer [X]",
  "[X] está matando tu [Y]",
  "[Número] cosas que ojalá hubiera sabido",
  "Nadie te dice esto sobre [X]",
  "El problema no es [X], es [Y]",
  "No estás cansado, estás [X]",
  "Tu negocio crece, pero tu paz no",
  "No es disciplina, es huida",
  "No quieres amor, quieres anestesia",
  "Eso que llamas ambición también puede ser trauma",
] as const;

export const FORMATOS = ["reel", "carrusel", "story", "thread", "email"] as const;

export const ESTADOS_GANCHO_LIST = [
  "probado",
  "pendiente",
  "viral",
  "adaptar",
  "descartar",
] as const;

export const PLATAFORMAS = [
  "Instagram",
  "TikTok",
  "YouTube Shorts",
  "Threads",
  "WhatsApp Community",
  "Email",
] as const;

export const ESTADOS_PIEZA = [
  "idea",
  "guion",
  "grabado",
  "editado",
  "programado",
  "publicado",
] as const;

export const OBJETIVOS = ["alcance", "interacción", "DM", "lead", "venta"] as const;

export const ETAPAS_EMBUDO = ["TOFU", "MOFU", "BOFU"] as const;

export const FORMATOS_GUION = [
  "Reel 30s",
  "Reel 60s",
  "Reel 90s",
  "Carrusel",
  "Story sequence",
  "Thread",
  "Podcast corto",
  "Email",
] as const;

export const CATEGORIAS_IDEA = [
  "ego",
  "apego",
  "trauma",
  "sombra",
  "dinero",
  "pareja",
  "propósito",
  "ansiedad",
  "identidad",
  "negocio",
  "espiritualidad",
  "disciplina",
  "autosabotaje",
] as const;

export const ESTADOS_IDEA = [
  "cruda",
  "buena",
  "convertir en hook",
  "convertir en guion",
  "descartar",
  "publicada",
] as const;

export const ETIQUETAS_TENDENCIA = [
  "potencial de gancho",
  "explicativo",
  "polémico",
  "emocional",
  "ignorar",
] as const;

export const TONOS = ["base", "agresiva", "elegante", "espiritual", "corta"] as const;
