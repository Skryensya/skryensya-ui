/*
 * Live React demos for /components/switch.
 */
import { TileSwitch } from "@skryensya/react/tile-switch";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const preferences = [
  {
    value: "auto-deploy",
    title: "Auto-deploy",
    description: "Publish every push to main without manual approval.",
  },
  {
    value: "preview-comments",
    title: "Preview comments",
    description: "Post a preview link on every pull request.",
  },
];

export const TileSwitchDemo = framed(function TileSwitchDemo() {
  return (
    <div className="sk-inline" style={{ alignItems: "stretch" }}>
      {preferences.map((preference, index) => (
        <TileSwitch
          key={preference.value}
          name="preferences"
          value={preference.value}
          defaultChecked={index === 0}
          onCheck={() => {}}
          style={{ flex: 1 }}
        >
          <span className="sk-tile__title">{preference.title}</span>
          <span className="sk-tile__description">{preference.description}</span>
        </TileSwitch>
      ))}
    </div>
  );
});
