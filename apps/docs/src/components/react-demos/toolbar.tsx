/*
 * Live React demo for /components/toolbar. The "nested Segmented" preview on this page ships no
 * `react` source (see toolbar.astro) so it stays vanilla-only; only the plain-buttons example gets
 * a live island. `bold`/`italic`/`link` aren't in the default Phosphor stable vocabulary, so this
 * demo links lucide the same way theme-toggle.tsx does.
 */
import { IconSetProvider, Icon } from "@skryensya/react/icon";
import type { StableIconName } from "@skryensya/core/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@skryensya/react/toolbar";
import { Tooltip } from "@skryensya/react/tooltip";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn("toolbar");

/*
 * `Icon`'s `name` is typed to the STABLE vocabulary on purpose: it is set-independent, which is what
 * makes swapping icon sets a no-op at every call site (decision 15). A glyph that only one set draws
 * therefore has no type to name it, even when, as here, the set that draws it is bound two lines
 * up. The vanilla demo on this page has the same requirement and meets it the same way, by binding
 * lucide explicitly (`mountIcons(document, lucideIcons)`), and an untyped `data-sk-icon` attribute.
 *
 * So this is one named seam rather than three scattered casts: it is only sound while the enclosing
 * IconSetProvider binds a set that actually draws these. Widening `Icon` globally is the thing NOT to
 * do: it would let any call site name a glyph the next set has never heard of.
 */
const lucideOnly = (name: "bold" | "italic" | "link") => name as StableIconName;

export const ToolbarDemo = framed(function ToolbarDemo() {
  return (
    <IconSetProvider set={lucideIcons}>
      <Toolbar label="Text format">
        <ToolbarGroup>
          <Tooltip content="Bold" placement="block-end" arrow>
            <button type="button" aria-label="Bold">
              <Icon name={lucideOnly("bold")} />
            </button>
          </Tooltip>
          <Tooltip content="Italic" placement="block-end" arrow>
            <button type="button" aria-label="Italic">
              <Icon name={lucideOnly("italic")} />
            </button>
          </Tooltip>
        </ToolbarGroup>
        <ToolbarSeparator />
        <Tooltip content="Link" placement="block-end" arrow>
          <button type="button" aria-label="Link">
            <Icon name={lucideOnly("link")} />
          </button>
        </Tooltip>
      </Toolbar>
    </IconSetProvider>
  );
});
