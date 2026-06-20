/*
 * Modelo de dominio de @lesterkhaos.
 * Estos tipos son la "fuente de verdad" del tablero.
 * Para conectar una base de datos real, mapea las tablas a estas interfaces
 * (ver CLAUDE.md → "Cómo conectar datos reales").
 */

// ----- Vocabulario compartido de la marca -----

export type Plataforma =
  | "Instagram"
  | "TikTok"
  | "YouTube Shorts"
  | "Threads"
  | "WhatsApp Community"
  | "Email";

export type Emocion =
  | "dolor"
  | "culpa"
  | "miedo"
  | "vacío"
  | "rabia"
  | "vergüenza"
  | "esperanza"
  | "alivio"
  | "curiosidad"
  | "verdad";

export type Nicho =
  | "ego"
  | "trauma"
  | "identidad"
  | "sombra"
  | "relaciones"
  | "conciencia"
  | "espiritualidad"
  | "negocio"
  | "ansiedad"
  | "dinero"
  | "propósito"
  | "disciplina"
  | "autosabotaje";

export type EtapaEmbudo = "TOFU" | "MOFU" | "BOFU";

export type Objetivo = "alcance" | "interacción" | "DM" | "lead" | "venta";

export type FormatoContenido =
  | "reel"
  | "carrusel"
  | "story"
  | "thread"
  | "email";

// ----- 1. Baúl de Ganchos -----

export type TipoGancho =
  | "Dejá de hacer [X]"
  | "[X] está matando tu [Y]"
  | "[Número] cosas que ojalá hubiera sabido"
  | "Nadie te dice esto sobre [X]"
  | "El problema no es [X], es [Y]"
  | "No estás cansado, estás [X]"
  | "Tu negocio crece, pero tu paz no"
  | "No es disciplina, es huida"
  | "No quieres amor, quieres anestesia"
  | "Eso que llamas ambición también puede ser trauma";

export type EstadoGancho =
  | "probado"
  | "pendiente"
  | "viral"
  | "adaptar"
  | "descartar";

export interface Gancho {
  id: string;
  texto: string;
  nicho: Nicho;
  emocion: Emocion;
  tipo: TipoGancho;
  nivelDolor: number; // 1-10
  nivelCuriosidad: number; // 1-10
  formato: FormatoContenido;
  fuente: string;
  link: string;
  vistas: number;
  guardados: number;
  compartidos: number;
  fechaGuardada: string; // ISO
  estado: EstadoGancho;
}

// ----- 2. Métricas -----

export interface PiezaMetrica {
  id: string;
  titulo: string;
  plataforma: Plataforma;
  formato: FormatoContenido;
  fecha: string; // ISO
  emocion: Emocion;
  tipoHook: TipoGancho;
  vistas: number;
  likes: number;
  comentarios: number;
  guardados: number;
  compartidos: number;
  seguidoresNuevos: number;
  dms: number;
  clicsPerfil: number;
  respuestasStories: number;
  keywordsManychat: number;
  leads: number;
  llamadas: number;
  ventas: number;
  // Análisis editorial (por qué funcionó / qué repetir)
  porQueFunciono: string;
  emocionTocada: string;
  queRepetir: string;
  queEvitar: string;
  // Procedencia del dato: cargado a mano o traído de Instagram
  fuenteDatos?: "manual" | "instagram";
  permalink?: string;
}

/** Credenciales y estado de la conexión con la API de Instagram. */
export interface InstagramConfig {
  connected: boolean;
  token: string;
  userId: string; // Instagram Business Account ID
  lastSync: string | null; // ISO
}

// ----- 3. Rastreador de Competencia -----

export interface ReelCompetencia {
  id: string;
  titulo: string;
  hook: string;
  temaCentral: string;
  emocionDominante: Emocion;
  estructura: string;
  cta: string;
  vistas: number;
  comentarios: number;
  guardados?: number;
  fechaPublicacion: string; // ISO
  link: string;
  // Descomposición psicológica para adaptar a la marca
  mecanismoPsicologico: string;
  estructuraNarrativa: string;
  tensión: string;
  tipoPromesa: string;
  tipoDolor: string;
}

export interface Competidor {
  id: string;
  nombre: string;
  usuario: string;
  nicho: Nicho;
  seguidores: number;
  linkPerfil: string;
  observacionEstrategica: string;
  reels: ReelCompetencia[];
}

// ----- 4. Community Manager / 5. Calendario -----

export type EstadoPieza =
  | "idea"
  | "guion"
  | "grabado"
  | "editado"
  | "programado"
  | "publicado";

export interface PiezaContenido {
  id: string;
  tituloInterno: string;
  hook: string;
  guion: string;
  descripcion: string;
  cta: string;
  keywordManychat: string;
  plataforma: Plataforma;
  estado: EstadoPieza;
  fechaPublicacion: string; // ISO (incluye hora)
  objetivo: Objetivo;
  formato: FormatoContenido;
  // Datos de calendario / producción
  anguloPsicologico: string;
  emocion: Emocion;
  etapaEmbudo: EtapaEmbudo;
  assets: string[];
  notasGrabacion: string;
}

// ----- 6. Tendencias -----

export type EtiquetaTendencia =
  | "potencial de gancho"
  | "explicativo"
  | "polémico"
  | "emocional"
  | "ignorar";

export interface Tendencia {
  id: string;
  titulo: string;
  fuente: string;
  link: string;
  fecha: string; // ISO
  resumen: string;
  nivelPotencial: number; // 1-10
  porQueSirve: string;
  comoAdaptarla: string;
  posibleHook: string;
  posibleReel: string;
  posibleCarrusel: string;
  posibleStory: string;
  etiqueta: EtiquetaTendencia;
}

// ----- 7. Generador de Guiones -----

export type FormatoGuion =
  | "Reel 30s"
  | "Reel 60s"
  | "Reel 90s"
  | "Carrusel"
  | "Story sequence"
  | "Thread"
  | "Podcast corto"
  | "Email";

export type TonoVariante =
  | "base"
  | "agresiva"
  | "elegante"
  | "espiritual"
  | "corta";

export interface InputsGuion {
  hook: string;
  tema: string;
  emocion: Emocion;
  avatar: string;
  formato: FormatoGuion;
  duracion: string;
  objetivo: Objetivo;
  etapaEmbudo: EtapaEmbudo;
}

export interface BloqueGuion {
  paso: string;
  contenido: string;
}

export interface GuionGenerado {
  id: string;
  inputs: InputsGuion;
  variante: TonoVariante;
  bloques: BloqueGuion[];
  caption: string;
  creadoEn: string; // ISO
}

// ----- 8. Biblioteca de Ideas -----

export type CategoriaIdea =
  | "ego"
  | "apego"
  | "trauma"
  | "sombra"
  | "dinero"
  | "pareja"
  | "propósito"
  | "ansiedad"
  | "identidad"
  | "negocio"
  | "espiritualidad"
  | "disciplina"
  | "autosabotaje";

export type EstadoIdea =
  | "cruda"
  | "buena"
  | "convertir en hook"
  | "convertir en guion"
  | "descartar"
  | "publicada";

export interface Idea {
  id: string;
  idea: string;
  categoria: CategoriaIdea;
  emocion: Emocion;
  nivelPotencia: number; // 1-10
  etapaEmbudo: EtapaEmbudo;
  posibleFormato: FormatoContenido;
  origen: string;
  fecha: string; // ISO
  estado: EstadoIdea;
}

// ----- 9. Diagnóstico Semanal -----

export interface DiagnosticoSemanal {
  id: string;
  semana: string; // ej. "9 - 15 jun 2026"
  loQueFunciono: string[];
  loQueNoFunciono: string[];
  patronDetectado: string;
  hipotesis: string;
  proximoExperimento: string;
  ideasNuevas: string[]; // 5
  hooksRecomendados: string[]; // 3
  decisionEstrategica: string; // 1
}

// ----- Flujo entre módulos -----

/** Carga que viaja del Baúl/Competencia/Ideas hacia el Generador de Guiones. */
export interface HookPendiente {
  texto: string;
  origen: string;
  emocion?: Emocion;
  nicho?: Nicho;
}

/**
 * Base de Conocimiento / Playbook: el "cerebro" de la marca.
 * Se guarda una vez y se inyecta en TODAS las funciones de IA.
 */
export interface Playbook {
  subNicho: string; // nicho y sub-nicho específicos
  avatarProfundo: string; // dolores, lenguaje exacto, objeciones, deseos
  estrategiaEmbudo: string; // qué haces en TOFU / MOFU / BOFU
  pilaresContenido: string; // pilares y temas recurrentes
  estrategiasComunidad: string; // handraising, rituales, Ramiro Cubría, etc.
  estiloComunicacion: string; // voz, do's & don'ts, frases marca
  guionesPropios: string; // tus mejores guiones (ejemplos de tu voz)
  guionesCompetencia: string; // guiones de competencia que admiras + por qué
  actualizado: string; // ISO
}

/** Perfil del avatar cliente (se guarda 1 vez, sirve para todo). */
export interface AvatarProfile {
  nombre: string; // "El Profesional Independiente" o similar
  edad: number;
  genero: "masculino" | "femenino" | "otro";
  estadoCivil: string;
  ingresos: string;
  miedosPrincipales: string[]; // [3-5 miedos clave]
  aspiraciones: string[]; // [3-5 deseos]
  problemasClave: string[]; // [3-5 problemas que resuelves]
  jerga: string;
  dondeConsume: string[]; // ["TikTok", "YouTube", "Reddit", etc.]
  motivacionCompra: string;
  objetos: string; // "venta", "comunidad", "suscripción", etc.
  nicho: string;
  actualizado: string; // ISO
}
