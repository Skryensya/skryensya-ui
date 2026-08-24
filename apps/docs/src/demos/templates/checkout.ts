import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * ECOMMERCE CHECKOUT. The transactional shape, and the one template here whose whole job is to be
 * finished rather than browsed. Three things follow from that and none of them are decoration:
 *
 *   - `Steps` opens the page. A form the reader cannot abandon halfway has to say how long it is;
 *     the contract carries `status` per item, so "done / here / not yet" survives without colour.
 *   - the summary is a `List`, not a table. These rows are not compared column-wise. Each row is
 *     a line item with a title, a qualifier and a price, which is `ListItem`'s three slots exactly.
 *   - the ONLY accent on the page is the pay button. A checkout with two primary-looking buttons is
 *     a checkout where people press the wrong one.
 */

const field = (label: string, name: string, placeholder: string, type = "text"): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  options: { required: true },
  slots: {
    label,
    children: {
      contract: "input",
      signature: "Input",
      options: { type, name, placeholder },
    },
  },
});

const lineItem = (title: string, description: string, price: string): UsageTree => ({
  contract: "list",
  signature: "ListItem",
  slots: { title, description, trailing: price },
});

export const checkoutTree = (t: Translate, locale: "es" | "en"): UsageTree => {
  const money = (amount: string) => (locale === "es" ? `${amount} €` : `$${amount}`);
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      {
        contract: "navbar",
        signature: "Navbar",
        children: [
          { contract: "navbar", signature: "NavbarBrand", children: "Lumen Store" },
          {
            contract: "navbar",
            signature: "NavbarActions",
            children: {
              /*
               * A `Badge`, on both counts. Not a Button, because nothing happens when you press it
               * and a dead control is the last thing a payment page can afford; and not a `Tag`,
               * because a Tag is removable: `Badge.useWhen` covers exactly this shape, "un estado
               * corto pegado a otra cosa", with `success` as the system role it carries.
               */
              contract: "badge",
              signature: "Badge",
              options: { tone: "success" },
              children: t("demo.checkout.secure"),
            },
          },
        ],
      },
      {
        contract: "box",
        signature: "Box",
        attrs: { class: "page-shell" },
        children: {
          contract: "layout",
          signature: "Main",
          attrs: { class: "page-shell__main" },
          children: {
            contract: "wrapper",
            signature: "Wrapper",
            options: { wrapperSize: "lg" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "lg" },
              children: [
                {
                  contract: "steps",
                  signature: "Steps",
                  slots: {
                    items: [
                      {
                        options: { status: "complete" },
                        slots: {
                          /* A check, not a "1": the completion cue has to survive without colour. */
                          marker: { contract: "icon", signature: "Icon", options: { name: "check" } },
                          label: t("demo.checkout.step1"),
                          description: t("demo.checkout.step1Hint"),
                        },
                      },
                      {
                        options: { status: "current", current: true },
                        slots: {
                          marker: "2",
                          label: t("demo.checkout.step2"),
                          description: t("demo.checkout.step2Hint"),
                        },
                      },
                      {
                        options: { status: "upcoming" },
                        slots: {
                          marker: "3",
                          label: t("demo.checkout.step3"),
                          description: t("demo.checkout.step3Hint"),
                        },
                      },
                    ],
                  },
                },
                {
                  contract: "layout",
                  signature: "Grid",
                  options: { columns: "2", gap: "lg", multicol: true },
                  children: [
                    {
                      contract: "layout",
                      signature: "Stack",
                      options: { gap: "md" },
                      children: [
                        {
                          contract: "typography",
                          signature: "Heading",
                          options: { headingSize: "h3", flush: true },
                          children: t("demo.checkout.formTitle"),
                        },
                        field(
                          t("demo.checkout.fieldName"),
                          "name",
                          t("demo.checkout.fieldNamePlaceholder"),
                        ),
                        field(
                          t("demo.checkout.fieldEmail"),
                          "email",
                          t("demo.checkout.fieldEmailPlaceholder"),
                          "email",
                        ),
                        field(
                          t("demo.checkout.fieldAddress"),
                          "address",
                          t("demo.checkout.fieldAddressPlaceholder"),
                        ),
                        /*
                         * City and Country are their own rows, not an `Inline` pair. Side by side
                         * they looked tidier and measured badly: this column is already half of a
                         * two-column split, so at anything under a wide desktop the two fields were
                         * asking for 319px inside 245 and their labels clipped with no way to
                         * scroll. `equal` distributes the space it is given; it cannot create any.
                         */
                        field(
                          t("demo.checkout.fieldCity"),
                          "city",
                          t("demo.checkout.fieldCityPlaceholder"),
                        ),
                        /*
                         * `Select.native`, wrapped in a FormField like every other control in this
                         * column. The custom `Select` exists for options that need markup, a
                         * controlled collection or its own positioning; three plain country names
                         * need none of that, and `Select.avoidWhen` is blunt about it: "la
                         * apariencia dejó de ser razón para reemplazar el control nativo". On a
                         * phone the native one also opens the platform picker, which on a checkout
                         * is worth more than matching the input's border radius.
                         */
                        {
                          contract: "form-field",
                          signature: "FormField",
                          options: { required: true },
                          slots: {
                            label: t("demo.checkout.fieldCountry"),
                            children: {
                              contract: "select",
                              signature: "Select.native",
                              options: { name: "country" },
                              slots: {
                                items: [
                                  {
                                    options: { value: "es" },
                                    slots: { label: t("demo.checkout.countryEs") },
                                  },
                                  {
                                    options: { value: "cl" },
                                    slots: { label: t("demo.checkout.countryCl") },
                                  },
                                  {
                                    options: { value: "mx" },
                                    slots: { label: t("demo.checkout.countryMx") },
                                  },
                                ],
                              },
                            },
                          },
                        },
                        {
                          contract: "checkbox",
                          signature: "Checkbox",
                          options: { name: "billing", defaultChecked: true },
                          children: t("demo.checkout.sameBilling"),
                        },
                      ],
                    },
                    {
                      contract: "box",
                      signature: "Box",
                      options: { surface: "sunken", border: "subtle", padding: "lg" },
                      children: {
                        contract: "layout",
                        signature: "Stack",
                        options: { gap: "md" },
                        children: [
                          {
                            contract: "typography",
                            signature: "Heading",
                            options: { headingSize: "h4", flush: true },
                            children: t("demo.checkout.summaryTitle"),
                          },
                          {
                            contract: "list",
                            signature: "List",
                            options: { density: "compact" },
                            children: [
                              lineItem(
                                t("demo.checkout.item1"),
                                t("demo.checkout.item1Hint"),
                                money("89,00"),
                              ),
                              lineItem(
                                t("demo.checkout.item2"),
                                t("demo.checkout.item2Hint"),
                                money("32,00"),
                              ),
                              lineItem(
                                t("demo.checkout.shipping"),
                                t("demo.checkout.shippingHint"),
                                money("7,00"),
                              ),
                            ],
                          },
                          /*
                           * The total is a `Stat`. One number with its name, which is exactly what
                           * that contract is for, and it brings the tabular figures every other
                           * figure in the kit already has.
                           *
                           * The tax note is NOT in its `change` slot, though it fitted there and
                           * looked right. `change` is the DELTA, where the number is heading. And
                           * "IVA incluido" says nothing about direction; parked there it would have
                           * inherited the trend styling and read as movement that does not exist.
                           * A qualifier under a figure is just text.
                           */
                          {
                            contract: "stat",
                            signature: "Stat",
                            slots: {
                              label: t("demo.checkout.total"),
                              value: money("128,00"),
                            },
                          },
                          {
                            contract: "typography",
                            signature: "Text",
                            options: { size: "sm", tone: "secondary" },
                            children: t("demo.checkout.taxNote"),
                          },
                          {
                            contract: "button",
                            signature: "Button.action",
                            options: { variant: "accent", size: "lg" },
                            children: t("demo.checkout.pay"),
                          },
                          {
                            contract: "typography",
                            signature: "Text",
                            options: { size: "sm", tone: "tertiary" },
                            children: t("demo.checkout.terms"),
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    ],
  };
};
