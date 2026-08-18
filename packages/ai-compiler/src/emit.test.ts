import { describe, expect, it } from "vitest";
import { emitMarkup, emitReact, emitReactSource } from "./emit.js";
import { validateUsageTree } from "./validate.js";
import type { UsageTree } from "./usage-tree.js";

/*
 * F2's exit gate: the emitter has to produce, from the canonical trees, the markup a human wrote by
 * hand in apps/docs. Compared as DOM rather than as bytes, since the hand-written strings were formatted
 * by an editor, and matching a formatter's line-breaking is not evidence of anything.
 */

const saveButton: UsageTree = {
  contract: "button",
  signature: "Button.action",
  options: { variant: "primary" },
  children: "Guardar",
};

const docsLink: UsageTree = {
  contract: "button",
  signature: "Button.navigation",
  options: { variant: "primary", href: "/docs" },
  children: "Documentación",
};

const navigation: UsageTree = {
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": "Principal" },
  children: [
    {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: { label: "Espacio" },
      children: [
        {
          contract: "nav-list",
          signature: "NavListLink",
          options: { href: "/", current: true },
          children: "Inicio",
        },
        {
          contract: "nav-list",
          signature: "NavListLink",
          options: { href: "/reportes" },
          slots: { trailing: "12" },
          children: "Reportes",
        },
      ],
    },
  ],
};

/** Structure, classes and attributes: what G2 will compare, minus a formatter's opinions. */
function normalize(markup: string): string {
  return markup
    .replace(/\s+/g, " ")
    .replace(/\s*([<>])\s*/g, "$1")
    .replace(/\s*=\s*/g, "=")
    .trim();
}

describe("emitMarkup", () => {
  it("writes the action signature onto its native host", () => {
    expect(normalize(emitMarkup(saveButton))).toBe(
      '<button class="sk-button sk-interactive" data-sk-button data-variant="primary" data-size="md">Guardar</button>',
    );
  });

  it("switches host on the discriminant, and drops nothing else", () => {
    expect(normalize(emitMarkup(docsLink))).toBe(
      '<a class="sk-button sk-interactive" data-sk-button data-variant="primary" data-size="md" href="/docs">Documentación</a>',
    );
  });

  it("merges a consumer class into the host's contract class", () => {
    const tree: UsageTree = {
      contract: "box",
      signature: "Box",
      attrs: { class: "consumer-shell" },
      children: "Content",
    };
    const markup = emitMarkup(tree);

    expect(markup).toContain('class="sk-box consumer-shell"');
    expect(markup.match(/\bclass=/g)).toHaveLength(1);
  });

  it("expands three signatures into the five levels the markup needs", () => {
    const handWritten = `
      <nav class="sk-nav-list" aria-label="Principal">
        <div class="sk-nav-list__group">
          <div class="sk-nav-list__group-label" id="espacio">Espacio</div>
          <ul class="sk-nav-list__list" role="list" aria-labelledby="espacio">
            <li class="sk-nav-list__item">
              <a class="sk-nav-list__link sk-interactive" href="/" aria-current="page">
                <span class="sk-nav-list__label">Inicio</span>
              </a>
            </li>
            <li class="sk-nav-list__item">
              <a class="sk-nav-list__link sk-interactive" href="/reportes">
                <span class="sk-nav-list__label">Reportes</span>
                <span class="sk-nav-list__trailing">12</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>`;

    // The one declared divergence: the emitter writes every mapped option, defaults included, so
    // that the two bindings land on the same DOM. React already does; hand-authored markup did not.
    expect(normalize(emitMarkup(navigation))).toBe(
      normalize(handWritten).replace(
        '<nav class="sk-nav-list"',
        '<nav class="sk-nav-list" data-orientation="vertical"',
      ),
    );
  });

  it("omits a conditional node when its slot is empty", () => {
    const unlabelled: UsageTree = {
      contract: "nav-list",
      signature: "NavListGroup",
      children: {
        contract: "nav-list",
        signature: "NavListLink",
        options: { href: "/" },
        children: "Inicio",
      },
    };

    const markup = emitMarkup(unlabelled);

    // The label goes, the <ul> stays: a <li> still needs a list to sit inside.
    expect(markup).not.toContain("sk-nav-list__group-label");
    expect(markup).toContain('<ul class="sk-nav-list__list" role="list">');
  });

  /*
   * A slot whose default is MARKUP, which is what `whenMissing` exists for. A breadcrumb separator is
   * the case: text or an Icon when the author fills it, and the system's `/` when they do not, two
   * nodes with one condition each, so no precedence rule has to live in this file.
   */
  it("falls back to the template's own separator, and steps aside when the slot is filled", () => {
    const trail = (separator?: UsageTree): UsageTree => ({
      contract: "breadcrumb",
      signature: "Breadcrumb",
      slots: {
        ...(separator ? { separator } : {}),
        items: [
          { options: { href: "/" }, slots: { label: "Inicio" } },
          { options: { current: true }, slots: { label: "Atlas" } },
        ],
      },
    });

    expect(emitMarkup(trail())).toContain(
      '<span class="sk-breadcrumb__separator" aria-hidden="true">/</span>',
    );

    const chevron = emitMarkup(
      trail({
        contract: "icon",
        signature: "Icon",
        options: { name: "chevron-right" },
      }),
    );
    expect(chevron).toContain('data-sk-icon="chevron-right"');
    expect(chevron).not.toContain(">/<");
  });

  /*
   * The current page is never a link, even when the author gives it an `href` alongside `current`:
   * it is the one label the trail exists to answer "where am I", never truncated or muted like an
   * ancestor crumb. `whenItemAllGiven` is the primitive this needs — a node whose visibility
   * depends on TWO item options both being supplied, which `whenItemGiven` (one option per node)
   * cannot express and `whenItemEquals` cannot either (a boolean's stored value is a literal JS
   * `true`, never the string `"true"` `equals` compares against).
   */
  it("keeps the current crumb as text, with aria-current, even when it also carries an href", () => {
    const currentWithHref = emitMarkup({
      contract: "breadcrumb",
      signature: "Breadcrumb",
      slots: {
        items: [{ options: { href: "/settings", current: true }, slots: { label: "Settings" } }],
      },
    });

    expect(currentWithHref).toContain('<span class="sk-breadcrumb__current" aria-current="page">');
    expect(currentWithHref).not.toContain("<a");
  });

  it("keeps an ordinary linked crumb as a link, with no stray aria-current", () => {
    const linkOnly = emitMarkup({
      contract: "breadcrumb",
      signature: "Breadcrumb",
      slots: {
        items: [{ options: { href: "/" }, slots: { label: "Home" } }],
      },
    });

    expect(linkOnly).toContain('<a class="sk-breadcrumb__link"');
    expect(linkOnly).not.toContain("aria-current");
  });

  it("is deterministic: same tree, same bytes", () => {
    expect(emitMarkup(navigation)).toBe(emitMarkup(navigation));
  });

  it("keeps a short opening tag on one line", () => {
    expect(
      emitMarkup({ contract: "kbd", signature: "Kbd", children: "⌘K" }),
    ).toBe('<kbd class="sk-kbd">⌘K</kbd>');
  });

  it("wraps a long opening tag one attribute per line, same as JSX", () => {
    expect(emitMarkup(docsLink)).toBe(
      [
        "<a",
        '  class="sk-button sk-interactive"',
        "  data-sk-button",
        '  data-variant="primary"',
        '  data-size="md"',
        '  href="/docs"',
        ">",
        "  Documentación",
        "</a>",
      ].join("\n"),
    );
  });

  /*
   * A slot's items each get their own line, and HTML collapses the newline between two of them into
   * a rendered space — which is correct everywhere a text neighbour already wanted one, and wrong at
   * a boundary that wanted none: a link glued to the comma right after it would otherwise float a
   * space in front of the punctuation that neither side of the source wrote.
   */
  it("puts no space between an element and text that touches it, and keeps every space that is written", () => {
    const paragraph: UsageTree = {
      contract: "typography",
      signature: "Text",
      children: [
        "Un párrafo con un ",
        { contract: "typography", signature: "Link", options: { href: "/link" }, children: "enlace" },
        ", pegado a la coma.",
      ],
    };

    expect(emitMarkup(paragraph)).toBe(
      [
        '<p class="sk-text" data-tone="primary" data-size="body" data-weight="body">',
        "  Un párrafo con un ",
        '  <a class="sk-link sk-interactive" href="/link">enlace</a>, pegado a la coma.',
        "</p>",
      ].join("\n"),
    );
  });
});

describe("emitReact", () => {
  it("emits signatures with complete imports, not the part template", () => {
    expect(emitReact(saveButton)).toBe(
      [
        'import { Button } from "@skryensya/react/button";',
        "",
        "export function ButtonExample() {",
        '  return <Button variant="primary">Guardar</Button>;',
        "}",
      ].join("\n"),
    );
  });

  /*
   * Every snippet, not only the ones with data to import. A bare expression is not a file: nothing
   * declares it and nothing renders it, and the reader is left to know that a component goes around
   * it — which is the thing the page is meant to be showing.
   */
  it("is always a component, even with nothing to hold", () => {
    const tsx = emitReact(saveButton);

    expect(tsx).toContain("export function ButtonExample() {");
    expect(tsx).toContain("  return ");
  });

  it("keeps a composition three elements deep, because React renders the rest", () => {
    const tsx = emitReact(navigation);

    expect(tsx).toContain(
      'import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";',
    );
    expect(tsx).toContain('<NavListLink href="/" current>');
    expect(tsx).toContain('<NavListGroup label="Espacio">');
    expect(tsx).not.toContain("sk-nav-list__item");
  });

  it("spells a passthrough attr the way React does, so the snippet pastes without a warning", () => {
    const scroll: UsageTree = {
      contract: "table",
      signature: "TableScroll",
      attrs: { role: "region", tabindex: "0", "aria-label": "Regiones" },
      children: { contract: "table", signature: "Table", children: [] },
    };

    const tsx = emitReact(scroll);

    expect(tsx).toContain('tabIndex="0"');
    expect(tsx).not.toContain("tabindex");
    // `role` and `aria-*` are already what React wants; renaming them would be the opposite bug.
    expect(tsx).toContain('role="region"');
    expect(tsx).toContain('aria-label="Regiones"');
  });

  it("wraps composed props and prose before docs snippets need horizontal scroll", () => {
    const toast: UsageTree = {
      contract: "content",
      signature: "ToastRegion",
      children: {
        contract: "content",
        signature: "Toast",
        options: { dismissible: true, dismissLabel: "Descartar" },
        slots: {
          title: "Documento archivado",
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { size: "sm", variant: "neutral" },
            children: "Deshacer",
          },
        },
        children: "Se movió a Archivados.",
      },
    };

    const tsx = emitReact(toast);
    expect(tsx).toContain(
      [
        "    <ToastRegion>",
        "      <Toast",
        "        dismissible",
        '        dismissLabel="Descartar"',
        '        title="Documento archivado"',
        '        actions={<Button variant="neutral" size="sm">Deshacer</Button>}',
        "      >",
        "        Se movió a Archivados.",
        "      </Toast>",
        "    </ToastRegion>",
      ].join("\n"),
    );
    // 80, the width JSX is printed at: four columns of it are the component wrapper's indentation.
    expect(tsx.split("\n").every((line) => line.length <= 80)).toBe(true);
  });

  /*
   * A word sandwiched between two tags on its own indented line is exactly the shape Babel and
   * TypeScript's JSX transform trims BOTH edges of, silently: the source still reads as though the
   * space survived, and only the rendered page shows it did not. `{" "}` is the only child JSX keeps
   * regardless of the newline beside it, which is why a needed space becomes one and a boundary with
   * none — the comma glued straight to the second link — gets none either.
   */
  it("keeps every space prose needs around an element, and adds none where the source has none", () => {
    const paragraph: UsageTree = {
      contract: "typography",
      signature: "Text",
      children: [
        "Un párrafo con un ",
        { contract: "typography", signature: "Link", options: { href: "/link" }, children: "enlace" },
        " y otro ",
        { contract: "typography", signature: "Link", options: { href: "/link" }, children: "más" },
        ", el segundo pegado a la coma.",
      ],
    };

    expect(emitReact(paragraph)).toContain(
      [
        "    <Text>",
        '      Un párrafo con un{" "}',
        '      <Link href="/link">enlace</Link>{" "}',
        '      y otro{" "}',
        '      <Link href="/link">más</Link>, el segundo pegado a la coma.',
        "    </Text>",
      ].join("\n"),
    );
  });
});

describe("a collection is data, and data lives in a file of its own", () => {
  const menu: UsageTree = {
    contract: "menu",
    signature: "Menu",
    options: { label: "Archivo" },
    slots: {
      trigger: "Archivo",
      items: [
        { options: { value: "new" }, slots: { label: "Nuevo" } },
        {
          options: { value: "share" },
          slots: {
            label: "Compartir",
            children: [
              { options: { value: "email" }, slots: { label: "Por correo" } },
              { options: { value: "link" }, slots: { label: "Copiar enlace" } },
            ],
          },
        },
      ],
    },
  } as never;

  it("moves it to a module named after it, one entry per line", () => {
    const { data } = emitReactSource(menu);

    expect(data?.file).toBe("menu-items.ts");
    expect(data?.specifier).toBe("./menu-items");
    expect(data?.source).toBe(
      [
        "export const items = [",
        '  { value: "new", label: "Nuevo" },',
        "  {",
        '    value: "share",',
        '    label: "Compartir",',
        "    children: [",
        '      { value: "email", label: "Por correo" },',
        '      { value: "link", label: "Copiar enlace" },',
        "    ],",
        "  },",
        "];",
        "",
      ].join("\n"),
    );
  });

  it("leaves the component file with nothing but the composition", () => {
    expect(emitReactSource(menu).component).toBe(
      [
        'import { Menu } from "@skryensya/react/menu";',
        'import { items } from "./menu-items";',
        "",
        "export function MenuExample() {",
        // The tag fits on one line now that the data is not inside it, which is the whole point.
        '  return <Menu label="Archivo" trigger="Archivo" items={items} />;',
        "}",
      ].join("\n"),
    );
  });

  it("keys are unquoted and a row that fits stays on one line", () => {
    const { data } = emitReactSource(menu);

    expect(data?.source).not.toContain('"value":');
    expect(data?.source).not.toContain('[{"value"');
  });

  it("names the second collection apart from the first, in one shared module", () => {
    const select = (name: string): UsageTree =>
      ({
        contract: "select",
        signature: "Select",
        options: { name, label: "Plan" },
        slots: { options: [{ options: { value: "pro" }, slots: { label: "Pro" } }] },
      }) as never;

    const { component, data } = emitReactSource({
      contract: "toolbar",
      signature: "Toolbar",
      children: [select("uno"), select("dos")],
    } as never);

    /*
     * Two collections, so no single entry's name would be honest about the file — and named for the
     * contract that OWNS them, not for the Toolbar they happen to sit in.
     */
    expect(data?.file).toBe("select-data.ts");
    expect(data?.source).toContain("export const options = [");
    expect(data?.source).toContain("export const options2 = [");
    expect(component).toContain(
      'import { options, options2 } from "./select-data";',
    );
    expect(component).toContain('<Select name="uno" options={options} />');
    expect(component).toContain('<Select name="dos" options={options2} />');
  });

  it("does not name a file after a contract twice", () => {
    // Steps' collection is called `steps`, and `steps-steps.ts` is a stutter rather than a name.
    const { data } = emitReactSource({
      contract: "steps",
      signature: "Steps",
      slots: {
        items: [{ options: { status: "current" }, slots: { label: "Marca" } }],
      },
    } as never);

    expect(data?.file).toBe("steps-data.ts");
  });

  it("writes no data module for a composition that carries no collection", () => {
    const { component, data } = emitReactSource(saveButton);

    expect(data).toBeUndefined();
    expect(component).not.toContain("import {  }");
    // The component is still a component; it just has nothing to import beside the binding.
    expect(component.match(/^import /gm)).toHaveLength(1);
  });

  it("takes the caller's name and export, for a sandbox entry file", () => {
    const source = emitReact(saveButton, {
      component: "App",
      export: "default",
    });

    expect(source).toContain("export default function App() {");
    expect(source).toContain('  return <Button variant="primary">Guardar</Button>;');
  });
});

describe("the two bindings agree on what the tree says", () => {
  it("validates before it emits anything", () => {
    for (const tree of [saveButton, docsLink, navigation]) {
      expect(validateUsageTree(tree).valid).toBe(true);
    }
  });

  it("writes style-backed options as CSS custom properties in both bindings", () => {
    const carousel: UsageTree = {
      contract: "carousel",
      signature: "Carousel",
      options: { slideSize: "min(42%, 14rem)" },
      attrs: { "aria-label": "Features" },
      children: {
        contract: "carousel",
        signature: "CarouselSlide",
        children: "Search",
      },
    };

    const carouselMarkup = emitMarkup(carousel);
    expect(carouselMarkup).toContain(
      'style="--sk-carousel-slide-size: min(42%, 14rem);"',
    );
    expect(carouselMarkup).not.toContain("data-slide-size");
    expect(emitReact(carousel)).toContain(
      'style={{ "--sk-carousel-slide-size": "min(42%, 14rem)" } as CSSProperties}',
    );

    const table: UsageTree = {
      contract: "table",
      signature: "TableScroll",
      options: { density: 1, densityFactor: 0.6 },
      children: {
        contract: "table",
        signature: "Table",
        children: {
          contract: "table",
          signature: "TableBody",
          children: {
            contract: "table",
            signature: "TableRow",
            children: {
              contract: "table",
              signature: "TableCell",
              children: "Search",
            },
          },
        },
      },
    };

    expect(emitMarkup(table)).toContain(
      'style="--sk-density: 1; --sk-density-factor: 0.6;"',
    );
    expect(emitReact(table)).toContain(
      'style={{ "--sk-density": 1, "--sk-density-factor": 0.6 } as CSSProperties}',
    );
  });
});

describe("wiring: six ids from one name", () => {
  const field = (extra: Record<string, unknown> = {}): UsageTree =>
    ({
      contract: "form-field",
      signature: "FormField",
      slots: { label: "Email", ...(extra.slots as object) },
      options: extra.options as Record<string, string | boolean>,
      children: {
        contract: "input",
        signature: "Input",
        options: { name: "email" },
      },
    }) as UsageTree;

  it("binds the label, the control, the hint and the error", () => {
    const markup = emitMarkup(
      field({
        slots: { hint: "Sólo para boletas.", error: "Dirección inválida." },
      }),
    );

    // The author wrote a label and two messages. These six ids are the contract's, not theirs.
    expect(markup).toContain('for="email"');
    expect(markup).toContain('id="email-hint"');
    expect(markup).toContain('id="email-error"');
    expect(markup).toContain('id="email"');
    expect(markup).toContain('aria-describedby="email-hint email-error"');
    expect(markup).toContain('aria-invalid="true"');
  });

  it("describes only what exists", () => {
    const markup = emitMarkup(field({ slots: { hint: "Sólo para boletas." } }));

    expect(markup).toContain('aria-describedby="email-hint"');
    // No error, so nothing claims the field is invalid: colour is never the only cue, and neither
    // is an attribute pointing at a message that was never written.
    expect(markup).not.toContain("aria-invalid");
    expect(markup).not.toContain("email-error");
  });

  it("adds no wiring at all when there is nothing to bind", () => {
    const markup = emitMarkup(field());

    expect(markup).toContain('for="email"');
    expect(markup).not.toContain("aria-describedby");
    expect(markup).not.toContain("aria-invalid");
  });

  it("puts required on the control, not on the box, and marks the label", () => {
    const markup = emitMarkup(field({ options: { required: true } }));

    // The asterisk is decorative; the attribute is what actually says it, and it belongs to the input.
    // Options come out in the contract's own declaration order, then what the wiring added.
    expect(markup).toContain(
      '<input class="sk-input" type="text" name="email" id="email" required>',
    );
    expect(markup).toContain(
      '<span class="sk-form-field__required" aria-hidden="true">*</span>',
    );
  });

  it("honours an author's own id", () => {
    const tree = {
      ...field({ slots: { error: "Falta." } }),
      attrs: { id: "correo" },
    } as UsageTree;
    const markup = emitMarkup(tree);

    expect(markup).toContain('for="correo"');
    expect(markup).toContain('id="correo-error"');
  });

  it("closes a void element without a closing tag", () => {
    // `</input>` is markup no parser accepts as written.
    expect(emitMarkup(field())).not.toContain("</input>");
  });
});

describe("a string option that contains a quote", () => {
  /*
   * CommandPalette's index arrives as a JSON STRING, because a usage tree has no channel for an
   * array of objects. Quoted with `JSON.stringify` straight into the attribute, the first escaped
   * quote ended the attribute and Babel refused the file: the snippet on the docs page did not
   * compile, and neither did the playground's copy of it.
   */
  it("goes in an expression container so the JSX still parses", () => {
    const source = emitReact({
      contract: "command-palette",
      signature: "CommandPalette",
      options: {
        paletteId: "cmdk",
        label: "Buscar",
        entries: '[{"label":"Button","href":"/componentes/button"}]',
      },
    } as never);

    // `entries` is the option; `items` is the prop the contract maps it to.
    expect(source).toContain(
      'items={"[{\\"label\\":\\"Button\\",\\"href\\":\\"/componentes/button\\"}]"}',
    );
    expect(source).not.toContain('items="[{\\"');
  });

  it("leaves a quote-free value as the plain attribute a person would write", () => {
    const source = emitReact({
      contract: "button",
      signature: "Button.action",
      options: { variant: "primary" },
      children: "Guardar",
    } as never);

    expect(source).toContain('variant="primary"');
  });
});
