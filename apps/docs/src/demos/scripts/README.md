# Demo scripts

The JavaScript a Vanilla demo needs, **written in TypeScript**.

Each file here is real source: `include`d by `tsconfig.json`, so `astro check` type-checks it like
anything else in the app. That is the whole point of the move — these used to be template literals
inside `demos/*.ts`, where `event.target.closest(…)` and `output.textContent.split(…)` were nobody's
business to verify, and both are mistakes the compiler catches now.

They are read as text (`?raw`) rather than imported, because they do not run here. A demo exports the
source, a page hands it to `ComponentPreview`, and the preview does two things with it:

- **shows it**, as authored, in the `TS` tab;
- **runs it**, type-stripped (`lib/demo-script.ts`), inside the preview frame and in the Playground's
  `index.html`, because a `<script type="module">` in a no-build HTML page can only be JavaScript.

## Rules for a file in here

- **No imports.** The frame runs the script through `Function`, which has no module scope. Type
  stripping cannot rescue an `import` — it would still be there in the output.
- **No words.** A string a reader can see is a translation, and translations live in the tree. Pass
  it through a `data-` attribute and read it back: see `placeholder-swap.ts`.
- Reach for `querySelector<T>` and `instanceof` over assertions. The types are only worth having if
  they describe what the DOM actually hands back.
