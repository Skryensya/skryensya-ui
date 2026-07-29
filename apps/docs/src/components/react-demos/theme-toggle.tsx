/*
 * Live React demo for /components/theme-toggle. IconSetProvider links the lucide icons the same
 * way the docs page links them for every other React demo.
 */
import { IconSetProvider } from "@skryensya/react/icon";
import { ThemeToggle } from "@skryensya/react/theme-toggle";
import { lucideIcons } from "@skryensya/icons-lucide";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const labels = {
  system: "Modo: sistema",
  light: "Mode: clear",
  dark: "Mode: dark",
};

export const ThemeToggleDemo = framed(function ThemeToggleDemo() {
  return (
    <IconSetProvider set={lucideIcons}>
      <div className="sk-inline" data-gap="md" data-align="center">
        <ThemeToggle labels={labels} />
        <ThemeToggle size="sm" labels={labels} />
      </div>
    </IconSetProvider>
  );
});
