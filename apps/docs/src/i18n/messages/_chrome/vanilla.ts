export const vanillaMessages = {
  es: {

    "vanilla.title": "Vanilla: instalar y montar",
    "vanilla.intro":
      "Esta ruta no necesita React. Instala Core para los estilos y Vanilla para el enhancer; después elige una estrategia de montaje para cada raíz. Ambas son idempotentes.",
    "vanilla.autoTitle": "Auto, sólo los enhancers presentes",
    "vanilla.autoBody":
      "Úsalo cuando la página contiene varios componentes del sistema: escanea los roots data-sk-* presentes e importa sólo esos tipos. Más sobre cómo funciona en {autoLink}.",
    "vanilla.autoLinkLabel": "Montaje automático",
    "vanilla.onlyTitle": "Sólo {name}",
    "vanilla.onlyBody":
      "Este entry point importa sólo el enhancer de {name}. Sin argumento monta sus instancias en el documento; al pasar una raíz, monta exclusivamente esa instancia.",
    "vanilla.instance": "una instancia",
    "vanilla.autoComment":
      "Cada selector presente dispara sólo el import dinámico de su enhancer.",
    "vanilla.componentComment":
      "Monta sólo {name}; no carga ni recorre otros enhancers.",
  },
  en: {

    "vanilla.title": "Vanilla: install and mount",
    "vanilla.intro":
      "This route does not need React. Install Core for styles and Vanilla for the enhancer, then choose one mounting strategy for each root. Both are idempotent.",
    "vanilla.autoTitle": "Auto, only the enhancers present",
    "vanilla.autoBody":
      "Use this when the page contains several system components: it scans the data-sk-* roots present and imports only those types. More on how it works at {autoLink}.",
    "vanilla.autoLinkLabel": "Automatic mounting",
    "vanilla.onlyTitle": "Only {name}",
    "vanilla.onlyBody":
      "This entry point imports only the {name} enhancer. With no argument it mounts every instance in the document; pass a root to mount only that instance.",
    "vanilla.instance": "one instance",
    "vanilla.autoComment":
      "Each selector present triggers only its enhancer's dynamic import.",
    "vanilla.componentComment":
      "Mounts only {name}; it neither loads nor scans other enhancers.",
  },
} as const;
