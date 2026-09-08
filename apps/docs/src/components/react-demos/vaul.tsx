import { useState } from "react";
import { Button } from "@skryensya/react/button";
import { CheckboxGroup, RadioGroup } from "@skryensya/react/selection";
import { Vaul } from "@skryensya/react/vaul";
import { framedIn } from "./framed";

const framed = framedIn("vaul");

type VaulShareDemoProps = {
  openLabel: string;
  title: string;
  meta: string;
  closeLabel: string;
  shareToggle: string;
  peopleLabel: string;
  owner: string;
  canEdit: string;
  canComment: string;
  readOnly: string;
  designTeam: string;
  designTeamMeta: string;
  cancel: string;
  share: string;
};

export const VaulShareDemo = framed(function VaulShareDemo({
  openLabel,
  title,
  meta,
  closeLabel,
  shareToggle,
  peopleLabel,
  owner,
  canEdit,
  canComment,
  readOnly,
  designTeam,
  designTeamMeta,
  cancel,
  share,
}: VaulShareDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{openLabel}</Button>
      <Vaul open={open} className="demo-vaul" edge="block-end" label={title}>
        <header className="demo-vaul__header">
          <span className="demo-vaul__heading">
            <h2 className="demo-vaul__title" id="demo-vaul-react-title" data-flush>
              {title}
            </h2>
            <span className="demo-vaul__meta">{meta}</span>
          </span>
          <Button aria-label={closeLabel} iconOnly onClick={() => setOpen(false)} variant="ghost">
            ×
          </Button>
        </header>

        <label className="sk-switch demo-vaul__link">
          <input className="sk-switch__input" type="checkbox" role="switch" defaultChecked />
          <span className="sk-switch__control" aria-hidden="true">
            <span className="sk-switch__thumb" />
          </span>
          <span className="sk-switch__label">{shareToggle}</span>
        </label>

        <ul className="sk-list demo-vaul__people" data-density="compact" aria-label={peopleLabel}>
          {[
            ["AK", "Ada Kovač", "ada@estudio.cl", owner],
            ["RM", "Renzo Molina", "renzo@estudio.cl", canEdit],
            ["NS", "Nadia Sepúlveda", "nadia@estudio.cl", canComment],
            ["+6", designTeam, designTeamMeta, readOnly],
          ].map(([initials, name, email, access]) => (
            <li className="sk-list__item" key={email}>
              <span className="sk-list__leading">
                <span className="sk-avatar" data-size="sm" aria-hidden="true">
                  <span className="sk-avatar__fallback">{initials}</span>
                </span>
              </span>
              <span className="sk-list__content">
                <span className="sk-list__title">{name}</span>
                <span className="sk-list__description">{email}</span>
              </span>
              <span className="sk-list__trailing">{access}</span>
            </li>
          ))}
        </ul>

        <footer className="demo-vaul__actions">
          <Button onClick={() => setOpen(false)} variant="ghost">
            {cancel}
          </Button>
          <Button onClick={() => setOpen(false)}>{share}</Button>
        </footer>
      </Vaul>
    </>
  );
}, { minHeight: "760px", scroll: true });

/** POCO CONTENIDO: one line and two buttons, the floor every Vaul still has to hold up. */
type VaulDeleteDemoProps = {
  openLabel: string;
  title: string;
  desc: string;
  cancel: string;
  confirm: string;
};

export const VaulDeleteDemo = framed(function VaulDeleteDemo({
  openLabel,
  title,
  desc,
  cancel,
  confirm,
}: VaulDeleteDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{openLabel}</Button>
      <Vaul open={open} className="demo-vaul-delete" edge="block-end" label={title}>
        <div className="demo-vaul-delete__body">
          <h2 className="demo-vaul-delete__title" data-flush>
            {title}
          </h2>
          <p className="demo-vaul-delete__desc">{desc}</p>
        </div>
        <footer className="demo-vaul-delete__actions">
          <Button onClick={() => setOpen(false)} variant="ghost">
            {cancel}
          </Button>
          <Button onClick={() => setOpen(false)} tone="danger">
            {confirm}
          </Button>
        </footer>
      </Vaul>
    </>
  );
}, { minHeight: "760px", scroll: true });

/** MÁS CONTENIDO: three grouped sections tall enough to need the sheet's own internal scroll. */
type FilterItem = { value: string; label: string };

type VaulFiltersDemoProps = {
  openLabel: string;
  title: string;
  closeLabel: string;
  sortLabel: string;
  sortOptions: FilterItem[];
  categoryLabel: string;
  categoryOptions: FilterItem[];
  availabilityLabel: string;
  availabilityOptions: FilterItem[];
  clear: string;
  apply: string;
};

export const VaulFiltersDemo = framed(function VaulFiltersDemo({
  openLabel,
  title,
  closeLabel,
  sortLabel,
  sortOptions,
  categoryLabel,
  categoryOptions,
  availabilityLabel,
  availabilityOptions,
  clear,
  apply,
}: VaulFiltersDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{openLabel}</Button>
      <Vaul open={open} className="demo-vaul-filters" edge="block-end" label={title}>
        <header className="demo-vaul-filters__header">
          <h2 className="demo-vaul-filters__title" data-flush>
            {title}
          </h2>
          <Button aria-label={closeLabel} iconOnly onClick={() => setOpen(false)} variant="ghost">
            ×
          </Button>
        </header>

        <div className="demo-vaul-filters__body">
          <section className="demo-vaul-filters__section">
            <RadioGroup
              aria-label={sortLabel}
              defaultValue={sortOptions[0]?.value ?? null}
              items={sortOptions}
              name="sort"
            />
          </section>
          <section className="demo-vaul-filters__section">
            <CheckboxGroup
              defaultValue={categoryOptions.slice(0, 2).map((item) => item.value)}
              items={categoryOptions}
              label={categoryLabel}
              name="category"
            />
          </section>
          <section className="demo-vaul-filters__section">
            <CheckboxGroup items={availabilityOptions} label={availabilityLabel} name="availability" />
          </section>
        </div>

        <footer className="demo-vaul-filters__actions">
          <Button onClick={() => setOpen(false)} variant="ghost">
            {clear}
          </Button>
          <Button onClick={() => setOpen(false)}>{apply}</Button>
        </footer>
      </Vaul>
    </>
  );
}, { minHeight: "760px", scroll: true });
