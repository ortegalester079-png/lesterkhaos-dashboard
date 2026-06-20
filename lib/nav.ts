import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BarChart3,
  Crosshair,
  Send,
  Calendar,
  TrendingUp,
  PenLine,
  Lightbulb,
  Stethoscope,
  LayoutDashboard,
  UserRound,
  Bot,
  ScanSearch,
  BookOpen,
} from "lucide-react";

/** Grupos de navegación, en orden. El flujo es: definir → crear → analizar. */
export const navGroups = ["Estrategia", "Crear", "Inteligencia"] as const;
export type NavGroup = (typeof navGroups)[number];

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  group: NavGroup;
}

/** Navegación principal del tablero. Agregar un módulo = agregar una entrada. */
export const navItems: NavItem[] = [
  // ----- Estrategia: la base de todo -----
  {
    href: "/",
    label: "Inicio",
    icon: LayoutDashboard,
    description: "Vista general del sistema",
    group: "Estrategia",
  },
  {
    href: "/playbook",
    label: "Base de Conocimiento",
    icon: BookOpen,
    description: "Tu playbook: el cerebro de la IA",
    group: "Estrategia",
  },
  {
    href: "/avatar",
    label: "Perfil del Avatar",
    icon: UserRound,
    description: "Tu cliente ideal: alimenta a la IA",
    group: "Estrategia",
  },
  {
    href: "/asistente",
    label: "Asistente Estratégico",
    icon: Bot,
    description: "Tu Head de Contenido con IA",
    group: "Estrategia",
  },
  // ----- Crear: del hook al calendario -----
  {
    href: "/ganchos",
    label: "Baúl de Ganchos",
    icon: Archive,
    description: "Guarda, clasifica y reutiliza hooks",
    group: "Crear",
  },
  {
    href: "/ideas",
    label: "Biblioteca de Ideas",
    icon: Lightbulb,
    description: "Ideas crudas + generador con IA",
    group: "Crear",
  },
  {
    href: "/guiones",
    label: "Generador de Guiones",
    icon: PenLine,
    description: "Convierte hooks en guiones + IA",
    group: "Crear",
  },
  {
    href: "/community",
    label: "Community Manager",
    icon: Send,
    description: "Prepara publicaciones multiplataforma",
    group: "Crear",
  },
  {
    href: "/calendario",
    label: "Calendario de Contenido",
    icon: Calendar,
    description: "Programación mensual / semanal / diaria",
    group: "Crear",
  },
  // ----- Inteligencia: medir, comparar, decidir -----
  {
    href: "/metricas",
    label: "Métricas",
    icon: BarChart3,
    description: "Rendimiento real desde Instagram",
    group: "Inteligencia",
  },
  {
    href: "/competencia",
    label: "Rastreador de Competencia",
    icon: Crosshair,
    description: "Qué funciona en cuentas referentes",
    group: "Inteligencia",
  },
  {
    href: "/tendencias",
    label: "Tendencias",
    icon: TrendingUp,
    description: "Señales diarias para contenido",
    group: "Inteligencia",
  },
  {
    href: "/auditoria",
    label: "Auditoría de Perfil",
    icon: ScanSearch,
    description: "Bio, highlights y pines con IA",
    group: "Inteligencia",
  },
  {
    href: "/diagnostico",
    label: "Diagnóstico Semanal",
    icon: Stethoscope,
    description: "Análisis y decisiones de la semana",
    group: "Inteligencia",
  },
];
