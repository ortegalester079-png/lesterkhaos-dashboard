# CLAUDE.md — @lesterkhaos · Content OS

Guía técnica y de producto del tablero. Está escrita para que puedas
modificarlo tú mismo (o pedírselo a Claude) sin perderte.

> Filosofía del producto: esto no es un "social media planner" genérico. Es un
> sistema operativo de contenido para usar las publicaciones como herramienta de
> **posicionamiento**, **diagnóstico psicológico** y **conversión a conversación
> privada (DM)**. Cada módulo empuja hacia esa conversión.

---

## 0. Estado del sistema — tabla completa

### Módulos del tablero

| # | Módulo | Qué hace | IA | Estado |
|---|--------|----------|----|--------|
| 00 | **Base de Conocimiento** (`/playbook`) | Tu playbook (avatar profundo, guiones, estrategias, handraising, estilo). Se inyecta en TODA la IA | — | ✅ Listo |
| 00 | **Perfil del Avatar** (`/avatar`) | Define tu cliente ideal (miedos, deseos, jerga). Alimenta a toda la IA | — | ✅ Listo |
| 00 | **Asistente Estratégico** (`/asistente`) | Chat tipo Head de Contenido con playbook + avatar + métricas + competencia. Toggle de **búsqueda web en vivo** | 🤖 | ✅ Listo |
| 01 | **Baúl de Ganchos** (`/ganchos`) | Guarda, clasifica y reutiliza hooks | — | ✅ Listo |
| 02 | **Biblioteca de Ideas** (`/ideas`) | Captura ideas + **Generar ideas con IA** | 🤖 | ✅ Listo |
| 03 | **Generador de Guiones** (`/guiones`) | Hook → guion 7-pasos + **Optimizar con IA** | 🤖 | ✅ Listo |
| 04 | **Community Manager** (`/community`) | Prepara publicaciones multiplataforma | — | ✅ Listo |
| 05 | **Calendario** (`/calendario`) | Programación mensual/semanal/diaria | — | ✅ Listo |
| 06 | **Métricas** (`/metricas`) | Rendimiento real, **sincroniza con Instagram** | — | ✅ Listo |
| 07 | **Rastreador de Competencia** (`/competencia`) | Disecciona reels de referentes | — | ✅ Listo |
| 08 | **Tendencias** (`/tendencias`) | Señales diarias para contenido | — | ✅ Listo |
| 09 | **Auditoría de Perfil** (`/auditoria`) | Revisa bio, highlights, pines + reescribe bio | 🤖 | ✅ Listo |
| 10 | **Diagnóstico Semanal** (`/diagnostico`) | Lectura analítica + **Generar con IA** | 🤖 | ✅ Listo |

### Integraciones / conectores

| Conector | Para qué | Estado |
|----------|----------|--------|
| **Instagram Graph API** | Trae vistas, guardados, alcance, compartidos por pieza | ✅ Conectado (token en el navegador) |
| **Claude API** | Las 5 funciones de IA (modelo configurable en `.env.local`) | ✅ Conectado (con crédito) |
| **ManyChat** | DMs, keywords, leads reales | ⏳ Sugerido (siguiente) |
| **Slack / Email** | Avisos automáticos de resultados | ⏳ Sugerido |
| **TikTok / Google Trends** | Tendencias en vivo | ⏳ Sugerido |

### Roles que pediste — cómo los cubre el sistema

| Rol que pediste | Cómo lo cubre | Estado |
|-----------------|---------------|--------|
| **Analista de datos** | Diagnóstico Semanal con IA (lee tus métricas reales) | ✅ |
| **Estratega de contenido** | Asistente Estratégico (chat con todo tu contexto) | ✅ |
| **Generador de ideas** | Biblioteca de Ideas con IA | ✅ |
| **Guionista** | Generador de Guiones + Script Optimizer | ✅ |
| **Optimización de perfil** (bio, highlights, pines) | Auditoría de Perfil con IA | ✅ |
| **Cobertura de formatos** (reels, carruseles, historias, handraising) | Ideas/Asistente generan los 3 formatos + mecánica handraising | ✅ |
| **Estudiar marketing del nicho en tiempo real** | Asistente con búsqueda web en vivo | ✅ |
| **Crear comunidad** | Estrategias en el Playbook + Asistente + Community Manager | ✅ (manual de ejecución) |
| **Encargado de publicación** | Community Manager + Calendario | ⚠️ Manual (no auto-publica; Meta lo permitiría como mejora futura) |
| **Métricas privadas de competencia** (sus leads/ventas) | — | ❌ Imposible: Instagram no expone datos de cuentas ajenas |

> 🤖 = usa Claude API (consume crédito, ~1-2 centavos por uso). Las funciones IA
> necesitan: (a) crédito en console.anthropic.com y (b) tener tu Avatar definido.

---

## 1. Qué herramientas usé

| Capa | Herramienta | Por qué |
|------|-------------|---------|
| Framework | **Next.js 14 (App Router)** | Rutas por carpeta, server components, fácil de escalar y desplegar (Vercel). |
| Lenguaje | **TypeScript** (estricto) | Un modelo de dominio tipado evita errores al conectar datos reales. |
| Estilos | **Tailwind CSS 3** | Sistema de utilidades + tokens por variables CSS. |
| Componentes | **shadcn/ui** (patrón) | Componentes accesibles sobre Radix UI, copiados al repo en `components/ui` → 100% tuyos, sin caja negra. |
| Primitivas | **Radix UI** | Dialog, Select, Tabs, Dropdown, Avatar, Switch, etc. accesibles. |
| Estado | **Zustand + persist** | Store global simple, persistido en `localStorage`. Es la "base de datos" temporal. |
| Iconos | **lucide-react** | Set de iconos limpio y coherente. |
| Utilidades | **clsx + tailwind-merge** (`cn`) | Composición de clases sin conflictos. |

No se usó ninguna librería de gráficos: las visualizaciones (sparklines, barras
de nivel) son **SVG puro**, para mantener el bundle ligero y el control total
del estilo.

---

## 2. Qué decisiones tomé (y por qué)

1. **Modo oscuro forzado, no togglable.** La marca es carbón + terracota; un
   modo claro rompería la identidad. El tema vive en `app/globals.css` como
   variables HSL (`--background`, `--primary`, etc.). El `<html>` lleva la clase
   `dark` fija en `app/layout.tsx`.

2. **Tipografía sin descarga externa.** Para garantizar que la app arranque
   siempre (incluso sin internet en el build), uso *stacks* del sistema: una
   **serif editorial** (`--font-serif`) para titulares y números grandes, y una
   **sans de alta legibilidad** (`--font-sans`) para el cuerpo. Cómo poner una
   tipografía propia: ver §4.

3. **Zustand con `persist` como capa de datos.** Toda la UI lee y escribe contra
   el store (`store/use-app-store.ts`), nunca contra los mocks directamente. Eso
   significa que **cambiar a una base de datos real no toca ningún componente**:
   solo se reescribe el store. Ver §4 → "Conectar datos reales".

4. **`partialize`:** solo se persisten las colecciones de datos. El "gancho en
   tránsito" (flujo entre módulos) y banderas internas no se guardan, para que no
   reaparezcan tras recargar.

5. **Generación de copy/guiones por plantillas, no por IA (todavía).** El motor
   (`lib/script-generator.ts` y `lib/platform-copy.ts`) es **determinista y
   offline**, con la voz de marca codificada. Funciona sin API key. Está aislado
   para que conectar Claude sea cambiar una función. Ver §5.

6. **Sin scraping.** El Rastreador de Competencia es **manual a propósito**:
   pegas links y métricas. Respeta las reglas de las plataformas.

7. **Flujo entre módulos vía `hookPendiente`.** "Usar este gancho",
   "Convertir en guion", "Crear versión para mi avatar", "Usar hook" (tendencias,
   diagnóstico, ideas) escriben un objeto `hookPendiente` en el store y navegan al
   Generador, que lo consume y precarga el formulario.

8. **Componentes reutilizables.** Tarjetas de métrica, filtros, barras de nivel,
   estados vacíos y *form bits* viven en `components/shared` y se usan en todos
   los módulos. Agregar un módulo nuevo es ensamblar piezas existentes.

---

## 3. Cómo funciona cada módulo

Estructura de carpetas relevante:

```
app/
  layout.tsx            → shell global (sidebar + topbar)
  page.tsx              → Inicio (centro de mando)
  ganchos/page.tsx      → 1. Baúl de Ganchos
  metricas/page.tsx     → 2. Métricas
  competencia/page.tsx  → 3. Rastreador de Competencia
  community/page.tsx    → 4. Community Manager
  calendario/page.tsx   → 5. Calendario de Contenido
  tendencias/page.tsx   → 6. Tendencias
  guiones/page.tsx      → 7. Generador de Guiones
  ideas/page.tsx        → 8. Biblioteca de Ideas
  diagnostico/page.tsx  → 9. Diagnóstico Semanal
components/
  ui/                   → primitivas shadcn/ui (Button, Card, Dialog, …)
  layout/               → Sidebar, Topbar, AppShell
  shared/               → StatCard, Sparkline, LevelBar, FilterSelect, …
lib/
  types.ts              → modelo de dominio (la fuente de verdad)
  options.ts            → listas canónicas (nichos, emociones, estados…)
  mock-data.ts          → datos ficticios iniciales
  metrics.ts            → cálculos (ventanas, agregados, bombazo, top)
  script-generator.ts   → motor de guiones (voz de marca)
  platform-copy.ts      → motor de copy multiplataforma
  nav.ts                → definición del menú lateral
  utils.ts              → helpers (cn, formatNumber, fechas, uid)
store/
  use-app-store.ts      → estado global + persistencia
```

- **Inicio** — KPIs de 30 días, tendencia de vistas, diagnóstico de la semana,
  mejores piezas, próximas publicaciones y accesos a módulos.

- **1. Baúl de Ganchos** — CRUD de hooks con todos los campos (texto, nicho,
  emoción, tipo, niveles de dolor/curiosidad, formato, fuente, link, métricas,
  estado). Filtros por nicho, emoción, tipo, formato, estado + orden por vistas +
  buscador. Botón **"Usar este gancho"** → lo manda al Generador.

- **2. Métricas** — pestañas 7/30/90 días. Tarjetas (vistas, seguidores, DMs,
  guardados, compartidos, tasa de conversación, conversión a lead). Marca
  **"Bombazo"** a la pieza que duplica la mediana de vistas de 30 días
  (`umbralBombazo` en `lib/metrics.ts`). Top 5 conmutables por vistas / guardados
  / compartidos / DMs / leads, cada una con análisis (por qué funcionó, emoción,
  qué repetir, qué evitar).

- **3. Rastreador de Competencia** — competidores con sus reels (manual, pega
  links y métricas). Cada reel: **Guardar en Baúl**, **Convertir en guion**,
  **Versión para mi avatar** (extrae mecanismo psicológico, estructura, emoción,
  tensión, promesa y dolor, y genera una adaptación a tu marca — sin copia
  literal) y **Descartar**. Banner del ritual dominical.

- **4. Community Manager** — piezas con todos sus campos y estados. **"Generar
  copy"** produce caption IG, descripción TikTok, título Shorts, post Threads,
  mensaje WhatsApp y asunto+cuerpo de email, todo en la voz de marca. Botón
  **"Marcar listo para publicar"** (sustituye a "Publicar" mientras no haya API).

- **5. Calendario** — vistas mensual / semanal / diaria, navegación, filtros
  (plataforma, estado, objetivo, embudo, formato). **Arrastrar y soltar** una
  pieza la reprograma (`moverPiezaFecha`). Click → panel lateral con guion,
  caption, CTA, ángulo psicológico, emoción, etapa del embudo, assets y notas.

- **6. Tendencias** — vista **"Resumen diario"** (top 5 por potencial) + vista
  "Todas" con filtros. Cada tendencia sugiere hook/reel/carrusel/story y se puede
  mandar el hook al Generador. Aviso del resumen 7 AM (Slack pendiente, ver §5).

- **7. Generador de Guiones** — inputs (hook, tema, emoción, avatar, formato,
  duración, objetivo, embudo). Estructura de 7 pasos para reels. Variantes de
  tono: **más agresiva / elegante / espiritual / corta** + story sequence.
  Acciones: guardar guion, copiar, enviar al calendario, crear caption.

- **8. Biblioteca de Ideas** — captura rápida con categoría, emoción, potencia,
  embudo, formato, origen, estado. Convierte una idea **a gancho** o **a guion**.

- **9. Diagnóstico Semanal** — lectura automática de los datos de 7 días
  (emociones, hooks, formatos→DMs, leads, views vacías) + el resumen estratégico
  de 8 puntos (lo que funcionó / no, patrón, hipótesis, experimento, 5 ideas,
  3 hooks, 1 decisión). Los 3 hooks recomendados se pueden mandar al Generador.

---

## 4. Cómo modificarlo después

### Cambiar colores / tema
Edita las variables en `app/globals.css` (bloque `:root`). El acento terracota es
`--primary`. Todo (botones, badges, gráficos) hereda de ahí.

### Cambiar la tipografía
En `app/globals.css`, redefine `--font-sans` / `--font-serif`. Para una fuente de
Google con `next/font`:
```ts
// app/layout.tsx
import { Inter, Fraunces } from "next/font/google";
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });
// <html className={`dark ${sans.variable} ${serif.variable}`}>
```

### Agregar o quitar un módulo del menú
Edita `lib/nav.ts` (un objeto por entrada) y crea la carpeta `app/<ruta>/page.tsx`.
La sidebar se actualiza sola.

### Agregar un campo a una entidad
1. Añádelo en `lib/types.ts`.
2. Rellénalo en `lib/mock-data.ts`.
3. Úsalo en la página correspondiente y, si va en un formulario, en su diálogo.

### Agregar una opción a un filtro
Edita la lista en `lib/options.ts` (una sola fuente para filtros y formularios).

### Conectar datos reales (la pieza clave)
Toda la UI habla con `store/use-app-store.ts`, no con los mocks. Para usar una
base de datos (Supabase, Postgres/Prisma, Notion, etc.):

1. Sustituye los `seed*` por un fetch inicial, o hidrata el store desde el
   servidor.
2. En cada acción (`addGancho`, `updatePieza`, `moverPiezaFecha`, …) añade la
   llamada a tu API junto al `set(...)` (patrón *optimistic update*).
3. Cambia el `storage` de `persist` o elimínalo si la fuente de verdad pasa a ser
   el servidor.

Como los componentes solo usan las acciones del store, **no hay que tocar la UI**.

### Resetear el demo
El store expone `resetDemo()`. Útil tras experimentar: vuelve al estado inicial.

### Política de datos (importante)
Decisión de producto para no mostrar datos falsos como si fueran reales:

- **Métricas y Rastreador de Competencia arrancan VACÍOS.** Son datos sobre la
  realidad (tu rendimiento, cuentas reales) y no deben inventarse. Los cargas tú:
  en Métricas con **"Registrar pieza"**; en Competencia con **"Competidor"** y
  **"Pegar reel"**. El **Diagnóstico Semanal** se calcula a partir de esas
  métricas reales, así que también empieza vacío (muestra un estado inicial).
- **Ganchos, Ideas, Tendencias y Contenido/Calendario** traen *ejemplos* de
  muestra (plantillas de inspiración, no afirman nada sobre tu cuenta). La UI los
  marca con el aviso **"Datos de ejemplo"** (`components/shared/ejemplo-badge.tsx`),
  que desaparece solo cuando borras los ejemplos.
- **Migración del store:** `persist` está en `version: 2` con una función
  `migrate` que limpia métricas/competidores de versiones anteriores. Por eso, si
  ya habías abierto la app con datos de ejemplo guardados en el navegador, al
  recargar esos números inventados desaparecen automáticamente.

---

## 4b. Conectar Instagram (ya implementado)

El tablero trae la conexión con la **Instagram Graph API** de Meta. Código:
`app/api/instagram/sync/route.ts` (servidor, habla con Meta), `lib/instagram.ts`
(cliente) y el bloque "Conectar Instagram / Sincronizar" en `app/metricas/page.tsx`.
El token y el ID se guardan en el navegador (store persistido).

**Qué trae por pieza:** vistas/alcance, likes, comentarios, guardados, compartidos.
**Qué NO** (se queda en 0 o se completa a mano / ManyChat / CRM): seguidores
nuevos por pieza, DMs, leads, llamadas, ventas.

### Guía para obtener el token (cuenta Profesional)
Requisito previo: la cuenta de Instagram debe ser **Profesional** y estar
**vinculada a una Página de Facebook** (gratis, desde Meta Business Suite).

1. Entra a **developers.facebook.com** → *Mis apps* → **Crear app** → tipo
   **Empresa** → ponle un nombre.
2. En la app, agrega el producto **Instagram Graph API** (o *Facebook Login*).
3. Abre el **Explorador de la API Graph**: developers.facebook.com/tools/explorer
4. Arriba a la derecha, elige tu app y pulsa **Generar token de acceso**. Acepta
   estos permisos: `instagram_basic`, `instagram_manage_insights`,
   `pages_show_list`, `pages_read_engagement`, `business_management`.
5. Copia el token (corto, dura ~1 hora).
6. **Tu Instagram Business Account ID:** en el Explorador consulta
   `me/accounts?fields=name,instagram_business_account` → *Enviar*. Copia el número
   de `instagram_business_account.id`.
7. **(Recomendado) Token largo (60 días):** pega esta URL en el navegador,
   reemplazando los datos (App ID y App Secret están en *Configuración → Básica*):
   `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=TOKEN_CORTO`
   Copia el `access_token` que devuelve.
8. En el tablero → **Métricas → Conectar Instagram**: pega el **ID** y el **token**,
   y pulsa **Conectar y sincronizar**.

El token largo caduca cada ~60 días: cuando deje de funcionar, repite del paso 4 al
8 y pega el nuevo. (Automatizar el refresco es una mejora futura.)

> Alternativa más segura (opcional, técnica): guardar el token en `.env.local`
> (`IG_ACCESS_TOKEN`, `IG_USER_ID`) y leerlo en la ruta API en vez del navegador.

---

## 5. Integraciones futuras que se pueden agregar

1. **Generación con IA (Claude).** Reemplaza el motor de plantillas por la API de
   Anthropic. El system prompt de marca ya está en `lib/script-generator.ts`
   (`SYSTEM_VOICE`). Crea una API route y llama al modelo más capaz:
   ```ts
   // app/api/guion/route.ts
   import Anthropic from "@anthropic-ai/sdk";
   const client = new Anthropic();
   export async function POST(req: Request) {
     const inputs = await req.json();
     const msg = await client.messages.create({
       model: "claude-opus-4-8", // modelo más reciente y capaz
       max_tokens: 1500,
       system: SYSTEM_VOICE,
       messages: [{ role: "user", content: prompt(inputs) }],
     });
     return Response.json(msg);
   }
   ```
   Luego cambia `generarGuion` para llamar a `/api/guion`. Lo mismo aplica a
   `lib/platform-copy.ts`.

2. **Instagram Graph API / ManyChat.** Métricas reales (vistas, guardados,
   alcance) y disparo de keywords. Sustituye `mock-data.ts` por las respuestas de
   la API y conecta el botón "Publicar".

3. **Resumen diario a Slack (7 AM).** Un cron (Vercel Cron o GitHub Actions) que
   arme el top 5 de Tendencias y lo envíe por *Incoming Webhook* de Slack. La
   vista "Resumen diario" ya tiene el formato.

4. **Autenticación.** NextAuth/Clerk para multiusuario si algún día hay equipo.

5. **Base de datos.** Supabase o Postgres + Prisma siguiendo el modelo de
   `lib/types.ts` (cada interfaz ≈ una tabla).

6. **Importación de tendencias.** Lectores RSS/API de los blogs de OpenAI y
   Anthropic, y de newsletters, para precargar el módulo de Tendencias.

7. **Subida de capturas.** Almacenamiento (S3/Supabase Storage) para adjuntar
   capturas de reels de competencia en lugar de solo pegar métricas.

---

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # entorno de desarrollo  → http://localhost:3000
npm run build    # build de producción
npm run start    # servir el build
```

> Datos: al primer arranque la app carga los mocks de `lib/mock-data.ts` y los
> guarda en `localStorage`. Para empezar de cero, borra el almacenamiento del
> navegador o llama a `resetDemo()`.
