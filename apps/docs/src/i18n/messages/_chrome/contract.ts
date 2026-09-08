export const contractMessages = {
  es: {

    /*
     * The reference and changes tabs. Keyed generically, not under `accordion.*`, because both
     * components render from the compiled contract and take the id as a prop: the copy is the same
     * sentence on every component page, exactly like `hooks.*`.
     */
    "contract.tab": "Referencia",
    "contract.title": "Referencia",
  },
  en: {

    "contract.tab": "Reference",
    "contract.title": "Reference",
  },
} as const;
