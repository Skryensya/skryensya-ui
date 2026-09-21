/*
 * The Installation panel's own chrome: the Vanilla | React switch and the Vanilla half the shell
 * generates for a page that does not write one (`ComponentPageShell.astro`).
 */
export const installMessages = {
  es: {
    "install.bindingGroup": "Binding de la instalación",
    "install.vanillaGenerated":
      "Instala el paquete de tokens y estilos, e importa las hojas que este componente usa. El marcado lo escribes tú: la capa vanilla no trae componentes, trae las clases que ese marcado lleva.",
    "install.vanillaMount":
      "{name} tiene enhancer propio. <code>initComponents()</code> lo monta junto con el resto; esta es la versión aislada, por si prefieres importar sólo este.",
    "install.vanillaNoMount":
      "No hay nada que montar: este componente es marcado y CSS, así que funciona apenas la hoja está cargada.",
  },
  en: {
    "install.bindingGroup": "Installation binding",
    "install.vanillaGenerated":
      "Install the tokens-and-styles package and import the sheets this component uses. The markup is yours to write: the vanilla layer ships no components, it ships the classes that markup carries.",
    "install.vanillaMount":
      "{name} owns an enhancer. <code>initComponents()</code> mounts it along with the rest; this is the isolated version, for when you would rather import only this one.",
    "install.vanillaNoMount":
      "There is nothing to mount: this component is markup and CSS, so it works as soon as the sheet is loaded.",
  },
} as const;
