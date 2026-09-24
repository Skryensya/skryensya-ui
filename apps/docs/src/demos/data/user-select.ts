/*
 * THE ROSTER BOTH USER SELECT DEMOS OFFER. One list, used by the React demo and by the Vanilla
 * markup builder, so the page cannot end up showing two different teams depending on which
 * binding is open.
 *
 * No `src`: same reasoning `demos/avatar.ts`'s own sample picks distinct hues over a repeated
 * default rather than reaching for a placeholder image service, and it keeps a docs page that
 * never fetches anything, network included. Each person's initials paint over their own swatch,
 * same as Avatar's own demo does with `--sk-avatar-bg`/`--sk-avatar-fg`.
 */
export type UserSelectDemoUser = {
  id: string;
  name: string;
  email: string;
  hue: string;
  disabled?: boolean;
};

export const userSelectRoster: readonly UserSelectDemoUser[] = [
  { id: "jane", name: "Jane Cooper", email: "jane@acme.dev", hue: "blue-600" },
  { id: "maria", name: "Maria Fuentes", email: "maria@acme.dev", hue: "violet-600" },
  { id: "marco", name: "Marco Rossi", email: "marco@acme.dev", hue: "teal-600" },
  { id: "john", name: "John Alder", email: "john@acme.dev", hue: "amber-600" },
  { id: "priya", name: "Priya Nair", email: "priya@acme.dev", hue: "rose-600" },
  { id: "alex", name: "Alex Kim", email: "alex@acme.dev", hue: "green-600", disabled: true },
];
