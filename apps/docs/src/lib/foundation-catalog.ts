import { canonicalPath, type Locale } from "../i18n";

type FoundationDescription = Readonly<Record<Locale, string>>;

/*
 * Short, purpose-first summaries for the foundations explorer. Keyed by canonical Spanish href so
 * both locale pages share one inventory; missing copy is a build error, same contract as
 * `component-catalog.ts`.
 */
const foundationDescriptions = {
  "/architecture": {
    es: "Explica cómo un Contract de Core define markup, comportamiento y bindings antes de React o Vanilla.",
    en: "Explains how a Core Contract defines markup, behavior, and bindings before React or Vanilla.",
  },
  "/tiers": {
    es: "Define qué puede referenciar cada tier y por qué la dirección de las referencias sostiene el sistema.",
    en: "Defines what each tier may reference and why reference direction holds the system together.",
  },
  "/reference": {
    es: "Busca cada token del sistema con su tier, valor declarado y valor resuelto en vivo.",
    en: "Looks up every system token with its tier, declared value, and live resolved value.",
  },
  "/dimensions": {
    es: "Compone modo de color, contraste, densidad y radio como cuatro ejes independientes en la cascada.",
    en: "Composes color mode, contrast, density, and radius as four independent cascade axes.",
  },
  "/density": {
    es: "Recalcula tokens de espacio y control dentro de un componente sin compactar el resto de la interfaz.",
    en: "Recalculates spacing and control tokens inside one component without compacting the rest of the interface.",
  },
  "/elevation": {
    es: "Ofrece cinco niveles de sombra nombrados para profundidad sin escribir box-shadow a mano.",
    en: "Offers five named shadow levels for depth without hand-written box-shadow.",
  },
  "/typography": {
    es: "Empareja cada tamaño con su interlineado y nombra un peso por rol, sobre una familia que viaja con el paquete.",
    en: "Pairs every size with its line-height and names one weight per role, on a family that ships with the package.",
  },
  "/icons": {
    es: "Nombra roles de icono estables mientras un set elige la geometría de marca de cada rol.",
    en: "Names stable icon roles while a set chooses the brand geometry for each role.",
  },
  "/styling-hooks": {
    es: "Expone las perillas públicas con las que redefinir la pintura de un componente ya publicado.",
    en: "Exposes the public knobs for redefining a shipped component's paint.",
  },
  "/state-layer": {
    es: "Pinta hover, focus, pressed y selected con un overlay compartido teñido por currentColor.",
    en: "Paints hover, focus, pressed, and selected feedback with one shared currentColor overlay.",
  },
  "/motion": {
    es: "Consume tokens de intención para que los componentes describan el sentido del movimiento, no duraciones crudas.",
    en: "Consumes intent tokens so components describe what movement means, not raw durations.",
  },
  "/effects": {
    es: "Agrega clases CSS opt-in para motion decorativo sobre markup o componentes existentes.",
    en: "Adds opt-in CSS classes for decorative motion on existing markup or components.",
  },
  "/zoom": {
    es: "Conserva contenido, controles y funcionalidad al ampliar texto y obligar al layout a refluir.",
    en: "Preserves content, controls, and functionality when text enlarges and layout must reflow.",
  },
  "/keyboard": {
    es: "Documenta qué hace cada tecla en cada componente, verificada contra su máquina o elemento nativo.",
    en: "Documents what each key does per component, verified against its machine or native element.",
  },
  "/storage": {
    es: "Persiste preferencias declaradas con un códec en Core y bindings para Vanilla y React.",
    en: "Persists declared preferences through one core codec with vanilla and React bindings.",
  },
  "/anchoring": {
    es: "Posiciona superficies flotantes contra un ancla, volteándolas cuando no caben en pantalla.",
    en: "Positions floating surfaces against an anchor, flipping them when they do not fit.",
  },
  "/splitter": {
    es: "Redimensiona paneles o columnas vecinas con un separador arrastrable compartido por teclado o puntero.",
    en: "Resizes neighboring panels or columns with one shared draggable separator handle.",
  },
  "/scroll-lock": {
    es: "Congela el scroll detrás de un dialog modal y reserva el gutter de la scrollbar para evitar saltos.",
    en: "Freezes scroll behind a modal dialog and reserves the scrollbar gutter to prevent layout shift.",
  },
  "/gradients": {
    es: "Protege tipografía sobre fotos con un wash del tamaño del texto teñido con accent.",
    en: "Protects type on photos with a text-sized gradient wash tinted by accent.",
  },
  "/transparency": {
    es: "Construye superficies translúcidas con blur, fallback opaco y reducción automática de transparencia.",
    en: "Builds translucent surfaces with blur, opaque fallback, and automatic reduced-transparency support.",
  },
} as const satisfies Readonly<Record<string, FoundationDescription>>;

type FoundationDescriptionHref = keyof typeof foundationDescriptions;

/** Resolve a localized route back to its canonical catalog summary. Missing copy is a build error. */
export function getFoundationDescription(href: string, locale: Locale): string {
  const canonical = canonicalPath(href) as FoundationDescriptionHref;
  const description = foundationDescriptions[canonical];

  if (!description) {
    throw new Error(`Missing foundation catalog description for ${canonical}`);
  }

  return description[locale];
}
