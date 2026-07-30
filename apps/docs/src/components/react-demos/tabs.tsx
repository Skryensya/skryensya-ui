/*
 * Live React demo for the authored advanced Tabs stage. Basic and states are tree-driven; advanced
 * stays an island because a live-region status line driven by React state is the point of the demo.
 */
import { useState } from "react";
import { Icon } from "@skryensya/react/icon";
import { Tabs } from "@skryensya/react/tabs";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const sectionNames: Record<string, string> = {
  general: "General",
  access: "Acceso",
  notifications: "Avisos",
};

const workspaceItems = [
  {
    value: "general",
    label: (
      <>
        <Icon name="settings" size="sm" />
        General
      </>
    ),
    children: "Atlas · Europe/Madrid · Spanish",
  },
  {
    value: "access",
    label: (
      <>
        <Icon name="user" size="sm" />
        Acceso
      </>
    ),
    children: "8 miembros · 2 administradores",
  },
  {
    value: "notifications",
    label: (
      <>
        <Icon name="info" size="sm" />
        Avisos
      </>
    ),
    children: "Mail and chat for deployments and incidents.",
  },
];

export const TabsAdvancedDemo = framed(function TabsAdvancedDemo() {
  const [value, setValue] = useState("general");

  return (
    <div className="sk-stack" data-gap="sm">
      <Tabs
        value={value}
        orientation="vertical"
        activationMode="manual"
        items={workspaceItems}
        onValueChange={(details) => setValue(details.value)}
      />
      <p aria-live="polite">Active section: {sectionNames[value]}</p>
    </div>
  );
});
