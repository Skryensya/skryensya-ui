export const componentMessages = {
  es: {

    /*
     * The hero-tabs shell (ComponentPageShell): also keyed generically rather than per component,
     * for the same reason as `contract.*` above. `{name}` is the one thing that changes.
     */
    "component.tabUsage": "Uso",
    "component.tabInstall": "Instalación",
    "component.tabStyle": "Style hooks",
    "component.tabA11y": "Accesibilidad",
    "component.tabTests": "Tests",
    "component.tabsAriaLabel": "Referencia de {name}",
    /* The "the code is in the preview's React tab" note: identical boilerplate on every page whose
       only React-specific content is that tab, so it is one key rather than N copies. */
    "component.reactNote": "El código está en la pestaña <strong>React</strong> del preview.",
    /* The hand-written "what the contract says that Referencia's JSON doesn't" subsection every
       page's Uso tab carries (see AccordionPage/DialogPage): one heading word, not N copies. */
    "component.contractNotesTitle": "Contrato",
  },
  en: {

    "component.tabUsage": "Usage",
    "component.tabInstall": "Installation",
    "component.tabStyle": "Style hooks",
    "component.tabA11y": "Accessibility",
    "component.tabTests": "Tests",
    "component.tabsAriaLabel": "{name} reference",
    "component.reactNote": "The code is in the preview's <strong>React</strong> tab.",
    "component.contractNotesTitle": "Contract",
  },
} as const;
