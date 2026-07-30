# Demo trees

One usage tree per demo, shared by both languages.

A tree is a **composition** — which signature, nested how, with which options — and a composition is
not Spanish or English. Only the words inside it are. So a demo lives here once, as a function of the
translator, and `pages/componentes/x.astro` and `pages/en/components/x.astro` import the same
function:

```astro
---
import { tagTree } from "../../demos/tag";
import { getLocale, useTranslations } from "../../i18n";

const t = useTranslations(getLocale(Astro.url));
---
<Showcase tree={tagTree(t)} label="Tag" />
```

The words themselves are `demo.*` keys in `src/i18n/ui.ts`. A string that is a proper noun (`react`,
`tokens`, `⌘`) stays written in the tree: it is the same in every language, and a key for it would
only be an identity entry that can rot.

A demo with no words at all is exported as a plain constant rather than a factory — see `kbd.ts`.
Nothing to translate, nothing to parameterise.

## Why not one tree per page

Because that is the duplication the tree came to remove, one language later — and it had already
drifted. Measured on the pages this replaced:

- The English Box demo's HTML said `<h3>Summary</h3>` and its React snippet said `<h2>Summary</h2>`
  with a different sentence under it. One demo, two sources, two answers.
- The English Theme Toggle mixed languages inside one button: `aria-label="Modo: sistema"` next to
  `data-sk-theme-toggle-label-light="Mode: clear"`.
- The English Tag and Progress demos still read `activo`, `deprecado`, `Subida`, `Cuota`.

None of that failed a check, because nothing was wrong: they were valid pages that documented
slightly different components. Sharing the composition is what makes the difference impossible.
