/*
 * Diagnostic only, for /debug/box-break. Renders the REAL `@skryensya/react` Box once per stress
 * scenario. The page around it adds labels and fixed-width containers and nothing else: no fonts,
 * no token overrides, no simulated themes. A Box observed under any of those is a different Box.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Box } from "@skryensya/react/layout";
import type { ReactNode } from "react";

const SURFACES = ["none", "sunken", "surface", "raised"] as const;
const BORDERS = ["none", "subtle", "default"] as const;
const PADDINGS = ["none", "xs", "sm", "md", "lg", "xl"] as const;

const LABELS = {
  empty: "",
  word: "Save",
  typical: "Your changes are saved automatically.",
  sentences:
    "Your workspace has four unresolved invitations waiting on somebody. Review them before the trial ends, or new members will not be able to join.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
};

function Case({
  label,
  note,
  broke,
  children,
}: {
  label: string;
  note?: string;
  /** What visibly broke in this scenario, written after the look. The page reads as the report. */
  broke?: string;
  children: ReactNode;
}) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      {note ? <p className="break-case__note">{note}</p> : null}
      {broke ? <p className="break-case__broke">BROKE. {broke}</p> : null}
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

export function BoxBreak() {
  return (
    <>
      <Group title="Baseline. Surface × border, padding md">
        {SURFACES.map((surface) => (
          <Case key={surface} label={`surface="${surface}", border none / subtle / default`}>
            <div className="break-row">
              {BORDERS.map((border) => (
                <Box key={border} surface={surface} border={border} padding="md">
                  {`${surface}/${border}`}
                </Box>
              ))}
            </div>
          </Case>
        ))}
      </Group>

      <Group title="Baseline. Padding scale">
        <Case label='padding none → xl, surface="surface" border="subtle"'>
          <div className="break-row">
            {PADDINGS.map((padding) => (
              <Box key={padding} surface="surface" border="subtle" padding={padding}>
                {`padding ${padding}`}
              </Box>
            ))}
          </div>
        </Case>
      </Group>

      <Group title="Content length. surface=raised border=default padding=md, 220px container">
        <Case label="No children at all">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md" />
          </div>
        </Case>
        <Case label="Empty string child">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.empty}
            </Box>
          </div>
        </Case>
        <Case label="One word">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.word}
            </Box>
          </div>
        </Case>
        <Case label="Typical content">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.typical}
            </Box>
          </div>
        </Case>
        <Case label="Several sentences">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.sentences}
            </Box>
          </div>
        </Case>
        <Case label="One unbreakable 52-character string">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.unbreakable}
            </Box>
          </div>
        </Case>
      </Group>

      <Group title="Container. Typical content, surface=raised border=default padding=md">
        <Case label="320px container">
          <div className="break-w-320">
            <Box surface="raised" border="default" padding="md">
              {LABELS.typical}
            </Box>
          </div>
        </Case>
        <Case
          label="Squeezed by a flex sibling"
          note="The paragraph takes flex:1; the Box is a plain flex item with no flex-shrink of its own."
        >
          <div className="break-w-320 break-squeeze">
            <p className="break-squeeze__text">
              Your workspace still has four unresolved invitations waiting on somebody.
            </p>
            <Box surface="raised" border="default" padding="md">
              {LABELS.word}
            </Box>
          </div>
        </Case>
        <Case label="Very wide container (1100px)">
          <div className="break-w-1100">
            <Box surface="raised" border="default" padding="md">
              {LABELS.typical}
            </Box>
          </div>
        </Case>
      </Group>
    </>
  );
}
