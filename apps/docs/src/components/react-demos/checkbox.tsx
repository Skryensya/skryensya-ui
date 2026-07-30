/*
 * Live React demos that still need authored derived state or tile composition.
 */
import { useState } from "react";
import { Checkbox } from "@skryensya/react/checkbox";
import { TileCheckbox } from "@skryensya/react/tile-checkbox";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const PERMISOS = [
  { value: "read", label: "Leer" },
  { value: "write", label: "Escribir" },
  { value: "admin", label: "Administrar" },
];

export const CheckboxGroupDemo = framed(function CheckboxGroupDemo() {
  const [marcados, setMarcados] = useState<string[]>(["read"]);

  const todos = marcados.length === PERMISOS.length;
  const estado = todos ? true : marcados.length > 0 ? "indeterminate" : false;

  return (
    <div className="sk-stack" data-gap="sm">
      <Checkbox
        checked={estado}
        onCheckedChange={({ checked }) =>
          setMarcados(checked === true ? PERMISOS.map((p) => p.value) : [])
        }
      >
        Repository permissions
      </Checkbox>

      <div
        className="sk-stack"
        data-gap="xs"
        role="group"
        aria-label="Repository permissions"
        style={{
          paddingInlineStart:
            "calc(var(--size-icon-md) + var(--space-inline-sm))",
        }}
      >
        {PERMISOS.map((permiso) => (
          <Checkbox
            key={permiso.value}
            checked={marcados.includes(permiso.value)}
            name="permisos"
            value={permiso.value}
            onCheckedChange={({ checked }) =>
              setMarcados((previos) =>
                checked === true
                  ? [...previos, permiso.value]
                  : previos.filter((valor) => valor !== permiso.value),
              )
            }
          >
            {permiso.label}
          </Checkbox>
        ))}
      </div>
    </div>
  );
});

const ALERTAS = [
  {
    value: "email",
    title: "Email alerts",
    description: "Send deployment failures to the team.",
  },
  {
    value: "push",
    title: "Push notifications",
    description: "Notify urgent incidents on mobile.",
  },
  {
    value: "digest",
    title: "Weekly summary",
    description: "Receive activity and metrics every Friday.",
  },
];

export const TileCheckboxDemo = framed(function TileCheckboxDemo() {
  return (
    <div className="sk-inline" style={{ alignItems: "stretch" }}>
      {ALERTAS.map((alerta, index) => (
        <TileCheckbox
          key={alerta.value}
          name="alerts"
          value={alerta.value}
          defaultChecked={index === 0}
          onCheck={() => {}}
          style={{ flex: 1 }}
        >
          <span className="sk-tile__title">{alerta.title}</span>
          <span className="sk-tile__description">{alerta.description}</span>
        </TileCheckbox>
      ))}
    </div>
  );
});
