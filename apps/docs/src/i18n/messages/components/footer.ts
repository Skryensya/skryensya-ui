export const footerMessages = {
  es: {

    "demo.footer.colProduct": "Producto",
    "demo.footer.colResources": "Recursos",
    "demo.footer.colLegal": "Legal",
    "demo.footer.linkOverview": "Resumen",
    "demo.footer.linkChangelog": "Cambios",
    "demo.footer.linkDocs": "Documentación",
    "demo.footer.linkRepo": "Repositorio",
    "demo.footer.linkLicense": "Licencia",
    "demo.footer.linkPrivacy": "Privacidad",
    "demo.footer.legal": "© 2026 skryensya/ui",
    "demo.footer.built": "Compuesto a mano con skryensya/ui",
    "demo.footer.credit": "Sitio compuesto a mano con skryensya/ui.",

    "footer.description": "El cierre de la página: una banda con superficie propia, un borde arriba y espacio para respirar. Anatomía libre.",
    "footer.betaBadge": "Beta",
    "footer.lede":
      "Footer sólo posee <code>padding</code>, <code>surface</code> y <code>divider</code>, con los valores por defecto pensados para cerrar la página en vez de desaparecer en ella: <code>surface: \"sunken\"</code>, <code>divider</code> prendido y <code>padding: \"lg\"</code>. Las columnas, el aviso legal y el crédito siguen siendo composición libre: <a href=\"/componentes/grid\">Grid</a>, <a href=\"/componentes/nav-list\">NavList</a> y <a href=\"/componentes/typography\">Text</a> adentro.",
    "footer.whenTitle": "Cuándo usarlo",
    "footer.whenBody1":
      "Usa Footer para el cierre de la página: la banda final que dice «la página termina acá», con navegación secundaria, aviso legal o una línea de crédito. El host es un <code>&lt;footer&gt;</code>, y a nivel de documento ese elemento YA es el landmark <code>contentinfo</code> sin escribir <code>role</code>.",
    "footer.whenBody2":
      'Footer no impone anatomía: no hay slots con nombre para columnas ni una barra inferior. Compón adentro con <a href="/components/grid">Grid</a> para la fila de columnas, <a href="/components/nav-list">NavList</a> para cada columna (con su propio nombre accesible) y <a href="/components/wrapper">Wrapper</a> para sostener la medida de la página.',
    "footer.whenBody3":
      'Si sólo hace falta separar una sección del resto en medio de la página, usa <a href="/components/box">Box</a>. Una fila de botones de confirmación abajo de un panel o un diálogo se compone con <a href="/components/inline">Inline</a> dentro de ese contenedor, no con Footer.',
    "footer.htmlTitle": "HTML autorado",
    "footer.patternSiteTitle": "Footer de sitio",
    "footer.patternSiteDescription":
      "Una fila de columnas de enlaces sobre una línea legal, todo dentro de un Wrapper a la medida de la página.",
    "footer.patternCreditTitle": "Línea de crédito",
    "footer.patternCreditDescription":
      "Todo el footer es una sola línea: el cierre de una página personal o de portfolio. El espejo de hero-centered-minimal.",
    "footer.contractItem1":
      'En HTML, usa un <code>&lt;footer&gt;</code> con la clase <code>sk-footer</code>. A nivel de documento ese elemento ya es el landmark <code>contentinfo</code>.',
    "footer.contractItem2":
      '<code>data-surface</code> acepta <code>none</code>, <code>sunken</code> (default), <code>surface</code> o <code>raised</code>.',
    "footer.contractItem3":
      '<code>data-padding</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> (default) o <code>xl</code>. En pantallas angostas <code>lg</code> baja a <code>md</code>.',
    "footer.contractItem4":
      '<code>data-divider</code> (el borde superior) viene prendido; <code>data-divider="false"</code> lo apaga sin mover nada abajo.',
    "footer.a11yP1":
      'El host de <code>Footer</code> es un <code>&lt;footer&gt;</code> real. A nivel de documento (no anidado dentro de <code>article</code>, <code>aside</code>, <code>main</code>, <code>nav</code> o <code>section</code>) ese elemento ES el landmark <code>contentinfo</code> sin escribir <code>role</code>, y un lector de pantalla lo lista junto a <code>banner</code>, <code>main</code> y la navegación de la página.',
    "footer.a11yP2":
      'Debe haber como mucho UN <code>&lt;footer&gt;</code> de documento por página, la misma regla que <code>banner</code> o <code>main</code>. Un footer que pertenece de verdad a un <code>&lt;article&gt;</code> sigue siendo válido, sólo que deja de ser el landmark.',
    "footer.a11yP3":
      'Una fila de columnas de enlaces es navegación: cada columna es un <a href="/components/nav-list">NavList</a> con su propio nombre accesible (<code>aria-label</code> o un encabezado visible), para que la lista de landmarks diga «Footer / Recursos», no una <code>navigation</code> sin nombre por columna.',
    "footer.test1":
      "Por defecto emite el landmark <code>contentinfo</code> con la superficie hundida, el padding grande y el divisor superior que documenta el contrato.",
    "footer.test2":
      "El divisor, el padding y la superficie se pueden cambiar, y <code>as</code> deja de emitir el landmark cuando el footer va anidado dentro de otro elemento.",

    "footer.body":
      "Este sitio consume {core} y los paquetes de componentes por sus exports maps, con bundler, el mismo camino que documenta. Cada píxel sale de un token.",
    /* The section's title, separate from `label`: `label` is the LINK TEXT and is written as an action
       ("Report a problem on GitHub"), which as a heading would be giving an order to someone who may
       not have found any problem. The title asks; the link acts. */
    "footer.reportIssue.title": "¿Encontraste un problema?",
    "footer.reportIssue.label": "Reportar un problema en GitHub",
    /* A sentence that closes itself, without a colon: the control comes below and already announces
       itself with its own label, so the prose does not need to point at it. It used to start with
       "It opens on GitHub…", which referred backwards because the link came first. */
    "footer.reportIssue.description":
      "Si algo no anda como esperabas, el reporte ya lleva la página y tu navegador completados, y espacio para contar qué pasó.",
    /*
     * A lightweight bug footer, not a form: three concrete questions (what did you expect, what
     * happened, how to reproduce it) instead of the earlier "Describe the problem:", which left the
     * reporter to invent their own structure or, more often, give none. `{url}` is the only thing the
     * server can fill in; `{ua}`/`{viewport}` from `footer.reportIssue.environment` are filled in by
     * `report-issue.ts` in the browser, so they are left untouched here (they are never passed `vars`,
     * which is why `t()` leaves them as they are).
     */
    "footer.reportIssue.body":
      "**Página:** {url}\n\n**¿Qué esperabas que pasara?**\n\n\n**¿Qué pasó en cambio?**\n\n\n**Pasos para reproducirlo:**\n1. \n2. \n3. \n",
    /* Appended by `report-issue.ts` at the end of the body above, with JS only: the only thing the
       server cannot know. Without JS the body above is already a complete report on its own. */
    "footer.reportIssue.environment": "\n\n**Entorno:**\n- Navegador: {ua}\n- Tamaño de ventana: {viewport}",
  },
  en: {

    "demo.footer.colProduct": "Product",
    "demo.footer.colResources": "Resources",
    "demo.footer.colLegal": "Legal",
    "demo.footer.linkOverview": "Overview",
    "demo.footer.linkChangelog": "Changelog",
    "demo.footer.linkDocs": "Documentation",
    "demo.footer.linkRepo": "Repository",
    "demo.footer.linkLicense": "License",
    "demo.footer.linkPrivacy": "Privacy",
    "demo.footer.legal": "© 2026 skryensya/ui",
    "demo.footer.built": "Hand-composed with skryensya/ui",
    "demo.footer.credit": "Site hand-composed with skryensya/ui.",

    "footer.description": "A page's close: a band with a surface of its own, a rule above it, and room to breathe. Free anatomy.",
    "footer.betaBadge": "Beta",
    "footer.lede":
      "Footer owns only <code>padding</code>, <code>surface</code> and <code>divider</code>, with defaults tuned to close the page rather than disappear into it: <code>surface: \"sunken\"</code>, <code>divider</code> on, and <code>padding: \"lg\"</code>. Columns, the legal line and the credit stay free composition: <a href=\"/en/components/grid\">Grid</a>, <a href=\"/en/components/nav-list\">NavList</a> and <a href=\"/en/components/typography\">Text</a> inside.",
    "footer.whenTitle": "When to use it",
    "footer.whenBody1":
      "Use Footer for a page's close: the final band that says “the page ends here”, with secondary navigation, a legal line or a credit. The host is a <code>&lt;footer&gt;</code>, and at document level that element already IS the <code>contentinfo</code> landmark with no <code>role</code> written.",
    "footer.whenBody2":
      'Footer imposes no anatomy: there are no named slots for columns or a bottom bar. Compose inside with <a href="/en/components/grid">Grid</a> for the column row, <a href="/en/components/nav-list">NavList</a> for each column (with its own accessible name) and <a href="/en/components/wrapper">Wrapper</a> to hold the page\'s measure.',
    "footer.whenBody3":
      'To separate a section from the rest mid-page, use <a href="/en/components/box">Box</a>. A row of confirm buttons at the bottom of a panel or dialog is composed with <a href="/en/components/inline">Inline</a> inside that container, not with Footer.',
    "footer.htmlTitle": "Authored HTML",
    "footer.patternSiteTitle": "Site footer",
    "footer.patternSiteDescription":
      "A row of link columns over a legal line, all inside a Wrapper at the page's own measure.",
    "footer.patternCreditTitle": "Credit line",
    "footer.patternCreditDescription":
      "The whole footer is one line: a personal or portfolio page's close. The mirror of hero-centered-minimal.",
    "footer.contractItem1":
      'In HTML, use a <code>&lt;footer&gt;</code> with the <code>sk-footer</code> class. At document level that element already is the <code>contentinfo</code> landmark.',
    "footer.contractItem2":
      '<code>data-surface</code> accepts <code>none</code>, <code>sunken</code> (default), <code>surface</code> or <code>raised</code>.',
    "footer.contractItem3":
      '<code>data-padding</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> (default) or <code>xl</code>. On narrow screens <code>lg</code> steps down to <code>md</code>.',
    "footer.contractItem4":
      '<code>data-divider</code> (the top rule) is on by default; <code>data-divider="false"</code> turns it off without shifting anything below.',
    "footer.a11yP1":
      "<code>Footer</code>'s own host is a real <code>&lt;footer&gt;</code>. At document level (not nested inside <code>article</code>, <code>aside</code>, <code>main</code>, <code>nav</code> or <code>section</code>) that element IS the <code>contentinfo</code> landmark with no <code>role</code> written, and a screen reader lists it alongside <code>banner</code>, <code>main</code> and the page's navigation.",
    "footer.a11yP2":
      "There must be AT MOST ONE document-level <code>&lt;footer&gt;</code> per page, the same rule as <code>banner</code> or <code>main</code>. A footer that genuinely belongs to one <code>&lt;article&gt;</code> is still valid, it just is not the landmark.",
    "footer.a11yP3":
      'A row of link columns is navigation: each column is a <a href="/en/components/nav-list">NavList</a> with its own accessible name (<code>aria-label</code> or a visible heading), so the landmark list reads “Footer / Resources”, not one unnamed <code>navigation</code> per column.',
    "footer.test1":
      "Emits the <code>contentinfo</code> landmark by default, with the sunken surface, large padding and top divider the contract documents.",
    "footer.test2":
      "The divider, padding and surface can all be changed, and <code>as</code> drops the landmark when the footer is nested inside another element.",

    "footer.body":
      "This site consumes {core} and the component packages through their exports maps, with a bundler: the same path it documents. Every pixel comes from a token.",
    /* The section's title, kept apart from `label`: `label` is the LINK TEXT and is written as an
       action ("Report an issue on GitHub"), which as a heading would give an instruction to someone
       who may not have found a problem at all. The title asks; the link acts. */
    "footer.reportIssue.title": "Found a problem?",
    "footer.reportIssue.label": "Report an issue on GitHub",
    /* A sentence that closes itself, no colon: the control sits below and already announces itself
       with its own label, so the prose does not need to point at it. It used to open with "Opens on
       GitHub…", which pointed backwards because the link came first. */
    "footer.reportIssue.description":
      "If something is not working the way you expected, the report already has the page and your browser filled in, with room to describe what happened.",
    /* A light bug template, not a form: three concrete prompts (expected, actual, repro steps)
       instead of the old bare "Describe the issue:", which left a reporter to invent their own
       structure or, more often, skip one. `{url}` is what the server can fill; `{ua}`/`{viewport}`
       from `footer.reportIssue.environment` are filled by `report-issue.ts` in the browser, so they
       stay literal here (never passed as `vars`, which is why `t()` leaves them alone). */
    "footer.reportIssue.body":
      "**Page:** {url}\n\n**What did you expect to happen?**\n\n\n**What happened instead?**\n\n\n**Steps to reproduce:**\n1. \n2. \n3. \n",
    /* Appended by `report-issue.ts` to the end of the body above, JS only: the one thing the server
       cannot know. Without JS the body above is already a complete report on its own. */
    "footer.reportIssue.environment": "\n\n**Environment:**\n- Browser: {ua}\n- Window size: {viewport}",
  },
} as const;
