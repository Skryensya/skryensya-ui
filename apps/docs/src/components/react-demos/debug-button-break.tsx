/*
 * Diagnostic only, for /debug/button-break. Renders the REAL `@skryensya/react` Button once per
 * stress scenario. The page around it adds labels and fixed-width containers and nothing else: no
 * fonts, no token overrides, no simulated themes. A button observed under any of those is a
 * different button.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Button } from "@skryensya/react/button";
import { Icon, IconSetProvider } from "@skryensya/react/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import type { ReactNode } from "react";

const VARIANTS = ["solid", "soft", "ghost", "translucent"] as const;
const TONES = ["neutral", "accent", "danger"] as const;
const SIZES = ["xs", "sm", "md", "lg"] as const;

const LABELS = {
  empty: "",
  word: "Save",
  typical: "Save changes",
  sentences:
    "Save your changes now. This overwrites the previous draft, and the draft cannot be recovered afterwards.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
  emojiAlone: "🎉",
  emojiMixed: "Save 🎉 now",
  rtl: "احفظ التغييرات",
  mixed: "احفظ إلى Google Drive الآن",
  diacritics: "Hiển thị Ẩn Giấy tờ सहेजें",
};

function Case({
  label,
  note,
  broke,
  fixed,
  children,
}: {
  label: string;
  note?: string;
  /** What visibly broke in this scenario, written after the look. The page reads as the report. */
  broke?: string;
  /** A scenario that broke and has since been fixed, so the page shows the before as well as the after. */
  fixed?: string;
  children: ReactNode;
}) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      {note ? <p className="break-case__note">{note}</p> : null}
      {broke ? <p className="break-case__broke">BROKE. {broke}</p> : null}
      {fixed ? <p className="break-case__fixed">WAS BROKEN, NOW {fixed}</p> : null}
      <div className="break-case__stage">{children}</div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-group">
      <h2 className="break-group__title">{title}</h2>
      {children}
    </section>
  );
}

export function ButtonBreak() {
  return (
    <IconSetProvider set={lucideIcons}>
      <Group title="Baseline. Variant × tone, size md">
        {VARIANTS.map((variant) => (
          <Case key={variant} label={`variant="${variant}" × every tone`}>
            {TONES.map((tone) => (
              <Button key={tone} variant={variant} tone={tone}>
                {`${variant}/${tone}`}
              </Button>
            ))}
          </Case>
        ))}
      </Group>

      <Group title="Baseline. Sizes">
        <Case label="plain label, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              {`size ${size}`}
            </Button>
          ))}
        </Case>
        <Case label="pre icon + label, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size} pre={<Icon name="download" />}>
              {`size ${size}`}
            </Button>
          ))}
        </Case>
        <Case label="iconOnly, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size} iconOnly aria-label={`Settings, ${size}`}>
              <Icon name="settings" />
            </Button>
          ))}
        </Case>
        <Case label="pre + label + post, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size} pre={<Icon name="upload" />} post={<Icon name="chevron-down" />}>
              {`size ${size}`}
            </Button>
          ))}
        </Case>
      </Group>

      <Group title="Content length">
        <Case label="Empty string children" fixed="React now logs a `renders nothing` error in dev and the vanilla enhancer throws. The paint is unchanged: this is an authoring bug, not a CSS one, so the two empty buttons below still look exactly like this.">
          <Button>{LABELS.empty}</Button>
          <Button variant="ghost">{LABELS.empty}</Button>
        </Case>
        <Case label="One word">
          <Button>{LABELS.word}</Button>
        </Case>
        <Case label="Typical content">
          <Button>{LABELS.typical}</Button>
        </Case>
        <Case label="Several sentences">
          <Button>{LABELS.sentences}</Button>
        </Case>
        <Case label="One unbreakable 52-character string">
          <Button>{LABELS.unbreakable}</Button>
        </Case>
        <Case label="Several sentences, inside a 320px container" fixed="contained. The label clips at the container edge instead of the button leaving it.">
          <div className="break-w-320">
            <Button>{LABELS.sentences}</Button>
          </div>
        </Case>
        <Case label="Unbreakable string, inside a 320px container" fixed="contained.">
          <div className="break-w-320">
            <Button>{LABELS.unbreakable}</Button>
          </div>
        </Case>
        <Case label="Long label with pre and post icons, 320px container" fixed="contained. The post chevron is clipped with the label rather than landing outside the column.">
          <div className="break-w-320">
            <Button pre={<Icon name="upload" />} post={<Icon name="chevron-down" />}>
              {LABELS.sentences}
            </Button>
          </div>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="Emoji alone">
          <Button>{LABELS.emojiAlone}</Button>
          <Button size="xs">{LABELS.emojiAlone}</Button>
          <Button size="lg">{LABELS.emojiAlone}</Button>
        </Case>
        <Case label="Emoji mixed into text">
          <Button>{LABELS.emojiMixed}</Button>
          <Button pre={<Icon name="download" />}>{LABELS.emojiMixed}</Button>
        </Case>
        <Case label="RTL text, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Button pre={<Icon name="download" />} post={<Icon name="chevron-right" />}>
              {LABELS.rtl}
            </Button>
            <Button variant="soft" tone="danger">
              {LABELS.rtl}
            </Button>
          </div>
        </Case>
        <Case label="Mixed-direction text (LTR product name inside an RTL label)">
          <div dir="rtl" className="break-rtl">
            <Button pre={<Icon name="upload" />}>{LABELS.mixed}</Button>
          </div>
        </Case>
        <Case label="Stacked diacritics and tall scripts" broke="at size xs the Devanagari matra and the Vietnamese tone marks cross the top border; sm clears it by about a pixel.">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              {LABELS.diacritics}
            </Button>
          ))}
        </Case>
      </Group>

      <Group title="Container">
        <Case label="320px container, two buttons in a row">
          <div className="break-w-320 break-row">
            <Button variant="ghost">Cancel</Button>
            <Button tone="accent">Save changes</Button>
          </div>
        </Case>
        <Case
          label="Squeezed by a flex sibling"
          note="The paragraph takes flex:1; the button is a plain flex item with no flex-shrink of its own."
        >
          <div className="break-w-320 break-squeeze">
            <p className="break-squeeze__text">
              Your workspace still has four unresolved invitations waiting on somebody.
            </p>
            <Button tone="accent">Review invitations</Button>
          </div>
        </Case>
        <Case label="Stretch column (align-items default, 320px grid cell)">
          <div className="break-w-320 break-stretch">
            <Button tone="accent">Save changes</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Case>
        <Case label="Very wide container (1100px), single button">
          <div className="break-w-1100">
            <Button tone="accent">Save changes</Button>
          </div>
        </Case>
        <Case label="Very wide container (1100px), stretch column">
          <div className="break-w-1100 break-stretch">
            <Button tone="accent">Save changes</Button>
          </div>
        </Case>
      </Group>

      <Group title="State">
        <Case label="disabled, every variant (neutral)">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {`${variant} disabled`}
            </Button>
          ))}
        </Case>
        <Case
          label="disabled, every variant (accent)"
          fixed="all four now paint the disabled tokens."
        >
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} tone="accent" disabled>
              {`${variant} disabled`}
            </Button>
          ))}
        </Case>
        <Case
          label="disabled, every variant (danger)"
          fixed="all four now paint the disabled tokens."
        >
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} tone="danger" disabled>
              {`${variant} disabled`}
            </Button>
          ))}
        </Case>
        <Case
          label="disabled beside enabled, solid danger"
          fixed="the two are now clearly different."
        >
          <div className="break-row">
            <Button tone="danger">Delete project</Button>
            <Button tone="danger" disabled>
              Delete project
            </Button>
          </div>
        </Case>
        <Case label="pressed=true, every variant × tone">
          {VARIANTS.map((variant) => (
            <div key={variant} className="break-row">
              {TONES.map((tone) => (
                <Button key={tone} variant={variant} tone={tone} pressed>
                  {`${variant}/${tone} on`}
                </Button>
              ))}
            </div>
          ))}
        </Case>
        <Case label="pressed=false beside pressed=true (same variant × tone)">
          {TONES.map((tone) => (
            <div key={tone} className="break-row">
              <Button tone={tone} pressed={false}>{`${tone} off`}</Button>
              <Button tone={tone} pressed>{`${tone} on`}</Button>
              <Button variant="ghost" tone={tone} pressed={false}>{`ghost ${tone} off`}</Button>
              <Button variant="ghost" tone={tone} pressed>{`ghost ${tone} on`}</Button>
            </div>
          ))}
        </Case>
        <Case label="Welded pair (weldEnd + weldStart), every variant">
          {VARIANTS.map((variant) => (
            <div key={variant} className="break-weld" data-press-scale-note={variant}>
              <Button variant={variant} weldEnd>
                {`${variant} primary`}
              </Button>
              <Button variant={variant} weldStart iconOnly aria-label={`More ${variant} options`}>
                <Icon name="chevron-down" />
              </Button>
            </div>
          ))}
        </Case>
        <Case label="href anchor (Button.navigation), every variant">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} href="/components/button" post={<Icon name="external-link" />}>
              {`${variant} link`}
            </Button>
          ))}
        </Case>
        <Case label="Long label, disabled + pressed, 320px container" fixed="contained. This was the grid-column case that `max-inline-size` alone could not reach; `min-inline-size: 0` is what closed it.">
          <div className="break-w-320 break-stretch">
            <Button disabled>{LABELS.sentences}</Button>
            <Button pressed>{LABELS.unbreakable}</Button>
          </div>
        </Case>
      </Group>
    </IconSetProvider>
  );
}
