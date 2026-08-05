/*
 * CARD EXAMPLE DATA, shared by the two locale pages and by the live React demos.
 *
 * Card is not a component, so the docs teach it with a LADDER of compositions: each example is a
 * grid of three cards, and the ladder runs from a bare Box to a media Tile that navigates. The copy
 * lives here, once per locale, because three consumers need the same strings (the Spanish page, the
 * English page, and the React island that renders next to both), and a card whose demo says one
 * thing while its source says another teaches nothing.
 *
 * The images are `dummyimage.com` placeholders and not files in `public/`: a card example is about
 * the COMPOSITION, and a checked-in photograph invites the reader to believe the asset is part of
 * the system. A URL that spells out its own dimensions cannot be mistaken for one.
 */

import type { StableIconName } from "@skryensya/core/icon";

export type CardLang = "es" | "en";

/** Placeholder media, sized to the aspect the frame asks for so nothing is re-cropped by the CDN. */
export function dummyImage(width: number, height: number, bg: string, fg: string, text: string) {
  return `https://dummyimage.com/${width}x${height}/${bg}/${fg}&text=${encodeURIComponent(text)}`;
}

/*
 * The same placeholder with NO label, for the two examples that print a caption over the photo.
 * dummyimage centres its text vertically, so a labelled placeholder collides with the caption and
 * the wash ends up demonstrating the opposite of what it is for: a real photograph would put its
 * subject there, not a word. A single space is how the service is asked for a blank panel.
 */
export function blankImage(width: number, height: number, bg: string) {
  return dummyImage(width, height, bg, bg, " ");
}

export type BasicCard = { title: string; body: string };
export type MetaCard = { badge: string; tone: "neutral" | "accent" | "success" | "warning"; date: string; title: string; body: string };
export type AccentCard = { icon: StableIconName; eyebrow: string; title: string; body: string; cta: string };
export type StatCard = { label: string; value: string; change: string; trend: "up" | "down" };
export type LinkCard = { icon: StableIconName; title: string; body: string };
export type ActionCard = { icon: StableIconName; title: string; body: string };
export type SelectCard = { title: string; body: string; checked: boolean };
export type MediaCard = { src: string; alt: string; badge: string; title: string; body: string };
/** `strength` varies across the three so the grid shows what the hook actually does. */
export type GradientCard = { src: string; alt: string; strength: "sm" | "md" | "lg"; eyebrow: string; title: string; body: string };
export type MediaLinkCard = { src: string; alt: string; eyebrow: string; title: string; body: string };
export type ProductCard = { badge: string; tone: "accent" | "neutral"; title: string; body: string; price: string; period: string };

export type CardCopy = {
  /** Label rendered on the grid's accessible name, per example. */
  labels: Record<string, string>;
  basic: BasicCard[];
  meta: MetaCard[];
  accentSoft: AccentCard[];
  accentSolid: AccentCard[];
  stat: StatCard[];
  link: LinkCard[];
  action: ActionCard[];
  select: SelectCard[];
  media: MediaCard[];
  gradient: GradientCard[];
  mediaLink: MediaLinkCard[];
  product: ProductCard[];
  /** Recurring micro-copy: call-to-action strings that repeat across examples. */
  cta: { read: string; open: string; add: string; details: string; month: string };
};

/* Three tints from the accent family so a grid of three reads as a set, not as three unrelated
 * stock photos. Hex, because dummyimage speaks hex and not custom properties. */
const media = {
  a: ["1d4ed8", "eff6ff"],
  b: ["0f766e", "ecfdf5"],
  c: ["7c3aed", "f5f3ff"],
} as const;

/*
 * LIGHT tints, and only for the two examples that put a caption on the image.
 *
 * The wash exists to hold white text over a photograph that might be bright. Demonstrated over the
 * dark tints above, it was invisible (dark ink fading into dark blue), and the example argued
 * against itself: a reader would conclude the gradient does nothing. A pale panel is the honest
 * stand-in for the bright photo the wash is actually for.
 */
const lightMedia = {
  a: "bfdbfe",
  b: "a7f3d0",
  c: "ddd6fe",
} as const;

export const cardCopy: Record<CardLang, CardCopy> = {
  es: {
    labels: {
      basic: "Notas del equipo",
      meta: "Últimas publicaciones",
      accentSoft: "Novedades destacadas",
      accentSolid: "Planes recomendados",
      stat: "Resumen del negocio",
      link: "Accesos directos",
      action: "Acciones del proyecto",
      select: "Preferencias de la cuenta",
      media: "Guías con portada",
      gradient: "Historias destacadas",
      mediaLink: "Artículos recientes",
      product: "Planes de suscripción",
    },
    cta: {
      read: "Leer nota",
      open: "Abrir",
      add: "Añadir",
      details: "Ver detalle",
      month: "/mes",
    },
    basic: [
      { title: "Versión 2.4", body: "Mejora la búsqueda y reduce el tiempo de carga en los proyectos grandes." },
      { title: "Versión 2.3", body: "Añade historial de actividad por proyecto y filtros guardados." },
      { title: "Versión 2.2", body: "Corrige el foco visible en los diálogos anidados y en el menú." },
    ],
    meta: [
      { badge: "Publicado", tone: "success", date: "18 de julio", title: "Cómo diseñamos la vista de actividad", body: "Las decisiones que permiten recorrer seis meses de cambios sin perder el contexto." },
      { badge: "Borrador", tone: "warning", date: "12 de julio", title: "Anatomía de una tarjeta", body: "Por qué la forma visual no alcanza para decidir el elemento que va en la raíz." },
      { badge: "Interno", tone: "neutral", date: "4 de julio", title: "Densidad y toque", body: "Cómo la densidad aprieta el layout sin tocar nunca el área de toque nativa." },
    ],
    accentSoft: [
      { icon: "clock", eyebrow: "Nuevo", title: "Historial por proyecto", body: "Recorre seis meses de cambios sin salir de la vista de actividad.", cta: "Ver novedad" },
      { icon: "filter", eyebrow: "Nuevo", title: "Filtros guardados", body: "Guarda una búsqueda y vuelve a ella desde cualquier proyecto.", cta: "Ver novedad" },
      { icon: "search", eyebrow: "Mejorado", title: "Búsqueda instantánea", body: "Resultados mientras escribes, con teclado y lector de pantalla.", cta: "Ver novedad" },
    ],
    accentSolid: [
      { icon: "success", eyebrow: "Recomendado", title: "Profesional", body: "Todo lo del plan Inicial, más historial ilimitado y roles por proyecto.", cta: "Elegir plan" },
      { icon: "user", eyebrow: "Equipos", title: "Negocio", body: "Auditoría, inicio de sesión único y soporte con acuerdo de nivel de servicio.", cta: "Elegir plan" },
      { icon: "settings", eyebrow: "A medida", title: "Corporativo", body: "Despliegue dedicado, retención a medida y acompañamiento técnico.", cta: "Hablar con ventas" },
    ],
    stat: [
      { label: "Ingresos", value: "48.200 €", change: "12,5%", trend: "up" },
      { label: "Pedidos", value: "1.204", change: "8,2%", trend: "up" },
      { label: "Cancelaciones", value: "0,9%", change: "0,3 puntos", trend: "down" },
    ],
    link: [
      { icon: "info", title: "Documentación", body: "Guías, contratos y decisiones del sistema." },
      { icon: "external-link", title: "Repositorio", body: "Código fuente, issues y releases." },
      { icon: "user", title: "Soporte", body: "Escríbenos y respondemos el mismo día." },
    ],
    action: [
      { icon: "add", title: "Nuevo proyecto", body: "Empieza desde una plantilla o desde cero." },
      { icon: "upload", title: "Importar datos", body: "Sube un CSV y mapea las columnas." },
      { icon: "user", title: "Invitar equipo", body: "Suma personas y asigna un rol." },
    ],
    select: [
      { title: "Resumen semanal", body: "Un correo los lunes con la actividad de tus proyectos.", checked: true },
      { title: "Menciones", body: "Avisos cuando alguien te nombra en un comentario.", checked: false },
      { title: "Novedades", body: "Cambios del producto y notas de versión.", checked: false },
    ],
    media: [
      { src: dummyImage(640, 360, media.a[0], media.a[1], "Tokens"), alt: "Portada de la guía de tokens", badge: "Guía", title: "Tokens de color", body: "Cómo se elige una rampa y por qué el modo oscuro no es un invertido." },
      { src: dummyImage(640, 360, media.b[0], media.b[1], "Layout"), alt: "Portada de la guía de layout", badge: "Guía", title: "Layout y densidad", body: "Stack, Inline y Grid resuelven el 90% de las pantallas sin CSS propio." },
      { src: dummyImage(640, 360, media.c[0], media.c[1], "Motion"), alt: "Portada de la guía de movimiento", badge: "Guía", title: "Movimiento", body: "Duraciones, curvas y la regla que respeta a quien pide menos movimiento." },
    ],
    gradient: [
      { src: blankImage(640, 800, lightMedia.a), strength: "sm", alt: "Fotografía de la campaña Aurora", eyebrow: "Campaña · sm", title: "Aurora", body: "El lavado más liviano, para una foto que ya es oscura donde va el texto." },
      { src: blankImage(640, 800, lightMedia.b), strength: "md", alt: "Fotografía de la campaña Marea", eyebrow: "Campaña · md", title: "Marea", body: "El valor por defecto, y el que sirve para casi cualquier fotografía." },
      { src: blankImage(640, 800, lightMedia.c), strength: "lg", alt: "Fotografía de la campaña Cobalto", eyebrow: "Campaña · lg", title: "Cobalto", body: "El más denso, para una foto clara o con mucho detalle bajo el texto." },
    ],
    mediaLink: [
      { src: blankImage(640, 360, lightMedia.a), alt: "Portada del artículo sobre anclaje", eyebrow: "Producto · 6 min", title: "Anclaje sin JavaScript", body: "Dejamos que el navegador coloque los popups y el código se volvió más chico." },
      { src: blankImage(640, 360, lightMedia.b), alt: "Portada del artículo sobre contraste", eyebrow: "Accesibilidad · 4 min", title: "Contraste que sobrevive un rebranding", body: "Los pares de contraste se prueban solos, y una marca nueva no los rompe." },
      { src: blankImage(640, 360, lightMedia.c), alt: "Portada del artículo sobre bindings", eyebrow: "Ingeniería · 8 min", title: "Un contrato, dos bindings", body: "El mismo marcado en Vanilla y en React, sin una segunda receta de estilos." },
    ],
    product: [
      { badge: "Inicial", tone: "neutral", title: "Inicial", body: "Para una persona que empieza: tres proyectos y treinta días de historial.", price: "0 €", period: "/mes" },
      { badge: "Recomendado", tone: "accent", title: "Profesional", body: "Proyectos ilimitados, historial completo y roles por proyecto.", price: "24 €", period: "/mes" },
      { badge: "Equipos", tone: "neutral", title: "Negocio", body: "Auditoría, inicio de sesión único y soporte con acuerdo de nivel.", price: "72 €", period: "/mes" },
    ],
  },
  en: {
    labels: {
      basic: "Team notes",
      meta: "Latest posts",
      accentSoft: "Highlighted updates",
      accentSolid: "Recommended plans",
      stat: "Business summary",
      link: "Shortcuts",
      action: "Project actions",
      select: "Account preferences",
      media: "Guides with cover",
      gradient: "Featured stories",
      mediaLink: "Recent articles",
      product: "Subscription plans",
    },
    cta: {
      read: "Read note",
      open: "Open",
      add: "Add",
      details: "See details",
      month: "/month",
    },
    basic: [
      { title: "Version 2.4", body: "Improves search and cuts loading time on large projects." },
      { title: "Version 2.3", body: "Adds per-project activity history and saved filters." },
      { title: "Version 2.2", body: "Fixes visible focus in nested dialogs and in the menu." },
    ],
    meta: [
      { badge: "Published", tone: "success", date: "July 18", title: "How we designed the activity view", body: "The decisions that let you walk six months of changes without losing context." },
      { badge: "Draft", tone: "warning", date: "July 12", title: "Anatomy of a card", body: "Why the visual shape is not enough to decide which element goes at the root." },
      { badge: "Internal", tone: "neutral", date: "July 4", title: "Density and touch", body: "How density tightens the layout without ever touching the native touch target." },
    ],
    accentSoft: [
      { icon: "clock", eyebrow: "New", title: "Per-project history", body: "Walk six months of changes without leaving the activity view.", cta: "See what's new" },
      { icon: "filter", eyebrow: "New", title: "Saved filters", body: "Save a search and return to it from any project.", cta: "See what's new" },
      { icon: "search", eyebrow: "Improved", title: "Instant search", body: "Results as you type, with keyboard and screen-reader support.", cta: "See what's new" },
    ],
    accentSolid: [
      { icon: "success", eyebrow: "Recommended", title: "Professional", body: "Everything in Starter, plus unlimited history and per-project roles.", cta: "Choose plan" },
      { icon: "user", eyebrow: "Teams", title: "Business", body: "Audit log, single sign-on and support with a service level agreement.", cta: "Choose plan" },
      { icon: "settings", eyebrow: "Tailored", title: "Enterprise", body: "Dedicated deployment, custom retention and a named technical contact.", cta: "Talk to sales" },
    ],
    stat: [
      { label: "Revenue", value: "€48,200", change: "12.5%", trend: "up" },
      { label: "Orders", value: "1,204", change: "8.2%", trend: "up" },
      { label: "Cancellations", value: "0.9%", change: "0.3 points", trend: "down" },
    ],
    link: [
      { icon: "info", title: "Documentation", body: "Guides, contracts and system decisions." },
      { icon: "external-link", title: "Repository", body: "Source code, issues and releases." },
      { icon: "user", title: "Support", body: "Write to us and we answer the same day." },
    ],
    action: [
      { icon: "add", title: "New project", body: "Start from a template or from scratch." },
      { icon: "upload", title: "Import data", body: "Upload a CSV and map the columns." },
      { icon: "user", title: "Invite team", body: "Add people and assign a role." },
    ],
    select: [
      { title: "Weekly digest", body: "An email on Mondays with your project activity.", checked: true },
      { title: "Mentions", body: "Notices when somebody names you in a comment.", checked: false },
      { title: "Product updates", body: "Product changes and release notes.", checked: false },
    ],
    media: [
      { src: dummyImage(640, 360, media.a[0], media.a[1], "Tokens"), alt: "Cover of the tokens guide", badge: "Guide", title: "Color tokens", body: "How a ramp is chosen and why dark mode is not an inverted palette." },
      { src: dummyImage(640, 360, media.b[0], media.b[1], "Layout"), alt: "Cover of the layout guide", badge: "Guide", title: "Layout and density", body: "Stack, Inline and Grid solve 90% of screens with no CSS of your own." },
      { src: dummyImage(640, 360, media.c[0], media.c[1], "Motion"), alt: "Cover of the motion guide", badge: "Guide", title: "Motion", body: "Durations, curves and the rule that respects anyone asking for less motion." },
    ],
    gradient: [
      { src: blankImage(640, 800, lightMedia.a), strength: "sm", alt: "Photograph from the Aurora campaign", eyebrow: "Campaign · sm", title: "Aurora", body: "The lightest wash, for a photo already dark where the text sits." },
      { src: blankImage(640, 800, lightMedia.b), strength: "md", alt: "Photograph from the Tide campaign", eyebrow: "Campaign · md", title: "Tide", body: "The default, and the one that works for almost any photograph." },
      { src: blankImage(640, 800, lightMedia.c), strength: "lg", alt: "Photograph from the Cobalt campaign", eyebrow: "Campaign · lg", title: "Cobalt", body: "The densest, for a bright photo or heavy detail under the text." },
    ],
    mediaLink: [
      { src: blankImage(640, 360, lightMedia.a), alt: "Cover of the anchoring article", eyebrow: "Product · 6 min", title: "Anchoring without JavaScript", body: "We let the browser place the popups and the code got smaller." },
      { src: blankImage(640, 360, lightMedia.b), alt: "Cover of the contrast article", eyebrow: "Accessibility · 4 min", title: "Contrast that survives a rebrand", body: "Contrast pairs test themselves, and a new brand does not break them." },
      { src: blankImage(640, 360, lightMedia.c), alt: "Cover of the bindings article", eyebrow: "Engineering · 8 min", title: "One contract, two bindings", body: "The same markup in Vanilla and React, with no second styling recipe." },
    ],
    product: [
      { badge: "Starter", tone: "neutral", title: "Starter", body: "For one person getting going: three projects and thirty days of history.", price: "€0", period: "/month" },
      { badge: "Recommended", tone: "accent", title: "Professional", body: "Unlimited projects, full history and per-project roles.", price: "€24", period: "/month" },
      { badge: "Teams", tone: "neutral", title: "Business", body: "Audit log, single sign-on and support with a service level agreement.", price: "€72", period: "/month" },
    ],
  },
};
