# Contract audit tracker

Proper audit of every published component contract against the machine-readability bar:

> If only this definition existed: no source, no prior library knowledge: could a tool
> unequivocally determine how to use the component, which combinations are valid, what it
> renders, and how to interact with it?

Prompt and checklist live in the conversation that started this work. This file tracks **progress**
and **lessons** so the rest of the catalogue can be audited the same way.

## Breaking changes are allowed

The kit has **no external consumers**: the only code depending on it is `apps/docs` and
`apps/playground`, both in this repo. So a contract fix is never held back because it breaks
something. Break it, then repair every caller in docs and playground in the same change, and leave
the tree clean (build, tests, demos). What still matters is noticing WHAT broke: search both apps for
the old name, rerun the demo tree tests, and write the changelog entry as `breaking` so the history
stays honest. Do not keep a deprecated alias just to spare a consumer that does not exist.

## Event names

Every DOM event the kit dispatches is `sk:<family><event>`, all lowercase, no separators:
`sk:tabsvaluechange`, `sk:vaulopenchange`, `sk:toastdismiss`. The family is the contract id or one of
its signature names. Declare them as a `<family>Events` constant in core, publish it as the
contract's `events`, and dispatch AND listen through the constant, never a literal. Two families
never share a name, so a listener on one root cannot catch a different component nested inside it.
`validate.test.ts` ("one convention across the catalogue") enforces it. Renamed catalogue-wide on
2026-09-17; changelog entries are `breaking`.

## Status legend

| Status | Meaning |
| --- | --- |
| `done` | Audited **and** corrected **and** locked with tests (see Definition of done). Nothing else counts. |
| `in-progress` | Audit and/or fixes started; tests missing or failing: **not** done. |
| `pending` | Not started |

Do **not** mark `done` after audit+fix alone. Contract changes without tests that fail when the
promise regresses are incomplete.

## Progress

**82 / 82** families done.

| id | Status | Notes |
| --- | --- | --- |
| `tag` | `done` | 2026-09-16: fixes + `validate.test` (a11y/slot/forbids) + `tag.test.tsx` (removable gate, `sk:tagremove`). Second pass: React `children: string`. 2026-09-17: `forward` on Tag / Tag.link; `compose` button+icon on remove |
| `badge` | `done` | 2026-09-16: fixes + `validate.test` (order/cardinality/Avatar.image/Badge pill) + `badge.test.tsx` (dot, pill, photo avatar). 2026-09-17: `hitTesting.childrenNone` on BadgeHolder |
| `accordion` | `done` | 2026-09-16: `defaultValue` on contract; intents/semantics; validate + controlled React test. 2026-09-17: `excludes` `type=multiple`↔`collapsible`. Second pass: React `data-sk-accordion` mount |
| `tile` | `done` | 2026-09-16: `events` + React DOM parity; hookSheets checkbox/switch; ExpandableTile host `section`; validate + event tests. Second pass: React tile mount stamps |
| `dialog` | `done` | 2026-09-16: hookSheets dialog-vaul; closeLabel→aria-label; React title/children; semantics; validate + React tests. 2026-09-17: `compose` button+icon on close |
| `button` | `done` | 2026-09-16: React nav forbids pressed/disabled; semantics Link; validate + React pressed/nav tests. 2026-09-17 follow-up: drop `sk-interactive` from `parts` (shared via `also`; unique ownership broke Toc/List sheets). Second pass: React `data-sk-button` mount. Icon compose closed on Tag/Dialog consumers |
| `icon` | `done` | 2026-09-16: already solid; validate locks name enum/requires/sheets; semantics alts |
| `popover` | `done` | 2026-09-16: requires panelId; triggerLabel+a11y; closeLabel text; anchored hookSheets; React data-bare/arrow. 2026-09-17: drop dead React `container`; `portals` absent; `forward` aria-* |
| `avatar` | `done` | 2026-09-16: React `name` required; validate initials/image/group + image-frame sheets |
| `tooltip` | `done` | 2026-09-16: events openChange; machine options; anchored hookSheets; React/vanilla sk:openchange. Second pass: React `data-sk-anchor` mount |
| `annotation` | `done` | 2026-09-16: items `key: for`; drop unused frame `side`/`for`; validate a11y/items. Second pass: React `data-sk-annotated` mount |
| `back-to-top` | `done` | 2026-09-16: React `children: string`; validate text name/slot |
| `box` | `done` | 2026-09-16: own part + box hooks only (dropped wrapper.css); semantics; validate atLeastOneOf + sheets |
| `breadcrumb` | `done` | 2026-09-16: hookSheets menu+anchored (+hooks); semantics Steps; validate items/separator/sheets. 2026-09-17: `compose` menu (`systemOwned`) |
| `calendar` | `done` | 2026-09-16: required `label`; `events.valueChange`; React DOM parity + `label: string`. 2026-09-17: ISO `pattern` on value/min/max. Second pass: React `data-sk-calendar` mount. 2026-09-17: `systemOwned` grid parts |
| `callout` | `done` | 2026-09-16: React `title: string`; semantics Toast; validate actions tone gate |
| `carousel` | `done` | 2026-09-16: contract `events` (change/goto); validate a11y/slides/events. 2026-09-17: `systemOwned` controls/dots |
| `changelog` | `done` | 2026-09-16: already solid; validate releases/entries/kind + badge sheets. 2026-09-17: `date` `pattern` YYYY-MM-DD |
| `chart` | `done` | 2026-09-17: mount on signature; validate label/items/value type. 2026-09-17: `implies` format=currency→currency + ISO code `pattern`. Second pass: React `data-sk-chart` mount |
| `checkbox` | `done` | 2026-09-17: React CheckboxGroup DOM `sk:checkboxgroupvaluechange`; validate group keys/events. 2026-09-17: Checkbox `forward` id/form/aria-* |
| `code-preview` | `done` | 2026-09-17: lines number; lessLabel on toggle; density collapsible+switch hookSheets; React string label; validate |
| `color-picker` | `done` | 2026-09-17: events.valueChange + React DOM; anchored hookSheets; React label string; validate. Second pass: React `data-sk-color-picker` mount |
| `combobox` | `done` | 2026-09-17: events valueChange/inputValueChange + React DOM; anchored+visually-hidden hookSheets; React label string; validate. Second pass: React `data-sk-combobox` mount |
| `command-palette` | `done` | 2026-09-17: requires label/paletteId; closeLabel; footer slot; dialog-vaul hookSheets; validate. Second pass: React `data-sk-command-palette` mount |
| `comment-thread` | `done` | 2026-09-17: events + React DOM parity; visually-hidden hookSheets; mount attrs; React string labels; validate |
| `component-preview` | `done` | 2026-09-17: document preference events; React title/note string + mount; validate |
| `content` | `done` | 2026-09-17: a11y dismissLabel; timeout min/integer; React sk:toastdismiss + exit; title string; semantics; validate |
| `data-grid` | `done` | 2026-09-17: React mount + wrap attrs; validate label/rows/mount (keyboard model already solid) |
| `date-picker` | `done` | 2026-09-17: React DOM `sk:datepickervaluechange`; anchored hookSheets + invalid; native value/min/max; validate + React tests. 2026-09-17: ISO `pattern` on value/min/max. Second pass: React `data-sk-date-picker` mount |
| `details` | `done` | 2026-09-17: drop false DetailsGroup parent; validate Summary/Content cardinality + sheets. 2026-09-17: `Details.Summary.compose` icon |
| `editor` | `done` | 2026-09-17: drop bogus toolbar part; popover+anchored hookSheets; autoFocus prop; React DOM events; validate + React tests |
| `empty-state` | `done` | 2026-09-17: React `title: string`; semantics Placeholder/Loader; validate title/icon/actions + sheets |
| `fade-edge` | `done` | 2026-09-17: semantics Marquee alt; validate mode/direction/hooks + React data/style attrs. Later: `excludes` `mode=transparent`↔`color` (locked) |
| `feed` | `done` | 2026-09-17: a11y label; semantics CommentThread/EmptyState; validate bounds/parents + React busy false |
| `file-upload` | `done` | 2026-09-17: required dropzone/trigger labels; React clearLabel opt-in + `sk:fileuploadchange` DOM; semantics FormField; validate + React tests. Second pass: React `data-sk-file-upload` mount |
| `folder` | `done` | 2026-09-17: `outputHooks` clip/tail; validate parents/href/mount/sheets; React `data-active`. Second pass: React `data-sk-folder` mount |
| `footer` | `done` | 2026-09-17: `divider` `falseValue`; React defaults from contract; semantics Box/Hero; validate + layout tests |
| `form-field` | `done` | 2026-09-17: semantics labelHidden vs bare aria-label; drop dead `invalid` type; validate + React labelHidden |
| `hero` | `done` | 2026-09-17: React defaults from contract; semantics Box/Footer/Stack; validate defaults/element/sheets |
| `icon-state-button` | `done` | 2026-09-17: bake `data-icon-only`; a11y name; React parity; semantics; validate + react tests. Later: face `requires icon` + `minItems: 2` (locked). 2026-09-17: `forward` data-variant/data-size |
| `image-frame` | `done` | 2026-09-17: semantics Avatar/Placeholder; validate defaults/caption sheets/exactlyOneOf (contract already solid). Later: `frameElement` (`as`); React omits option key from props (uses `as`) |
| `input` | `done` | 2026-09-17: NativeInput `requires type` + `controlSize`; React FormField wiring parity; semantics; validate + react tests |
| `kbd` | `done` | 2026-09-16: React `children: string`; semantics Code alt; validate legend text/slot |
| `layout` | `done` | 2026-09-17: own parts only (drop box/wrapper claim + hookSheets); Grid `fill`; semantics; validate + react tests |
| `list` | `done` | 2026-09-17: `ListItemButton` in contract; drop `sk-interactive` part; React title/description string; semantics; validate + react tests. Second pass: `ListItemButton` native `disabled` via `optionAttrs` (`a1d7386ebe4dff00`). 2026-09-17: `ListItemButton.forward` form attrs |
| `loader` | `done` | 2026-09-16: hookSheets visually-hidden; semantics Progress/Placeholder; validate status + sheets. Second pass: React `data-sk-loader` mount |
| `marquee` | `done` | 2026-09-17: hookSheets visually-hidden; `--sk-marquee-vertical-size` hook; duration/gap-fill `outputHooks`; React string labels; validate. Later: `implies` control→playLabel/pauseLabel (locked). Second pass: React `data-sk-marquee` mount |
| `media-gradient` | `done` | 2026-09-17: all 12 wash+caption hooks; semantics Dialog/FadeEdge (drop bogus Backdrop); React children required; validate. Later: `captionElement` (`as`) |
| `megamenu` | `done` | 2026-09-17: events openChange + React/vanilla DOM; anchored hookSheets+hooks; React mount; semantics Navbar; validate + react + vanilla tests. Later: columns `minItems`/`maxItems` 2–4 (locked) |
| `menu` | `done` | 2026-09-17: requires label; a11y triggerIconOnly→triggerLabel; group in itemOptions emit; anchored hookSheets; React DOM event parity + mount; semantics Menubar/Megamenu; validate + react tests. Later: drop unused `group`/`groupLabel` parts |
| `menubar` | `done` | 2026-09-17: anchored hookSheets+hooks; React mounts + Menu DOM events via item wrapper; children string; semantics Megamenu/Toolbar; validate + react tests. Residual: leaf `onActivate` is React-only (no custom DOM event) |
| `meter` | `done` | 2026-09-17: React `data-sk-meter` mount parity; semantics Stat; validate + react mount test (contract already solid). Later: `between` for value↔min/max (locked) |
| `nav-list` | `done` | 2026-09-17: `implies` collapsible/heading→label; `excludes` collapsible↔heading; React data-collapsible/default-open + enhancer mounts; link children string; semantics; validate + react tests. Residual: no openChange DOM event (aria-expanded only) |
| `navbar` | `done` | 2026-09-17: contract already solid (shell + guests); semantics Sidebar/Megamenu; CSS host comment; validate guest sheets. Residual: children order not enforced |
| `number-field` | `done` | 2026-09-17: React DOM `sk:numberfieldvaluechange`; `invalid`+hint slot; drop scrubber; locale default; mount stamp; semantics; validate + react tests. Later: vanilla hint→aria-describedby (**resolved**). Second pass: `between` min↔max (`1b475bdf158c22e1`) |
| `pagination` | `done` | 2026-09-17: `events.pageChange` + React DOM; contract label defaults; data-page/total/siblings on React; semantics TablePager/Feed; validate + react tests. Residual: no vanilla enhancer; computedInput attrs skip emit. Later: `between` page≤total (**resolved**) |
| `placeholder` | `done` | 2026-09-17: `lines` max=12 (=PLACEHOLDER_MAX_LINES); semantics EmptyState/Loader/ImageFrame/Avatar; validate + react tests. Residual: free CSS length strings for width/height/lastLine |
| `process-list` | `done` | 2026-09-17: React `title: string` (slot text parity); semantics List/Steps; validate + react tests. Residual: CSS guest margin on nested CodePreview (no hookSheets) |
| `progress` | `done` | 2026-09-17: semantics Meter/Loader; validate label/value/tone/hooks (contract already solid). Later: `between` value↔max (**resolved**) |
| `questionnaire` | `done` | 2026-09-17: mounts, hookSheets, implies, events; second pass: `atLeastOneOf` choices\|text, `uniqueChildOption` name, `compose` progress/steps/button/tile/form-field/kbd/icon; validate + react + vanilla |
| `qr-code` | `done` | 2026-09-17: moduleShape not computedInput (CSS shape-rendering); logoRatio max=0.5; React data-module-shape; validate + react tests. Residual: guest `--sk-icon-size`. Later: `implies` logo→logoRatio (**resolved**) |
| `radio-group` | `done` | 2026-09-17: own parts/hooks only (drop checkbox/switch claim); `label`+a11y; group `disabled` on inputs; semantics; validate + react tests. Residual: no custom DOM event (native change). Later: empty `aria-label` refused (**resolved**) |
| `segmented` | `done` | 2026-09-17: React DOM `sk:segmentedvaluechange` + mount stamps; semantics Tabs/Select; validate + react tests (contract already solid). Residual: React `onValueChange` is bare string (DOM detail is `{ value }`) |
| `select` | `done` | 2026-09-17: anchored hookSheets+hooks; Select.native value/selected + real disabled/required; React DOM `sk:selectvaluechange` + mounts; semantics; validate + react tests. Residual: optional label (nearby name OK); Zag portal mounts. 2026-09-17: Select.native `forward` |
| `sidebar` | `done` | 2026-09-17: splitter hookSheets+hooks; React DOM collapse/resize events + mount stamps; semantics Vaul; validate + react tests. Residual: guest `--sk-nav-list-*` tuning; controlled `collapsed` binding-only |
| `skip-link` | `done` | 2026-09-17: `href` pattern `^#.+$`; React `children: string`; validate require/pattern/emit/hooks. Residual: destination `tabindex="-1"` is consumer-owned (`skipLinkTarget`) |
| `slider` | `done` | 2026-09-17: `mount` on the signatures + React DOM `sk:slidervaluechange` (other session); Slider name rule (aria-label/labelledby, which both bindings read) and new `ContractOption.between` (value in [min,max], low <= high); semantics; validate tests |
| `split-button` | `done` | 2026-09-17: welds enforced through slot `restrictOptions` (now boolean-aware); semantics; validate tests. Later: `pairs` enforces variant/tone/size across the two halves |
| `stat` | `done` | 2026-09-17: new `ContractSignature.implies` (animate -> count, which the enhancer threw without; trend -> change slot); trend default `neutral` (React parity); charts demo fixed; validate tests. Second pass: React `label: string`, `value: string \| number` |
| `steps` | `done` | 2026-09-17: dropped item `current`, `aria-current` derived from `status` in the template (bindings disagreed); `orientation` option; demos/canonical fixed; validate tests. Later: `countWhere` allows at most one current. Residual: complete/upcoming status is visual only |
| `switch` | `done` | 2026-09-17: own parts + 16 `--sk-switch-*` hooks (published radio hooks before); `checked` -> `defaultChecked` (React controlled lock); name rule via slot-aware `requiresOneOf` (children or aria-*); callers + snippet fixed; validate tests. 2026-09-17: Switch `forward` id/form/aria-* |
| `table` | `done` | 2026-09-17: TableHeader `colspan`/`rowspan`, TableCell `rowspan`; density bounds; semantics (name via caption or labelledby); validate tests. Later: name rule via `TableCaption` child or aria-label/labelledby |
| `table-pager` | `done` | 2026-09-17: rows = `table > tbody > tr` (dropped undeclared row marker); DOM logic to core `table-pager-dom`, React TablePager now pages (was shell only); size listens to native `change`; slots ordered + cardinality; `navLabel` prop `label`; canonical tree gains a table; validate + react + vanilla tests |
| `tabs` | `done` | 2026-09-17: tablist name rule was keyed on authored `orientation` (almost never written), now unconditional; semantics; validate tests. Earlier today: events `sk:tabsvaluechange`, `value` keyOf |
| `time-field` | `done` | 2026-09-17: `invalid` option + `aria-invalid`/`aria-readonly` on segments (both bindings); `value` `pattern` from the parser's TIME_PATTERN (new `ContractOption.pattern`); validate + react + vanilla tests. Second pass: select+anchored `hookSheets`+hooks; React `label`/`hint` string (`536279aeaa27a8e7`); React `data-sk-time-field` mount |
| `toc` | `done` | 2026-09-17: `title` required (empty h2 + unnamed nav); items keyed by `href` (required, unique); React `title` required; semantics; validate tests. Second pass: React `TocItem.children: string` |
| `toolbar` | `done` | 2026-09-17: roving tabindex in both bindings via core `toolbarStops` (one stop, composites count once, late controls join on focusin); `loopFocus` falseValue; ToolbarGroup `groupLabel`; semantics; validate + react + vanilla tests. Second pass: React `data-sk-toolbar` mount |
| `tree-view` | `done` | 2026-09-16: `events`; recursive item keys unique tree-wide (validator); React dispatches DOM events; semantics (Treegrid, Toc); validate + react tests. Second pass: React `data-sk-tree-view` mount |
| `treegrid` | `done` | 2026-09-16: `events`; TreegridRow requires `value`; TreegridCell `text`; React dispatches DOM events; semantics; validate + react tests. Second pass: React `data-sk-treegrid` / `data-sk-treegrid-row` mounts |
| `typography` | `done` | 2026-09-16: `textRole` (eyebrow/subtitle) + Output `outputFor`; React Code children required; semantics; validate + react tests. Heading level still h2-only in trees (schema). Second pass: React `Code` `children: string` |
| `vaul` | `done` | 2026-09-16: events + `draggable`/`dismissThreshold`; Vanilla default edge = `block-end`; React drag/light-dismiss/openChange/ref; semantics; validate + react + vanilla tests. Second pass: React `data-sk-vaul` mount on drawer host |
| `wrapper` | `done` | 2026-09-16: own part + 2 hooks only (dropped box.css hookSheet); semantics (full keeps gutters, no nesting, LayoutGrid/Box); validate.test (scale, `size`≠option, sheets) + layout.test default |

Suggested audit order: `button` / `icon` (Tag peers), `tile` (Accordion peer), then
`dialog` / `tabs` / `combobox` for portal+collection complexity.

## How to audit one family

Sources (always together):

1. `packages/core/src/<id>.ts`: canonical contract
2. `packages/core/src/contract.ts`: schema vocabulary
3. `contracts/semantic/<id>.yaml`: selection prose
4. `contracts/changelog/<id>.yaml`: surface + history
5. React binding under `packages/react/src/components/` (and vanilla enhancer if any)
6. CSS under `packages/core/css/`
7. Compiled view: `artifacts/ai-manifest.json` / MCP `get_contract`

Apply the 17 dimensions from the audit prompt. Classify each finding
(`ambiguity` | `missing-contract` | `inconsistency` | `redundancy` | `coupling` |
`scalability` | `accessibility` | `tooling`) with severity. Fix what is local to the
component; file schema gaps under **Residual schema work** below instead of inventing
one-off fields.

After fixes: update changelog `surface` hash (`surfaceHash` from `@skryensya/ai-compiler`),
semantics if selection changed, rebuild with `pnpm --filter @skryensya/ai-compiler build`,
mark the row `done` here.

## Lessons learned (Tag + Badge)

### Patterns that keep showing up

1. **Structure in contract, behaviour in binding**: fine when declared (`events` + React prop).
   Silent when the binding invents gates the contract does not (`onRemove ⇒ removable`).
2. **`also: ["sk-button", …]` is CSS classes, not composition**: schema 2.3 adds
   `compose` / `systemOwned` for machine-readable borrows; apply per family as needed.
3. **React often looser than UsageTree**: `BadgeHolder` children were `ReactNode`; contract `of`
   only enforced in `validate_ui`.
4. **CSS promises not in the contract**: Holder `pointer-events: none` was CSS-only until
   `hitTesting` (resolved 2026-09-17); count-pill-in-corner supported by CSS before `Badge` was in `of`.
5. **Semantics NL vs intents**: easy to contradict the API (Tag “must be removable” while
   inert keyword chips are valid).
6. **Shared option bags + per-signature `options` lists**: good; keep using them.
7. **Multi-signature families**: separate React exports (`Badge*`) clearer than one
   discriminated export (`Tag` / `Tag.link`); either is OK if `host.when` / `requires` /
   `forbids` are complete.
8. **Changelog prose is not gated**: hook counts in entry bodies can drift; only `surface`
   is enforced.
9. **`surface` excludes `template` and `intent`**: markup/intent edits can be consumer-visible
   without a changelog gate. Know this when deciding severity.
10. **Slot `accepts: "node"`**: often too wide for chips/links; prefer `text` unless nesting
    is intentional and constrained.
11. **Controlled state stays outside the contract** (Tabs/Accordion pattern): authored
    `defaultValue` / `data-*` is an option; live `value` + callbacks are binding wiring. If the
    DOM channel exists (`data-default-value`) and is missing from the contract, agents cannot
    seed open state in UsageTrees.

### What we fixed in-component

| Family | Fix | Tests |
| --- | --- | --- |
| Tag | `events.remove`; React requires `removable`; React `children: string`; `a11y` + slot text; semantics | `ai-compiler` validate.test · `react` tag.test |
| Badge | Holder `of`/`ordered`/cardinality; intents; semantics; pill demo | `ai-compiler` validate.test · `react` badge.test |
| Accordion | Root `defaultValue`; React `defaultOpen` + `sk:accordionvaluechange`; host `section`; headingLevel 1..6; intents/semantics | `ai-compiler` validate.test · `react` accordion.test |
| Tile | `events` on contract; React DOM event parity; `hookSheets` checkbox/switch; ExpandableTile host `section`; TileButton intent | `ai-compiler` validate.test · `react` tile.test |
| Dialog | `hookSheets` dialog-vaul; `closeLabel`→`aria-label`; React `title`/`children` parity; semantics vaul/alert | `ai-compiler` validate.test · `react` dialog.test |
| Button | React nav strips `pressed`/`disabled`; typed action vs navigation props; semantics `Link` alt; `attrsWhen` `given` | `ai-compiler` validate.test · `react` button.test |
| Icon | Semantics alts; validate locks vocabulary `name` / sheets (contract already solid) | `ai-compiler` validate.test · `react` icon.test (existing) |
| Popover | `requires panelId`; `triggerLabel` + a11y; `closeLabel` text-only; `hookSheets` anchored; React `data-bare`/`data-arrow` | `ai-compiler` validate.test · `react` popover.test |
| Avatar | React `name` required (parity with `name`/`imageName`); validate + image-frame sheets | `ai-compiler` validate.test · `react` avatar.test |
| Tooltip | `events.openChange`; machine options; `hookSheets` anchored; React/vanilla `sk:openchange`; content `string` | `ai-compiler` validate.test · `react` tooltip.test · `vanilla` tooltip.svelte.test |
| Kbd | React `children: string` (parity with slot `text`); semantics Code alt; validate | `ai-compiler` validate.test · `react` kbd.test (existing) |
| Loader | `hookSheets` visually-hidden; semantics Progress/Placeholder/Loader.status; validate status + sheets | `ai-compiler` validate.test · `react` loader.test (existing) |
| Annotation | items `key: for` (require + unique); drop unused frame `side`/`for`; validate a11y/items | `ai-compiler` validate.test · `react` annotation.test (existing) |
| BackToTop | React `children: string` (parity with slot `text`); validate | `ai-compiler` validate.test · `react` back-to-top.test (existing) |
| Box | `parts` narrowed to `sk-box`; hooks only `--sk-box-*` (dropped wrapper.css); semantics Stack/Inline/Grid/Wrapper | `ai-compiler` validate.test (+ `sheetsForTree`) |
| Breadcrumb | `hookSheets` menu+anchored (+their hooks); semantics Steps; validate items/separator/sheets | `ai-compiler` validate.test · `react` breadcrumb.test (existing) |
| Calendar | required `label`; `events.valueChange`; React DOM dispatch + `label: string`; ISO `pattern` on value/min/max | `ai-compiler` validate.test · `react` calendar.test · `vanilla` calendar (existing) |
| Callout | React `title: string`; semantics Toast alt; validate restrictOptions + children | `ai-compiler` validate.test · `react` callout.test (existing) |
| Carousel | contract `events` change/goto (already in enhancer); validate a11y/slides | `ai-compiler` validate.test · `vanilla` carousel (existing) |
| Changelog | already solid; validate release/entry shape + badge sheets; `date` ISO `pattern` | `ai-compiler` validate.test |
| Chart | `mount` on signature; validate label/items; `implies` currency + ISO `pattern` | `ai-compiler` validate.test |
| Checkbox | React CheckboxGroup dispatches `sk:checkboxgroupvaluechange`; validate | `ai-compiler` validate.test · `react` selection.test |
| CodePreview | lines/previewLines `number`; lessLabel on toggle; density collapsible+switch sheets; React string label/note | `ai-compiler` validate.test · `react` code-preview.test |
| ColorPicker | `events.valueChange`; React DOM parity; anchored hookSheets; React `label: string` | `ai-compiler` validate.test · `react` color-picker.test |
| Combobox | `events` valueChange/inputValueChange; React DOM parity; anchored+visually-hidden hookSheets; React string label | `ai-compiler` validate.test · `react` combobox.test |
| CommandPalette | `requires` label/paletteId; `closeLabel`; footer slot; dialog-vaul hookSheets | `ai-compiler` validate.test · `react` command-palette.test (existing) |
| CommentThread | `events` + React DOM parity; visually-hidden hookSheets; mount attrs; React string labels/count | `ai-compiler` validate.test · `react` comment-thread.test |
| ComponentPreview | document preference `events`; React `title`/`note` string + mount | `ai-compiler` validate.test · `react` component-preview.test |
| Content | a11y dismissLabel; timeout ≥1 integer; React DOM `sk:toastdismiss` + exit wait; `title: string`; semantics Dialog/FormField | `ai-compiler` validate.test · `react` content.test |
| DataGrid | React `data-sk-data-grid` + wrap attrs (contract already solid) | `ai-compiler` validate.test · `react` data-grid.test |
| DatePicker | React DOM `sk:datepickervaluechange`; anchored hookSheets; `invalid`; native HTML bounds; ISO `pattern`; semantics range vs min/max | `ai-compiler` validate.test · `react` date-picker.test · `vanilla` date-picker (existing) |
| Details | Drop false `parents: DetailsGroup`; validate cardinality/group | `ai-compiler` validate.test · `react` details.test (existing) |
| Editor | Drop bogus `part: toolbar`; popover+anchored hookSheets + hooks; `autoFocus` prop; React DOM `sk:editorchange`/`sk:editorready` | `ai-compiler` validate.test · `react` editor.test · `vanilla` editor (existing) |
| EmptyState | React `title: string`; semantics Placeholder/Loader alts; validate title/icon/actions | `ai-compiler` validate.test · `react` empty-state.test (existing) |
| FadeEdge | Semantics Marquee vs wrap; validate mode/direction/hooks; React data attrs + style hooks | `ai-compiler` validate.test · `react` fade-edge.test |
| Feed | `a11y` label; semantics CommentThread/EmptyState/Comment; validate bounds/parents/busy emit | `ai-compiler` validate.test · `react` feed.test |
| FileUpload | required dropzone/trigger; React DOM `sk:fileuploadchange` + clearLabel opt-in; semantics FormField; validate | `ai-compiler` validate.test · `react` file-upload.test · `vanilla` file-upload (existing) |
| Folder | `outputHooks` clip/tail; validate parents/href/mount; React data-active | `ai-compiler` validate.test · `react` folder.test · `vanilla` folder (existing) |
| Footer | `divider` `falseValue: "false"` (emit↔React/CSS); React defaults from contract; semantics Box/Hero | `ai-compiler` validate.test · `react` layout.test |
| FormField | semantics labelHidden vs bare `aria-label`; drop unused `FormFieldOptions.invalid`; validate wiring/sheets | `ai-compiler` validate.test · `react` form-field.test |
| Hero | React defaults from contract (Footer peer); semantics Box/Footer/Stack; validate | `ai-compiler` validate.test · `react` layout.test (existing) |
| IconStateButton | bake `data-icon-only`; a11y aria-label/labelledby; React parity; semantics Button.action | `ai-compiler` validate.test · `react` icon-state-button.test |
| ImageFrame | semantics Avatar.image/Placeholder; validate defaults/caption sheets (exactlyOneOf already locked) | `ai-compiler` validate.test · `react` image-frame.test (existing) |
| Input | NativeInput `requires type` + `controlSize`; React FormField wiring; semantics TimeField/NumberField | `ai-compiler` validate.test · `react` input.test |
| Layout | Own parts only (drop box/wrapper + hookSheets); Grid `fill`; semantics Box/Wrapper alts | `ai-compiler` validate.test · `react` layout.test |
| List | `ListItemButton` signature; drop `sk-interactive` part; React title/description string; semantics | `ai-compiler` validate.test · `react` list.test |
| Marquee | hookSheets visually-hidden; vertical-size hook; duration/gap-fill outputHooks; React string labels | `ai-compiler` validate.test · `react` marquee.test · `vanilla` marquee |
| MediaGradient | 12 caption+wash hooks; semantics Dialog/FadeEdge; React MediaCaption children required | `ai-compiler` validate.test · `react` media-gradient.test |
| Megamenu | events openChange; anchored hookSheets; React mount; semantics Navbar | `ai-compiler` validate.test · `react` megamenu.test · `vanilla` megamenu |
| Menu | requires label; a11y icon-only; group emit; anchored hookSheets; React DOM events + mount | `ai-compiler` validate.test · `react` menu.test · `vanilla` menu (existing) |
| Menubar | anchored hookSheets+hooks; React mounts + Menu DOM event parity; children string; semantics | `ai-compiler` validate.test · `react` menubar.test |
| Meter | React mount stamp; semantics Stat; validate locks label/aria/mount/hooks (contract already solid) | `ai-compiler` validate.test · `react` meter.test |
| NavList | `implies`/`excludes` on group; React collapsible attrs + mounts; link children string; semantics | `ai-compiler` validate.test · `react` nav-list.test · `vanilla` nav-list (existing) |
| Navbar | Semantics Sidebar/Megamenu; CSS host comment; validate guest sheets (contract already solid) | `ai-compiler` validate.test · `react` navbar.test (existing) |
| NumberField | React DOM valueChange; `invalid`+hint; drop scrubber; locale default; mount; semantics; `between` min↔max | `ai-compiler` validate.test · `react` number-field.test · `vanilla` number-field (existing) |
| Pagination | `events.pageChange` + React DOM; contract defaults; data-page attrs; semantics | `ai-compiler` validate.test · `react` pagination.test |
| Placeholder | `lines` max=12; semantics EmptyState/Loader/ImageFrame/Avatar; validate shape/options/sheets | `ai-compiler` validate.test · `react` placeholder.test (existing) |
| ProcessList | React `title: string`; semantics List/Steps; validate parents/title/sheets | `ai-compiler` validate.test · `react` process-list.test |
| Progress | Semantics Meter/Loader; validate label/bounds/tone/hooks (contract already solid) | `ai-compiler` validate.test · `react` progress.test (existing) |
| Questionnaire | React mounts; checkbox/progress/steps hookSheets; `defaultItem`; implies text/multiple; semantics | `ai-compiler` validate.test · `react` questionnaire.test · `vanilla` questionnaire |
| QRCode | moduleShape DOM for CSS; logoRatio max=0.5; React data-module-shape; validate | `ai-compiler` validate.test · `react` qr-code.test · emit test (existing) |
| RadioGroup | own parts/hooks; label+a11y; group disabled on inputs; semantics | `ai-compiler` validate.test · `react` selection.test |
| Segmented | React DOM event + mount parity; semantics; validate | `ai-compiler` validate.test · `react` segmented.test · `vanilla` segmented (existing) |
| Select | anchored hookSheets; native value/selected + HTML attrs; React DOM event + mounts; semantics | `ai-compiler` validate.test · `react` select.test · `vanilla` select (existing) |
| Sidebar | splitter hookSheets; React DOM events + mounts; semantics Vaul; validate | `ai-compiler` validate.test · `react` sidebar.test · `vanilla` sidebar (existing) |
| SkipLink | `href` pattern in-page; React children string; validate | `ai-compiler` validate.test · `react` skip-link.test (existing) |
| Slider | signature mount; React DOM event + mounts; semantics NumberField; validate | `ai-compiler` validate.test · `react` slider/slider-range.test · `vanilla` slider (existing) |
| Stat | implies animate→count / trend→change; React `label`/`value` string parity | `ai-compiler` validate.test · `react` stat.test |
| TimeField | `invalid`+pattern; select+anchored hookSheets; React label/hint string | `ai-compiler` validate.test · `react` time-field.test · `vanilla` time-field |
| Toc | title+href keys; React `TocItem.children: string` | `ai-compiler` validate.test · `react` toc.test |
| Typography | textRole/Output; React Code `children: string` | `ai-compiler` validate.test · `react` typography.test |
| Wrapper | `parts` narrowed to `sk-wrapper`; hooks/hookSheets no longer claim box.css; semantics; CSS comment on `full` | `ai-compiler` validate.test (+ `sheetsForTree`) · `react` layout.test |

### Skip-link audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Destination `tabindex="-1"` is not in any UsageTree (consumer owns the target) | medium | intentional: exported `skipLinkTarget` / `SKIP_LINK_TARGET_TABINDEX`; not expressible without a refersTo destination |
| Document-order rules (first focusable; content before nav) are page-level, not tree-local | low | intentional: contract comments + semantics; no a11y block by design |
| No mount / events (static anchor; no enhancer) | low | intentional |

### Slider audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| DOM detail is `{ value }` for Slider and `{ low, high }` for SliderRange (not a shared `number[]`) | low | **documented 2026-09-17**: `eventDetails.valueChange.reactDetail` names the React bare/`{ low, high }` split |
| Controlled `value` / live range ends are binding-only (`defaultValue` / `data-*` is the tree channel) | low | same Accordion/Tabs pattern |
| `value`↔`min`/`max` and low↔high cross-bounds rely on `between` (defaults fill omitted ends) | medium | **resolved 2026-09-17**: `between` is enforced by the validator (`out-of-range`), defaults filling omitted ends |
| Vanilla falls back to "Minimum"/"Maximum" when labels absent; contract requires them | low | defensive enhancer; trees still fail without labels |
| React `onValueChange` is bare number / `{ low, high }`; DOM detail matches the object forms | low | intentional API split (same Segmented) |

### Avatar audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `max` on AvatarGroup has no UsageTree channel | medium | binding-only; overflow slot covers authored `+N` |
| `compose` of ImageFrame via `also` | medium | **resolved 2026-09-17**: `Avatar.image.compose` → image-frame (`systemOwned` + sheets) |

### Tooltip audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Controlled `open` is binding-only (not in contract options) | low | same Accordion/Tabs pattern |
| `container` portal target is React-only | low | **resolved 2026-09-17**: `portals: { container: true }` |
| Children slot accepts any signature (`of` unrestricted) | low | intentional wrapper |
| `interactive=false` pointer-events was CSS-only | low | **documented 2026-09-17**: `interactive` option is the hit-testing channel (CSS realizes) |

### Kbd audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| None local: solid static contract |: |: |

### Loader audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Staggered tick children are enhancer/React-injected; emit has no tick children in the tree | low | **resolved 2026-09-17**: `systemOwned: ["tick"]` |
| Empty `label: ""` validates as present for attrsWhen / requires | medium | **resolved 2026-09-17**: an option written to `aria-label`/`aria-labelledby` can never be empty, required or not |

### Annotation audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Leaders SVG empty until measure (system-owned overlay) | low | **resolved 2026-09-17**: `systemOwned` lists mark/leader/ring |
| Label children accept `node` (rich markup) while demos are text | low | intentional |
| `key: for` uniqueness forbids two labels on the same selector | low | intentional: React already required `for` |

### Back-to-top audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Baked `chevron-up` via `data-sk-icon` / React `Icon` (compose) | medium | **resolved 2026-09-17**: `BackToTop.compose` → icon (`systemOwned`) |
| Reveal/scroll behaviour is binding-only (no `events`) | low | intentional: enhancer/React own the scroll listener |

### Box audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `as` polymorphic host has no UsageTree channel | medium | **resolved 2026-09-17**: `boxElement` (`ContractOption.element`, React `as`); shared with Wrapper/layout |
| Layout family still spreads `layoutParts` (claims box/wrapper) | medium | **resolved 2026-09-17**: layout owns only stack/inline/grid/layoutGrid |

### Breadcrumb audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Collapse Menu is runtime-composed (not in emitted tree) | medium | **resolved 2026-09-17**: `Breadcrumb.compose` → menu (`systemOwned` + sheets); hookSheets unchanged |
| Item collection has no `key` (duplicate labels allowed) | low | intentional: href/label pair identity is binding-side |

### Calendar audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Body (Button/Icon grid) is binding-generated; emit has only root+label | medium | **resolved 2026-09-17**: `systemOwned` lists header/nav/cell/grid parts |
| Event name `sk-value-change` (legacy) vs newer `sk:*` | low | **resolved 2026-09-17**: `sk:calendarvaluechange` |
| Controlled `value` is binding-only | low | same Accordion/Tabs pattern |
| `value`/`min`/`max` ISO shape unvalidated | low | **resolved 2026-09-17**: `pattern` (single day or space-separated range) |

### Callout audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `icon`/`actions` stay `ReactNode` while contract restricts signatures | medium | binding looser; UsageTree enforces |
| `restrictOptions` on actions has no React runtime gate | low | validate_ui covers trees |

### Carousel audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Controls/dots are enhancer-injected (not in emit tree) | medium | **resolved 2026-09-17**: `systemOwned` lists controls/button/autoplay/dots/dot |
| `autoplay` bool + `autoplayDelay` number share `data-autoplay` | low | intentional dual form |
| Event names `sk-carousel-*` vs newer `sk:*` | low | **resolved 2026-09-17**: `sk:carouselchange` / `sk:carouselgoto` |

### Changelog audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `compose` of Badge via `also` | medium | **resolved 2026-09-17**: `ChangelogEntry.compose` → badge (`systemOwned` + sheets) |
| ISO `date` format not schema-validated | low | **resolved 2026-09-17**: `pattern` `^\d{4}-\d{2}-\d{2}$` |

### Chart audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Item `value` is not required in UsageTree (React `ChartPoint` requires it) | medium | **resolved 2026-09-17**: item `requires: ["value"]` |
| `overlay` renderer seam is React-only | low | intentional: `@skryensya/charts` upgrade |
| Empty series of zeros uses max=1 (paint fallback) | low | intentional |
| `format=currency` without `currency` soft-falls back in paint | medium | **resolved 2026-09-17**: `implies` + ISO 4217 `pattern` |

### Checkbox audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Lone Checkbox has no `events.checkedChange` (native change only) | low | intentional: group owns the custom event |
| `checked` and `defaultChecked` both map to attr `checked` | low | **resolved 2026-09-17**: controlled `checked` dropped from the contract; `defaultChecked` only |
| Shared `selectionParts` still claims radio/switch classes on checkbox surface | medium | **resolved 2026-09-17**: checkbox publishes its own parts and `--sk-checkbox-*` hooks |

### Code-preview audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Highlighted `children`/`condensed`/`full` accept `node` (Shiki markup) | low | intentional: highlighting is outside this component |
| Density switch labels default in React (`Condensado`/`Completo`) while trees require authored slots | low | correct split: emit needs real labels |
| Toggle count / expanded bookkeeping is binding-filled (empty at rest in emit) | low | intentional: needs layout measure |
| `compose` of Button/Icon/Switch via `also` | medium | **resolved 2026-09-17**: CodePreview (+ density) `compose` button/icon/switch |

### Color-picker audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Panel anatomy (`colorPickerPanelParts`) is binding-generated, not in template | medium | **resolved 2026-09-17**: panel parts merged into `parts` + `systemOwned` |
| Controlled `value` is binding-only (`defaultValue` is the tree channel) | low | same Accordion/Tabs pattern |
| `container` portal target is React-only | low | **resolved 2026-09-17**: `portals: { container: true }` |
| `swatches` is a space-separated string in trees; React also accepts `string[]` | low | intentional: no list option type |
| `compose` of Button via `also` | medium | **resolved 2026-09-17**: ColorPicker (+ compact) `compose` → button |

### Combobox audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Selected chips / clear visibility are binding-filled (`hidden` at rest in emit) | medium | **resolved 2026-09-17**: `systemOwned` lists selectedItems/selectedItem/selectedItemLabel/removeTrigger |
| Controlled `value` / `inputValue` are binding-only (`defaultValue` is the tree channel) | low | same Accordion/Tabs pattern |
| `container` portal target is React-only | low | **resolved 2026-09-17**: `portals: { container: true }` |
| `compose` of Button/Icon via `also` | medium | **resolved 2026-09-17**: Combobox `compose` → button + icon |
| Multiple `value` is a space-separated string in trees; React also accepts `string[]` | low | intentional: same as Select |

### Command-palette audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Result rows are binding-filled on open (empty list in emit) | medium | **resolved 2026-09-17**: `systemOwned` lists option/optionLabel/optionContext |
| `onSelect` is React-only; Vanilla navigates to `href` with no custom DOM event | medium | intentional split: no shared select event yet |
| `--sk-command-palette-list-content` is a runtime measure, not an override hook | low | intentional: layout output written by both bindings |
| Default-ON `vaul` means `whenGiven: "vaul"` cannot gate the handle (always in markup) | low | documented; CSS hides when opted out |
| `compose` of Button/Dialog via `also` | medium | **resolved 2026-09-17**: CommandPalette `compose` → button + dialog + icon |

### Comment-thread audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `sk-vaul` is binding-added (not in template `also`); trees do not load `vaul.css` | medium | intentional: sheet modality is runtime; residual like compose |
| Reply open/close is React `replyOpen` / Vanilla enhancer; no shared openChange event | low | intentional: platform `<dialog>` owns open; actions report vote/reply/delete |
| `compose` of Button/Icon via `also` | medium | **resolved 2026-09-17**: Comment* signatures `compose` → button + icon |
| Author/avatar/body slots accept `node` (rich markup) while demos are often text | low | intentional: composition is the point of recursive replies |

### Component-preview audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Binding/screen tabs, resizer, iframe apparatus are site-owned (not `.bare`) | medium | intentional: documented in contract banner; `.bare` is the portable surface |
| `events` fire on `document` from the full enhancer; `.bare` React does not dispatch them | low | intentional: document preference channel for the docs apparatus |
| Full preview CSS tunes `--sk-anchored-*` / `--sk-code-preview-*` / `--sk-tabs-*` for site chrome | low | site apparatus; `.bare` only needs own sheet + composed CodePreview |
| `compose` of CodePreview via slot `of` | low | already signature-constrained; residual formal `compose` |

### Content audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `dismissible` defaults from `onDismiss` (binding convenience; contract default is false) | low | intentional: same Tag-era callers keep their button |
| React `icon`/`actions` stay `ReactNode` while contract restricts Icon / Button signatures | medium | binding looser; UsageTree enforces |
| `compose` of dismiss Button via `also` | medium | **resolved 2026-09-17**: Toast `compose` → button + icon |
| Empty `dismissLabel: ""` still satisfies a11y presence (catalogue-wide empty-string residual) | medium | **resolved 2026-09-17**: an `aria-label` option can never be empty |

### Data-grid audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Cell `row` override for physical-line wrapping has no UsageTree channel | low | intentional: structural default covers common case; WAI wrap is binding-side |
| Roving stop (cell vs inner control) is DOM-resolved after mount, not in emit | medium | intentional: runtime focus target (not systemOwned anatomy; authors write rows/cells) |
| No custom `events` (keyboard model is local; no value change channel) | low | intentional: pattern is navigation, not selection |

### Date-picker audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Calendar body inside the popover is binding-generated (not in template); CSS `@import`s calendar.css | medium | **resolved 2026-09-17**: DatePicker `compose` → calendar (`systemOwned` + sheets) |
| Controlled `value` is binding-only (`defaultValue` / `data-value` is the tree channel) | low | same Accordion/Tabs pattern |
| `container` portal target is React-only | low | **resolved 2026-09-17**: `portals: { container: true }` |
| `triggerLabel` / `contentLabel` / day/view/prev/next label fns are React-only (locale defaults in both bindings) | low | intentional: Vanilla reads locale defaults only |
| React does not write `data-sk-date-picker` mount (markup path does) | low | **resolved 2026-09-17**: React stamps signature mount (NativeDatePicker has no `mount`) |
| `compose` of Button/Icon via `also` / `data-sk-icon` | medium | **resolved 2026-09-17**: DatePicker `compose` → button + icon |
| `value`/`min`/`max` ISO shape unvalidated | low | **resolved 2026-09-17**: same Calendar `pattern` |

### Details audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `open` as authored option: emit writes `open`, React controlled `open` without toggle handler can disagree in gates | medium | documented in contract comment; left out of canonical trees that seed open |
| CSS classes `__heading` / `__title` / `__description` styled but not in `parts` (demos use Typography) | low | **resolved 2026-09-17**: orphan rules and their two hooks removed |
| Baked chevron via `data-sk-icon` / React `Icon` (compose) | medium | **resolved 2026-09-17**: `Details.Summary.compose` → icon (`systemOwned`) |
| No custom `events` (platform owns toggle; Accordion when you need a machine) | low | intentional |
| Summary/Content children accept `node` (rich markup) | low | intentional: demos nest Stack/Heading/Text |

### Editor audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Toolbar buttons / link Popover are binding-generated (empty shells in emit); CSS `@import`s none of button.css | medium | **resolved 2026-09-17**: `systemOwned: ["toolbarButton"]` + Editor `compose` button/icon/toolbar/popover/input |
| Controlled live content is binding-only (`defaultValue` / `data-default-value` is the tree channel) | low | intentional: contenteditable fights controlled React |
| `label` optional when FormField already names the control; unnamed standalone textbox validates | low | intentional: FormField is the named path |
| React does not write `data-readonly` / `data-disabled` / content-part mount attrs (props path) | low | intentional: root already stamps `data-sk-editor`; content attrs stay binding props |
| `compose` of Button/Icon/Toolbar via `also` / binding chrome | medium | **resolved 2026-09-17**: Editor `compose` lists button/icon/toolbar/popover/input |

### Empty-state audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `icon`/`actions` stay `ReactNode` while contract restricts Icon / Button signatures | medium | binding looser; UsageTree enforces |
| Title host is fixed `h2` (no heading-level option) | low | intentional: region heading; schema `element` exists but unused here |
| Description accepts `node` (rich markup) while demos are often text | low | intentional |
| No options / events / mount (static markup; no enhancer) | low | intentional: element IS the meaning |

### Fade-edge audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `color` is allowed with `mode: "transparent"` (var unused until color mode) | low | **resolved 2026-09-17**: `excludes: { "mode=transparent": ["color"] }` |
| Children accept `node` (any wrapper content); empty string validates as present | low | intentional paint wrapper |
| No events / mount (paint-only; no enhancer) | low | intentional |

### Feed audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Article `posInset`/`setSize` agreement across siblings is unchecked | medium | **resolved 2026-09-17**: `ContractSlot.positions` |
| Duplicate `posInset` values across articles validate | low | **resolved 2026-09-17**: `ContractSlot.positions` |
| Article `label` accepts `node` (rich markup) while demos are often text | low | intentional |
| No custom `events` / mount / keyboard model (WAI: no established conventions) | low | intentional: static presentational v1 |
| Redundant `role="article"` on native `<article>` | low | harmless; matches APG examples that use role on div |

### File-upload audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Chosen-file list + rejection alert are React-rendered (vanilla consumer authors); not in emit template | medium | intentional KNOWN GAP; residual `compose`/systemOwned |
| React `accept` is `Record<string, string[]>` while trees use the string `accept` attr | low | intentional: Zag accepts both; no list option type for MIME maps |
| `minFileSize` / `allowDrop` / `directory` are React (and partial vanilla) machine inputs with no contract options | low | binding-only; add when a tree channel is needed |
| React does not write `data-sk-file-upload` mount (markup path does) | low | **resolved 2026-09-17**: React stamps signature mount |
| `compose` of Button via `also`; delete uses `sk-visually-hidden` only in React item rows | medium | **resolved 2026-09-17**: FileUpload `compose` → button (`systemOwned`) |
| Dropzone/trigger React defaults when props omitted while trees require the slots | low | correct split: emit needs real labels |

### Folder audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Silhouette `viewBox`/`d` and `data-sk-folder-ready` are binding-written after measure | medium | intentional: residual `compose`/systemOwned |
| React does not write `data-sk-folder` mount (would double-bind with the enhancer) | low | **resolved 2026-09-17**: React stamps `folderAttrs.root`; measures itself (no vanilla mount call) |
| Label/children/previews accept `node` (rich markup; headings and ImageFrames) | low | intentional: composition is the point |
| No custom `events` (reveal is CSS `:hover`/`focus-within`/`data-active`) | low | intentional |
| `compose` of ImageFrame inside FolderPreview | medium | **resolved 2026-09-17**: FolderPreview `compose` → image-frame; Folder/FolderLink `hitTesting.childrenNone` |

### Footer audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Children accept `node` (free anatomy; Grid/NavList/Text/Wrapper) | low | intentional: same Hero pattern; snippets show shapes |
| Document-level “at most one contentinfo” is unenforceable in trees | low | intentional: composer’s page structure |
| No events / mount (static band; no enhancer) | low | intentional |
| React `as` still allows any element while trees only expose `footer`/`div` | low | intentional narrow channel; other tags via attrs residual |

### Form-field audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `label`/`hint`/`error`/`children` stay `ReactNode` while contract restricts child to `signature` | medium | binding looser; UsageTree enforces |
| `labelHidden` inlines clip CSS instead of `visually-hidden` hookSheet | low | intentional: option needs no extra class |
| Children `of` unrestricted (any signature) | low | intentional: wraps Select/Textarea/groups alike |
| No events / mount (platform wiring; no enhancer) | low | intentional |
| Empty `label: ""` still satisfies required slot (catalogue-wide empty-string residual) | medium | **resolved 2026-09-17**: blank text in a required slot is flagged (`blank-required-slot` advisory) |

### Hero audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Children accept `node` (free anatomy; Heading/Button/ImageFrame composed by author) | low | intentional: same Footer pattern; snippets show shapes |
| Content rules (one Heading, ≤2 actions) are convention + snippets, not schema | medium | intentional: fixed anatomy would reject valid heroes |
| React `as` still allows any element while trees only expose `div`/`section`/`header` | low | intentional narrow channel; other tags via attrs residual |
| No events / mount (static band; no enhancer) | low | intentional |

### Icon-state-button audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `variant` / `size` are Button attrs (`data-variant` / `data-size`), not this contract's options | medium | **resolved 2026-09-17**: `forward` lists `data-variant`/`data-size` (+ form/`aria-*`); not re-declared as options |
| `compose` of Button/Icon Toggle via `also` | medium | **resolved 2026-09-17**: IconStateButton `compose` → button + icon |
| Face `icon` is not schema-required (only `name` key is); a face without icon validates | low | **resolved 2026-09-17**: item `requires: ["icon"]` |
| Single-face collections validate (avoidWhen says prefer Switch); no min entry count | low | **resolved 2026-09-17**: `minItems: 2` |
| `data-sk-icon-state-button` attr constant unused (no enhancer / mount) | low | intentional reserved; no mount without a binding |
| No events (consumer owns click → `current`) | low | intentional: decision 33 |

### Image-frame audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `as` polymorphic host has no UsageTree channel (`figure`/`div`) | medium | **resolved 2026-09-17**: `frameElement`; validate emit + React `as`; React props omit the option key |
| React `caption` stays `ReactNode` while contract restricts `MediaCaption` | medium | binding looser; UsageTree enforces |
| Children `accepts: "node"` allows non-media (Text, empty `""`) to satisfy `exactlyOneOf` | medium | intentional authored media; empty-string residual |
| Empty `alt: ""` satisfies a11y presence when `src` is given (decorative is valid; silent omit too) | medium | intentional: decorative images must be able to author empty alt; a11y rule requires the option present, not non-empty |
| No events / mount (static clip box; no enhancer) | low | intentional |
| `compose` of MediaCaption via caption slot | low | **resolved 2026-09-17**: ImageFrame `compose` → media-gradient |

### Input audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `type` is a free string (not an enum of native types) | low | intentional: platform vocabulary; NativeInput now requires it |
| `readonly` / `value` / `defaultValue` / native bounds are attrs, not options | medium | **partial 2026-09-17**: Input/NativeInput/Textarea `forward` lists `readonly`/`value`/bounds/`aria-*`; React `defaultValue` stays binding-only |
| React Input/Textarea stay valid outside FormField while trees require `parents` | low | intentional binding convenience; trees enforce the named path |
| `controlSize` has no default (omit `data-size` → CSS md base) | low | intentional: same visual as `md` without writing the attr |
| No events / mount (platform owns input; no enhancer) | low | intentional |

### Layout audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Child `data-width` (LayoutGrid spans/rails) has no UsageTree channel | high | **resolved 2026-09-17**: child `attrs["data-width"]` + `invalid-attr-value` against `childAttrs.width` |
| Child `data-span` / root `data-fill` style hooks `--sk-grid-fill` / `--sk-grid-template` | medium | `fill` option locked; numeric floor + template stay intentional style escape hatches |
| React `as` still allows any element while trees only expose sectioning tags | low | intentional narrow channel (same Box/Hero) |
| layout.css `@import`s box/wrapper/image-frame as a CSS bundle; contract does not claim them | low | intentional convenience; trees load only layout.css |
| No events / mount (static primitives; no enhancer) | low | intentional |
| Main has no part class (bare `<main>`) | low | intentional landmark shell |

### List audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `ListItemButton` native `disabled` is React/attrs only (shared `disabled` writes `data-disabled` for inert rows) | medium | **resolved 2026-09-17**: `ListItemButton` exposes `disabled`; `optionAttrs` remaps to native `disabled` + `aria-disabled` (Select.native pattern) |
| React `children` escape hatch on rows bypasses required `title` | low | intentional composition; trees enforce title |
| React `leading`/`trailing` stay `ReactNode` while contract restricts leading signatures | medium | binding looser; UsageTree enforces |
| `density` enum is only `compact` (comfortable = omit) | low | intentional: attribute nothing reads when comfortable |
| No events / mount (platform owns click/nav; no enhancer) | low | intentional |

### Marquee audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Autoplay `control: true` without play/pause labels still validates (Button icon-only name is binding-enforced) | medium | **resolved 2026-09-17**: `implies: { control: [playLabel, pauseLabel] }` |
| `compose` of Button via `also` | medium | **resolved 2026-09-17**: Marquee (+ autoplay) `compose` → button |
| React does not write `data-sk-marquee` mount (markup path does) | low | **resolved 2026-09-17**: React stamps signature mount |
| Children accept `node` (inert marks); interactive descendants are a semantics/avoidWhen rule only | low | intentional: Carousel when focusable |
| No custom `events` (play state is `data-state` + click; no shared DOM channel) | low | intentional |

### Media-gradient audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `MediaCaption.strength` injects a wash (binding compose; trees nest `MediaGradient`) | medium | **resolved 2026-09-17**: MediaCaption `compose` → media-gradient (`systemOwned`) |
| Wash hooks live on a dual-family CSS rule, so `publishedBySheet` skips them; contract lists them anyway | low | intentional: declaredAnywhere still gates promises |
| React `as` polymorphic host has no UsageTree channel | low | **resolved 2026-09-17**: `captionElement` (`ContractOption.element`) |
| No events / mount (static paint; no enhancer) | low | intentional |

### Megamenu audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| 2–4 columns is a usage guideline; `ContractSlot` has no numeric range cardinality | medium | **resolved 2026-09-17**: `minItems: 2`, `maxItems: 4`; stale "guideline only" comment fixed; validate locks both ends |
| Template still emits N positioners; one shared panel is binding-only | medium | intentional: emit model has no content-swap primitive |
| `--sk-nav-list-*` overrides in megamenu.css are foreign hooks (not published by this sheet) | low | intentional: columns compose NavListGroup; trees pull nav-list.css |

### Menu audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `group` / `groupLabel` parts exist for APG `role="group"` wrappers but the template never emits them | medium | **resolved 2026-09-17**: dropped unused parts + `.sk-menu__group-label` CSS; item `group` option kept |
| `triggerVariant` / `triggerTone` / `triggerSize` are untyped strings (Button owns the enum) | low | **resolved 2026-09-17**: `valuesFrom` Button (and stale `accent`/`subtle`/`outline` values fixed in demos and trees) |
| Controlled `open` / `defaultOpen` are binding-only | low | Accordion/Tabs pattern |
| `compose` of trigger Button via `also` | medium | **resolved 2026-09-17**: Menu `compose` → button + icon |

### Menubar audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Leaf `onActivate` is React-only (no `sk:menubar*` DOM event); dropdown traffic is Menu's `sk:menu*` on the item wrapper | low | intentional: bar owns roving focus; Menu owns command events |
| `compose` of Menu popup / Button / nav-list via `also` | medium | **resolved 2026-09-17**: MenubarItem `compose` → menu (`systemOwned`) + button + nav-list |
| Controlled open state per item is binding-only (Zag/`useMenuMachine`) | low | Accordion/Tabs pattern |

### Meter audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `value` vs `min`/`max` cross-option bounds cannot be stated (schema has per-option min/max only) | medium | **resolved 2026-09-17**: `between` |
| `--sk-meter-fill` is binding-written (no static `percentOf` because min may be non-zero) | low | intentional: emit has no fill; vanilla/React set the hook |
| No custom `events` (static measurement; enhancer only paints fill) | low | intentional |

### Nav-list audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Collapsible open state has no `sk:navlist*` DOM event (aria-expanded / hidden only) | low | intentional: Disclosure pattern; React state + vanilla enhancer, no shared channel |
| `implies` / `excludes` are not part of `surfaceHash` (same Stat gap) | medium | **resolved 2026-09-17**: surface covers implies/excludes/notInside/pairs/outputHooks |
| `aria-disabled` styling exists; no `disabled` option (attrs passthrough) | low | intentional: destinations rarely disable |

### Navbar audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Brand / NavList / Actions DOM order is not enforced (flex + `margin-inline-start: auto` on actions) | low | intentional: shell; authors order children |
| No mount / events (static shell; guests own enhancers) | low | intentional |

### Number-field audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `formatOptions` (Intl.NumberFormatOptions) has no UsageTree channel | medium | intentional binding escape hatch; locale covers the common case |
| Vanilla authored `hint` is not wired to `aria-describedby` (React does) | low | **resolved 2026-09-17**: the enhancer ids the hint and merges it into the input's `aria-describedby` |
| `min`/`max`/`value` cross-option bounds unexpressible | medium | **resolved 2026-09-17**: `between` on min↔max (value still machine-clamped) |
| `compose` of Button via `also` | medium | **resolved 2026-09-17**: NumberField `compose` → button |

### Pagination audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `page` vs `total` cross-option bound (`page <= total`) cannot be stated | medium | **resolved 2026-09-17**: `between` |
| No vanilla enhancer (emit markup is static; clicks need React or consumer JS) | low | intentional: computed window is the contract's job |
| `computedInput` `data-page`/`data-total`/`data-siblings` skip emit (React writes them) | low | intentional emit rule; attrs document the binding channel |

### Placeholder audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `width` / `height` / `lastLine` are free CSS length strings (no unit vocabulary) | low | intentional: composition measure, not a token scale |
| React omits default `lastLine` style when unset (CSS default `62%` matches contract) | low | emit writes the default; both sides agree on paint |

### Process-list audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| CSS zeros margin on nested `.sk-code-preview` without claiming CodePreview via hookSheets | low | intentional guest styling (docs demo); no foreign hooks used |
| No a11y name rule (`aria-label` / labelledby); demos often name the `ol` | low | same as Steps; surrounding heading is common |

### Progress audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| `value` vs `max` cross-option bound cannot be stated (schema has per-option min/max only) | medium | **resolved 2026-09-17**: `between` |
| No mount / events (static bar; no enhancer) | low | intentional |

### Questionnaire audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Item must have choices and/or text | medium | **resolved 2026-09-17**: `atLeastOneOf: [["choices","text"]]` + validator counts filled slots and boolean `text` |
| Sibling item `name` uniqueness | medium | **resolved 2026-09-17**: `ContractSlot.uniqueChildOption` on Questionnaire `children` |
| Progress/Steps markup is binding-injected (not in UsageTree) | low | **resolved 2026-09-17**: `Questionnaire.compose` progress/steps (`systemOwned`) + hookSheets |
| Controlled `item` is binding-only (`defaultItem` / `data-default-item` is the tree channel) | low | same Accordion/Tabs pattern |
| Baked check Icon via `data-sk-icon` on multiple-choice indicator (no icon also/hookSheets) | low | intentional guest; same Button/Stat |
| Form accessible name is attrs-only (`aria-label` in demos); no a11y rule | low | intentional: fieldset legends name each question |
| Both signatures unreachable from a canonical tree (G2 never compared the bindings) | high | **resolved 2026-09-17**: `questionnaire/survey` in `trees.ts` covers a required single choice and a free-text item, and `[data-sk-questionnaire]` now has vanilla-conformance coverage |

### QR-code audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Logo slot without `logoRatio` validates but paints a zero-sized cover | medium | **resolved 2026-09-17**: `implies` accepts a slot key |
| CSS sets guest `--sk-icon-size` on nested Icon without hookSheets | low | intentional guest styling (same Button/Stat); no formal `compose` (logo accepts any node) |
| No mount / events (geometry at emit/render; no enhancer) | low | intentional |

### Radio-group audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| No custom DOM `valueChange` event (native `change` on each input only) | low | intentional: no enhancer; exclusivity is the platform's shared `name` |
| Empty `label: ""` still satisfies a11y presence | medium | **resolved 2026-09-17**: an `aria-label` option can never be empty |
| Item `label` slot accepts `node` while demos are text | low | intentional: rich labels allowed |

### Segmented audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `onValueChange` is `(value: string) => void`; DOM detail is `{ value: string }` | low | **documented 2026-09-17**: `eventDetails.valueChange.reactDetail: "string"` (intentional API split) |
| Controlled `value` is binding-only (`defaultValue` / `data-value` is the tree channel) | low | same Accordion/Tabs pattern |
| Indicator geometry is binding-filled (`data-sk-segmented-ready` after measure) | low | intentional: residual compose/systemOwned |

### Select audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Enhanced `label` slot is optional (nearby FormField/`aria-*` may name it); no a11y `requiresOneOf` | medium | intentional: contract comment; Combobox requires its own label |
| `optionAttrs: { value: "" }` suppresses host `data-value` on `Select.native` (selectedBy is the channel) | low | **documented 2026-09-17**: empty-string `optionAttrs` value means omit on that node (vocabulary + contract.ts) |
| Controlled `value` is binding-only; `container` portal scoped via `portals: { container: true }` | low | **resolved 2026-09-17** (container); controlled value same Accordion/Tabs |
| Guest `--sk-icon-size` on indicator icons; no icon hookSheets | low | intentional guest styling (same Button/Stat) |

### Sidebar audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Controlled `collapsed` is binding-only (`defaultCollapsed` / `data-default-collapsed` is the tree channel) | low | same Accordion/Tabs pattern |
| CSS tunes guest `--sk-nav-list-*` without nav-list hookSheets | low | intentional hosting (decision 17); NavList is authored inside |
| `--sk-sidebar-resize-inline-size` is a runtime drag write, not a published override hook | low | intentional: output of interaction, clamped by min/max hooks |
| Trigger/content `aria-controls` id pair is binding-generated, not in the tree | low | documented; both bindings write it |

### Icon audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React `data` (project geometry) has no UsageTree channel | medium | intentional: product icons stay outside stable vocabulary |
| `IconSetProvider` / set binding not in contract | medium | binding concern; Lucide default is React-only |
| Placeholder host is `span`; hydrated result is `svg` | low | documented; emit writes placeholder |

### Popover audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| React generates `id` when omitted; UsageTree requires authored `panelId` | low | correct split: markup needs a real id |
| `container` prop on React Popover is unused (native `popover` API; no Portal) | low | **resolved 2026-09-17**: removed dead `container`; contract documents absent `portals` (false); native top-layer |
| `triggerVariant`/`triggerSize` untyped strings (Button owns the enum) | low | **resolved 2026-09-17**: `valuesFrom` Button + `triggerTone` |
| `compose` of trigger/close Button via `also` | medium | **resolved 2026-09-17**: Popover (+ bare) `compose` → button |

### Button audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Empty `children: ""` valid in UsageTree but paints nothing | medium | intentional: `blank-required-slot` advisory already flags it; React warn + vanilla throw; not an error (script-filled labels) |
| `type="submit"` not a contract option (intent says submit) | low | **resolved 2026-09-17**: `type` option (button/submit/reset, default button) + `shadowed-attr` rule |
| React does not write `data-sk-button` mount (markup path does) | low | **resolved 2026-09-17**: React stamps `data-sk-button` on action and navigation hosts |
| `compose` of icon in Tag/Dialog via `also: sk-button` | medium | **resolved 2026-09-17**: Tag + Dialog `compose` → button + icon (`systemOwned`); Button residual closed on consumers |
| `forward` for host attrs (`type`, `name`, `form`, `target`…) | medium | **partial 2026-09-17**: catalogue interactive/form hosts opted in (Button/Input/Tag/Checkbox/Switch/RadioGroup/Select/Slider/NumberField/FileUpload/List*/Tile*/Vaul*/Links/SkipLink/BackToTop/SidebarTrigger/Details.Summary + form roots Combobox/DatePicker/ColorPicker/TimeField/Calendar/Tabs/Accordion/Menu/Dialog/Popover/CommandPalette/Tooltip/Megamenu/Menubar/FormField/Segmented/Pagination/SplitButton/Tree*/DataGrid*/Meter/Progress/Toolbar/CheckboxGroup). Presentational shells still open |
| `sk-interactive` was a claimed part (unique owner once List dropped it) | medium | **resolved 2026-09-17**: composed via `also` only; base bundle |

### Dialog audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Conditional mount only via `vaul` attr (no `signature.mount` when opt-in) | low | deferred: option IS the mount; schema has no conditional mount |
| React markup-only when `vaul` (gesture via vanilla `mountVaul`, not `useVaulDrag`) | medium | intentional asymmetry documented; same as Vaul.drawer React |
| Platform `close` / `returnValue` not in `events` | low | correct: browser owns dismiss; no custom DOM event |
| `closeLabel` default Spanish (`Cerrar`) vs Tag English (`Remove`) | low | **resolved 2026-09-17**: every Spanish default moved to English across 12 contracts (locale `en`); docs demos pass `kit.*` labels |
| `compose` of close Button via `also` | medium | **resolved 2026-09-17**: `Dialog.compose` → button + icon (`systemOwned`) |

### Vaul audit residuals

| Gap | Severity | Status |
| --- | --- | --- |
| Opening is unexpressible in a tree: `data-sk-vaul-open="<id>"` triggers and `data-sk-vaul-close` closers are enhancer API, absent from the contract, and emitted markup has no `id` | high | **resolved 2026-09-17**: `Vaul.Trigger` (`opens` → `data-sk-vaul-open` + `aria-controls`) and `Vaul.Close`, both bindings; `ContractOption.refersTo` + `unknown-reference` |
| A required string option accepts `""` (`label: ""` validates and emits a bare `aria-label`) | medium | **resolved 2026-09-16**: validator `empty-required` for every required string option |
| `--sk-vaul-drag-offset` / `--sk-vaul-drag-progress` are runtime outputs listed as override hooks | low | **resolved 2026-09-17**: `ComponentContract.outputHooks`, checked against `hooks` |
| `dismissThreshold` has no 0–1 range in schema; `dismissVelocity` is JS-only | low | **resolved 2026-09-16**: `ContractOption.min` / `max` / `integer`; applied to vaul, accordion `headingLevel`, treegrid position options |
| Name via `aria-labelledby` (the docs' own drawer does it) is not an alternative to `label` | low | **resolved 2026-09-17**: a11y `requiresOneOf: [label, aria-labelledby]` |

### Tree-view audit residuals

| Gap | Severity | Status |
| --- | --- | --- |
| `defaultExpandedValue` / `defaultSelectedValue` can name ids that no node has, and a branch-only id in `defaultSelectedValue` | medium | **resolved 2026-09-16**: `ContractOption.keyOf` + `unknown-key`; also on tabs, select, segmented, radio-group, tile, icon-state-button |
| Event names `sk-selection-change` / `sk-expanded-change` carry no family prefix, so any other component using them would be indistinguishable on a shared ancestor | low | **resolved 2026-09-17**: catalogue-wide rename to `sk:<family><event>` |
| A leaf's `disabled` is written as a bare `disabled` on an `<li>`, where HTML gives it no meaning; it is only the enhancer's read channel | low | **resolved 2026-09-17**: `data-disabled` in the contract and the enhancer |
| Recursive keys are now unique across depth for every recursive collection (Menu too); checked the docs and canonical corpus, nothing depended on reuse | note | validator change, not schema |

### Treegrid audit residuals

| Gap | Severity | Status |
| --- | --- | --- |
| Hierarchy facts are unchecked across siblings: `posInset > setSize`, `level` 0 or jumping by 2, `setSize` disagreeing between siblings, a branch (`expanded`) with no deeper row after it, duplicate `value`s | medium | **resolved 2026-09-16**: `ContractSlot.flatHierarchy` + `invalid-hierarchy`; an empty branch is an advisory (`empty-branch`) |
| `columnWeights` count vs column count, and its comma format, are unchecked | low | **resolved 2026-09-17**: `ContractOption.list` (positive numbers, count from the first row), on Table and Treegrid |
| Event names use `sk-treegrid-*` while newer families use `sk:*` | low | **resolved 2026-09-17**: catalogue-wide rename to `sk:<family><event>` |
| React `TreegridCell` children stay `ReactNode` while the contract says `text` | low | narrowing would break consumers passing formatted nodes |

### Typography audit residuals

| Gap | Severity | Status |
| --- | --- | --- |
| Heading level is unexpressible in a tree: host is fixed `h2`, so every emitted Heading is an h2 and a page title cannot be an h1 (React has `as`) | high | **resolved 2026-09-16**: `ContractOption.element`; `headingElement` / `textElement` (React `as`) |
| Text is a `<p>` but its slot accepts any node; a Stack or Heading inside validates and is invalid HTML | medium | **resolved 2026-09-16**: validator `content-model`, derived from the rendered elements: error when the parser would split a `<p>`, advisory otherwise |
| `textRole` silently wins over `size`/`tone`/`weight`; combining them validates | low | **resolved 2026-09-17**: `ContractSignature.excludes` + `excluded-option` |
| Heading size aliases `sm`/`md`/`lg`/`display` are indistinguishable from the rungs in the artifact | low | **resolved 2026-09-17**: `ContractOption.deprecatedValues` + `deprecated-value` advisory |

### Wrapper audit residuals

| Gap | Severity | Status |
| --- | --- | --- |
| Box and Layout still spread `layoutParts`, so `sk-wrapper` has 3 claimants and Box claims `--sk-wrapper-*` via wrapper.css | medium | **resolved**: box 2026-09-16, layout 2026-09-17 |
| Nesting Wrapper in Wrapper validates (double gutters); no "not inside" rule in schema | low | **resolved 2026-09-17**: `ContractSignature.notInside` + `invalid-ancestor` |
| React `as` (e.g. `<Wrapper as="main">`) has no UsageTree channel; host is fixed `div` | medium | **resolved 2026-09-17**: `wrapperElement` / `boxElement` / `layoutElement` (sectioning tags; lists left out) |
| `validateUsageTree` throws on a `null` child instead of reporting it | low | **resolved 2026-09-17**: reported as `invalid-child` |

### Accordion audit residuals (schema / later)

| Gap | Severity | Status |
| --- | --- | --- |
| Formal `compose` of ExpandableTile (shared parts/`also`/hookSheets) | medium | **resolved 2026-09-17**: Accordion.Item `compose` → tile (`systemOwned` + sheets) |
| Typed event payload beyond `events` string map | high | **resolved 2026-09-17**: `eventDetails` (+ `source`/`trigger`); Accordion `valueChange` wired |
| `headingLevel` min/max in schema | low | **resolved 2026-09-16**: `min: 1, max: 6, integer` |
| `collapsible` irrelevant when `type="multiple"` in schema | low | **resolved 2026-09-17**: `excludes: { "type=multiple": ["collapsible"] }` |

### Residual schema work (do not patch per component forever)

These need `ComponentContract` / validator / emitter changes, then a `schemaVersion` bump
(today artifacts use `2.3`):

| Gap | Why it matters |
| --- | --- |
| **`forward` / attr allowlists** | **partial 2026-09-17**: `ContractSignature.forward` (`string[]`, `aria-*` prefix) + validator `unknown-attr`; surface-hashed; vocabulary published. Applied to interactive/form hosts catalogue-wide (Button, Input, IconStateButton, Select (+ native), ListItemButton/Link, Tag (+ link), Checkbox/Switch/RadioGroup/CheckboxGroup, NumberField, FileUpload, Slider (+ range), BackToTop, SkipLink, FolderLink, NavListLink, SidebarTrigger, TileLink/Button/Checkbox/Switch/ExpandableTileTrigger, Details.Summary, typography.Link, Vaul (+ drawer/Trigger/Close), Combobox, DatePicker (+ native), ColorPicker (+ compact/native), TimeField, Calendar, Tabs, Accordion, Menu, Dialog, Popover (+ bare), CommandPalette, Tooltip, Megamenu, Menubar, FormField, Segmented, Pagination, SplitButton, TreeView, Treegrid (+ Cell), DataGrid (+ Cell), Meter, Progress, Toolbar). Presentational static shells still open until each opts in. Namespace rule added: `data-*` is the author's and passes everywhere, `data-sk-*` is the kit's and must be published by some contract's new `authoredAttrs` (Vaul `data-sk-vaul-close`, Megamenu `data-sk-megamenu-preview*`), which is surface-hashed; `Button.action` also forwards `value` / `autofocus`|
| **Typed `events` / behavior** | **resolved 2026-09-17**: `eventDetails` carries `detail`, `direction`, `reactProp`, `reactDetail`, plus `source` (dispatching part) and `trigger` (user-activated part when clear). Filled across event families (questionnaire deferred); validate locks part keys + major wirings |
| **`compose` / `systemOwned`** | **partial 2026-09-17** (schema 2.3): Applied across most `also`-compose residuals (Dialog/Breadcrumb/Details + Avatar/BackToTop/Changelog/CodePreview/ColorPicker/Combobox/CommandPalette/CommentThread/Content/DatePicker/Editor/FileUpload/Folder/IconStateButton/ImageFrame/Loader/Marquee/MediaCaption/Menu/Menubar/NumberField/Popover/Tile/Accordion/Tag) and systemOwned on Calendar/Carousel/ColorPicker panel/Combobox chips/CommandPalette rows/Loader ticks/Annotation leaders/Editor toolbar. Questionnaire declares it too (Button/Progress/Steps on the form, Tile/FormField/Kbd/Icon on the item). Intentional leftovers still open: QR guest icon, data-grid runtime focus, file-upload React item rows, segmented indicator, folder silhouette |
| **Group cardinality** | **resolved 2026-09-17**: `ContractSlot.groupCardinality` (BadgeHolder) |
| **Hit-testing / interaction traits** | **partial 2026-09-17**: BadgeHolder + Folder/FolderLink + Button `childrenNone: ["Icon"]`. Tooltip `interactive` option is the contract channel; silhouette SVG part still CSS-only |
| **Portals / `container`** | **partial 2026-09-17**: `portals` accepts `true \| { container?: true }`. Applied `{ container: true }` to Tooltip/Combobox/ColorPicker/DatePicker/Select/Menu/Menubar/Megamenu/TimeField (React `container` ref). Popover resolved: native `popover` API, no portal, dead `container` prop removed, `portals` absent (false) |
| **Public vs realization template** | **resolved 2026-09-17**: `surfaceHash` whitelists public option fields (excludes `machineInput`), includes `eventDetails`, documents `vocabulary.contractSurface`; template `also`/attr dumps still excluded; tests lock inclusions/exclusions; 41 changelogs coordinated |
| **Bindings matrix** | **resolved 2026-09-17**: manifest derives `bindings` (`markup` / React export / enhancer mount / portals) via `bindingsOf` |
| **Hook metadata** | **resolved 2026-09-17**: manifest derives `hookDetails` (default, sheet, part, output) via `hookDetailsOf` |
| **Conditional operator table in artifact** | **resolved 2026-09-17**: `vocabulary` published on the manifest (`given` / `when` / `implies` / slot rules / …) |
| **Polymorphic host (`as`)** | **resolved 2026-09-17**: `ContractOption.element` (typography, layout, box, wrapper, footer, hero) |
| **Ancestor forbids** | **resolved 2026-09-17**: `ContractSignature.notInside` (`invalid-ancestor`), used by Wrapper |
| **Numeric bounds on the rest of the catalogue** | **resolved 2026-09-17**: bounds on annotation, back-to-top, carousel, feed, file-upload, pagination, table-pager, placeholder, progress `value`, qr-code, stat, table `colspan`, time-field, tooltip. Left free on purpose: slider/meter/number-field values (the author picks the scale) and progress `max` (the schema has no exclusive minimum) |
| **Element options beyond typography** | Done for Box, Wrapper, the flow layouts, Footer (`footerElement`) and Hero (`heroElement`), 2026-09-17 |
| **A11y name from a child signature** | **resolved 2026-09-17**: `requiresOneOf` accepts a child signature (Table named by `TableCaption`) |
| **`atLeastOneOf` across options + slots** | **resolved 2026-09-17**: validator counts filled slots + boolean true + non-default options; QuestionnaireItem `choices\|text` |
| **Unique option values across sibling signature children** | **resolved 2026-09-17**: `ContractSlot.uniqueChildOption` (Questionnaire `name`) |
| **Category / identity metadata** | **resolved 2026-09-17**: `ContractCategory` on every family; indexed in `ai-index.json` |
| **Slot `childAttrs`** | **resolved 2026-09-17**: vocabulary + LayoutGrid `data-width`; UsageTree channel is the child's `attrs`; values validated |
| **`optionAttrs` omit** | **resolved 2026-09-17**: empty-string value omits the attribute on that template node (Select.native) |

## Definition of done for a family

All of the following: skip any and the status stays `in-progress` or `pending`:

- [ ] 17-dimension audit written (findings or explicit “none”)
- [ ] Local contract / binding / semantics / changelog fixed for in-scope findings
- [ ] `pnpm --filter @skryensya/ai-compiler build` clean
- [ ] **Tests that lock the fixes** (validate_ui and/or binding tests): green
- [ ] This table set to `done` only after the tests exist and pass
- [ ] New schema gaps added to residual list if discovered
