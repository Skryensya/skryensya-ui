import { Accordion } from "@skryensya/react/accordion";
import { TileChevron } from "@skryensya/react/tile";

export type LandingFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  label: string;
  items: readonly LandingFaqItem[];
};

/** Landing FAQ: Accordion island so it works on a page that opts out of vanilla auto-mount. */
export function LandingFaq({ label, items }: Props) {
  return (
    <Accordion type="single" collapsible aria-label={label} defaultValue={items[0]?.id}>
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Trigger>
            {item.question}
            <TileChevron />
          </Accordion.Trigger>
          <Accordion.Content>
            <p className="sk-text" data-tone="secondary">
              {item.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
