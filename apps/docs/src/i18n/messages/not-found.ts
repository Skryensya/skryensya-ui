export const notFoundMessages = {
  es: {
    "notFound.title": "Página no encontrada",
    "notFound.description": "La ruta solicitada no existe en la documentación de skryensya/ui.",
    "notFound.heading": "Esta ruta no está en la documentación.",
    "notFound.lede":
      "El enlace puede haber cambiado, o la URL no pertenece a este sitio. Abajo están las páginas que más se le parecen; si ninguna sirve, el índice completo está en la barra lateral.",
    /* Etiqueta de la ruta que el lector pidió, rellenada por el script: saber QUÉ se pidió es la
       mitad de entender por qué falló. */
    "notFound.requested": "Pediste",
    "notFound.suggestions": "Quizá buscabas",
    "notFound.searchHint": "Buscar en la documentación",
    "notFound.home": "Ir a la documentación",
    "notFound.railLabel": "Índice de la documentación",
  },
  en: {
    "notFound.title": "Page not found",
    "notFound.description": "The requested path does not exist in the skryensya/ui documentation.",
    "notFound.heading": "This path is not in the documentation.",
    "notFound.lede":
      "The link may have changed, or the URL does not belong to this site. The closest pages are below; if none of them fits, the full index is in the sidebar.",
    "notFound.requested": "You asked for",
    "notFound.suggestions": "You may have meant",
    "notFound.searchHint": "Search the documentation",
    "notFound.home": "Go to the documentation",
    "notFound.railLabel": "Documentation index",
  },
} as const;
