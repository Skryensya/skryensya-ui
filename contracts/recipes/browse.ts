import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/**
 * A catalogue you filter and scan.
 *
 * Two decisions carry this one, and both are about the states nobody designs.
 *
 * The LOADING state is skeletons, not a spinner. The shape of what is coming is already known — a
 * grid of cards — and a spinner throws that information away, so the page jumps when the data lands.
 * Placeholder exists for exactly this and is the only honest use of it: a skeleton for a shape you
 * cannot predict is a lie drawn in grey.
 *
 * The EMPTY state keeps the filters. A catalogue that empties itself and then hides the controls
 * that emptied it leaves no way back except the browser's Back button — and the filter that did it
 * is usually one click from being undone.
 */
export const browseRecipe: Recipe = {
  id: "browse",
  intent: "Un catálogo que se filtra y se recorre, con la ruta y los filtros siempre a la vista.",
  notes: [
    "Cargando son esqueletos, no un spinner: la forma de lo que viene ya se conoce, y un spinner tira esa información — la página salta cuando llegan los datos.",
    "El estado vacío **conserva los filtros**. Un catálogo que se vacía y esconde el control que lo vació no deja vuelta atrás salvo el botón del navegador.",
    "El Breadcrumb dice dónde estás, no cómo llegaste: es la ruta del contenido, no el historial de navegación.",
    "El texto sobre la foto necesita un MediaCaption, no sólo un gradiente: el lavado se dimensiona al texto que protege, y suelto no pinta nada.",
  ],

  states: {
    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        crumbs(),
        filters(),
        {
          contract: "layout",
          signature: "Grid",
          options: { columns: "3", gap: "md" },
          children: [
            { contract: "placeholder", signature: "Placeholder", options: { shape: "block" } },
            { contract: "placeholder", signature: "Placeholder", options: { shape: "block" } },
            { contract: "placeholder", signature: "Placeholder", options: { shape: "block" } },
          ],
        },
      ],
    },

    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        crumbs(),
        filters(),
        {
          contract: "empty-state",
          signature: "EmptyState",
          slots: {
            icon: { contract: "icon", signature: "Icon", options: { name: "search" } },
            title: "Ningún producto con estos filtros",
            description: "Probá quitando alguno para ver más resultados.",
            actions: { contract: "button", signature: "Button.action", children: "Limpiar filtros" },
          },
        },
      ],
    },

    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        crumbs(),
        {
          contract: "alert",
          signature: "Alert",
          options: { tone: "danger" },
          slots: {
            title: "No pudimos cargar el catálogo",
            actions: { contract: "button", signature: "Button.action", children: "Reintentar" },
          },
          children: "Volvé a intentar en unos segundos.",
        },
      ],
    },

    success: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        crumbs(),
        filters(),
        {
          contract: "carousel",
          signature: "Carousel",
          attrs: { "aria-label": "Destacados de la temporada" },
          children: [card("Silla Valparaíso"), card("Mesa Atacama"), card("Lámpara Chiloé")],
        },
      ],
    },
  },
};

/** Where you are in the catalogue. The content's path, never the navigation history. */
function crumbs(): UsageTree {
  return {
    contract: "breadcrumb",
    signature: "Breadcrumb",
    options: { label: "Ruta" },
    slots: {
      items: [
        { options: { href: "/" }, slots: { label: "Inicio" } },
        { options: { href: "/muebles" }, slots: { label: "Muebles" } },
        { options: { current: true }, slots: { label: "Living" } },
      ],
    },
  };
}

/*
 * The filter row, identical in the states that HAVE filters.
 *
 * Absent from `error` on purpose: filtering a catalogue that could not load is a control that cannot
 * do anything, the same rule that keeps the pager out of an empty table.
 */
function filters(): UsageTree {
  return {
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", wrap: false },
    children: [
      {
        contract: "segmented",
        signature: "Segmented",
        options: { value: "todos" },
        attrs: { "aria-label": "Disponibilidad" },
        slots: {
          items: [
            { options: { value: "todos" }, slots: { label: "Todos" } },
            { options: { value: "stock" }, slots: { label: "En stock" } },
          ],
        },
      },
      {
        contract: "flyout",
        signature: "Flyout",
        options: { placeholder: "Ordenar por" },
        slots: {
          label: "Orden",
          items: [
            { options: { value: "relevancia" }, slots: { label: "Relevancia" } },
            { options: { value: "precio" }, slots: { label: "Precio" } },
            { options: { value: "novedad" }, slots: { label: "Novedad" } },
          ],
        },
      },
      {
        contract: "tag",
        signature: "Tag",
        options: { removable: true, removeLabel: "Quitar el filtro: menos de $100" },
        children: "menos de $100",
      },
    ],
  };
}

/*
 * One card: a framed photo with its title ON the photo.
 *
 * The caption is what sizes the wash — a MediaGradient on its own is `position: absolute` with no
 * box to fill, and paints nothing. The pattern only exists as the pair.
 */
function card(title: string): UsageTree {
  return {
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "4/3", radius: "surface" },
      children: {
        contract: "media-gradient",
        signature: "MediaCaption",
        children: [
          { contract: "media-gradient", signature: "MediaGradient", options: { strength: "lg" } },
          { contract: "typography", signature: "Heading", children: title },
        ],
      },
    },
  };
}
