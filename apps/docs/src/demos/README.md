# Demo trees

One usage tree per demo, shared by both languages.

A tree is a **composition** (which signature, nested how, with which options), and a composition is
not Spanish or English. Only the words inside it are. So a demo lives here once, as a function of the
translator, and `pages/componentes/x.astro` and `pages/en/components/x.astro` import the same
function:

```astro
---
import { tagTree } from "../../demos/tag";
import { getLocale, useTranslations } from "../../i18n";

const t = useTranslations(getLocale(Astro.url));
---
<ComponentPreview tree={tagTree(t)} label="Tag" />
```

The words themselves are `demo.*` keys in `src/i18n/ui.ts`. A string that is a proper noun (`react`,
`tokens`, `⌘`) stays written in the tree: it is the same in every language, and a key for it would
only be an identity entry that can rot.

A demo with no words at all is exported as a plain constant rather than a factory. See `kbd.ts`.
Nothing to translate, nothing to parameterise.

## `data/`: the entries, not the composition

A collection slot (`items`, `nodes`, `options`) is **data**, and it lives in `data/<component>.ts`:

```ts
// data/menu.ts
export const menuItems = (t: Translate): readonly ItemInput[] => [ … ];

// menu.ts
export const menuTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.label") },
  slots: { trigger: t("demo.menu.trigger"), items: menuItems(t) },
});
```

Fifteen entries inline said almost nothing about the composition they were buried in, which is the
subject of the page. Split, a tree is one screenful and the list stays a list. It is also what the
emitter does on the React side: `emitReactSource` writes `menu-items.ts` beside the component and
the docs page shows it as its own tab, so the demo source and the snippet a reader copies are
organised the same way.

The playground globs `../demos/*.ts`, one level only, so nothing in `data/` is mistaken for a demo.

The rule for `t` is the same one as above: a list of proper nouns (plan names, endonyms, file names)
is a plain constant, and only a list with words in it is a function of the translator.

## Why not one tree per page

Because that is the duplication the tree came to remove, one language later, and it had already
drifted. Measured on the pages this replaced:

- The English Box demo's HTML said `<h3>Summary</h3>` and its React snippet said `<h2>Summary</h2>`
  with a different sentence under it. One demo, two sources, two answers.
- The English Theme Toggle mixed languages inside one button: `aria-label="Modo: sistema"` next to
  `data-sk-theme-toggle-label-light="Mode: clear"`.
- The English Tag and Progress demos still read `activo`, `deprecado`, `Subida`, `Cuota`.

None of that failed a check, because nothing was wrong: they were valid pages that documented
slightly different components. Sharing the composition is what makes the difference impossible.
