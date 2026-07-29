import { describe, expect, it } from "vitest";
import { emitMarkup, emitReact } from "./emit.js";
import { validateUsageTree } from "./validate.js";
import type { UsageTree } from "./usage-tree.js";

/*
 * F2's exit gate: the emitter has to produce, from the canonical trees, the markup a human wrote by
 * hand in apps/docs. Compared as DOM rather than as bytes — the hand-written strings were formatted
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

/** Structure, classes and attributes — what G2 will compare, minus a formatter's opinions. */
function normalize(markup: string): string {
  return markup
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/\s*=\s*/g, "=")
    .trim();
}

describe("emitMarkup", () => {
  it("writes the action signature onto its native host", () => {
    expect(emitMarkup(saveButton)).toBe(
      '<button class="sk-button sk-interactive" data-sk-button data-variant="primary" data-size="md">Guardar</button>',
    );
  });

  it("switches host on the discriminant, and drops nothing else", () => {
    expect(emitMarkup(docsLink)).toBe(
      '<a class="sk-button sk-interactive" data-sk-button data-variant="primary" data-size="md" href="/docs">Documentación</a>',
    );
  });

  it("expands three signatures into the five levels the markup needs", () => {
    const handWritten = `
      <nav class="sk-nav-list" aria-label="Principal">
        <div class="sk-nav-list__group">
          <div class="sk-nav-list__group-label" id="espacio">Espacio</div>
          <ul class="sk-nav-list__list" aria-labelledby="espacio">
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
      children: { contract: "nav-list", signature: "NavListLink", options: { href: "/" }, children: "Inicio" },
    };

    const markup = emitMarkup(unlabelled);

    // The label goes, the <ul> stays: a <li> still needs a list to sit inside.
    expect(markup).not.toContain("sk-nav-list__group-label");
    expect(markup).toContain('<ul class="sk-nav-list__list">');
  });

  it("is deterministic: same tree, same bytes", () => {
    expect(emitMarkup(navigation)).toBe(emitMarkup(navigation));
  });
});

describe("emitReact", () => {
  it("emits signatures with complete imports, not the part template", () => {
    expect(emitReact(saveButton)).toBe(
      ['import { Button } from "@skryensya/react/button";', "", '<Button variant="primary">Guardar</Button>'].join("\n"),
    );
  });

  it("keeps a composition three elements deep, because React renders the rest", () => {
    const tsx = emitReact(navigation);

    expect(tsx).toContain('import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";');
    expect(tsx).toContain('<NavListLink href="/" current>');
    expect(tsx).toContain('<NavListGroup label="Espacio">');
    expect(tsx).not.toContain("sk-nav-list__item");
  });
});

describe("the two bindings agree on what the tree says", () => {
  it("validates before it emits anything", () => {
    for (const tree of [saveButton, docsLink, navigation]) {
      expect(validateUsageTree(tree).valid).toBe(true);
    }
  });
});

describe("wiring — six ids from one name", () => {
  const field = (extra: Record<string, unknown> = {}): UsageTree =>
    ({
      contract: "field",
      signature: "Field",
      slots: { label: "Email", ...(extra.slots as object) },
      options: extra.options as Record<string, string | boolean>,
      children: { contract: "input", signature: "Input", options: { name: "email" } },
    }) as UsageTree;

  it("binds the label, the control, the hint and the error", () => {
    const markup = emitMarkup(
      field({ slots: { hint: "Sólo para boletas.", error: "Dirección inválida." } }),
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
    // No error, so nothing claims the field is invalid — colour is never the only cue, and neither
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
    expect(markup).toContain('<input class="sk-input" type="text" name="email" id="email" required>');
    expect(markup).toContain('<span class="sk-field__required" aria-hidden="true">*</span>');
  });

  it("honours an author's own id", () => {
    const tree = { ...field({ slots: { error: "Falta." } }), attrs: { id: "correo" } } as UsageTree;
    const markup = emitMarkup(tree);

    expect(markup).toContain('for="correo"');
    expect(markup).toContain('id="correo-error"');
  });

  it("closes a void element without a closing tag", () => {
    // `</input>` is markup no parser accepts as written.
    expect(emitMarkup(field())).not.toContain("</input>");
  });
});
