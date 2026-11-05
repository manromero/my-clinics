"use client";

import { useState } from "react";
import { UserIdentity } from "@/lib/components/user-identity/user-identity";

const avatar =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#094cb2"/><circle cx="32" cy="23" r="11" fill="#fff"/><path d="M10 60a22 22 0 0 1 44 0" fill="#fff"/></svg>',
  );
const longName = "María del Carmen Fernández de la Vega";
const longEmail = "maria.del.carmen.fernandez.de.la.vega@consulta.example.test";

export function UserIdentitySpecimen() {
  const [compact, setCompact] = useState(false);
  const [email, setEmail] = useState(true);
  const [timezone, setTimezone] = useState(true);
  const [long, setLong] = useState(false);
  const [image, setImage] = useState<"none" | "available" | "broken">("none");
  return (
    <div className="space-y-8">
      <div className="space-y-5 rounded-xl bg-surface-container-low p-5">
        <p className="font-label text-caption text-on-surface-variant">
          Completa · avatar disponible
        </p>
        <UserIdentity
          displayName="Lucía Navarro"
          email="lucia@consulta.example.test"
          timezone="Europe/Madrid"
          avatarSrc={avatar}
        />
        <p className="font-label text-caption text-on-surface-variant">
          Compacta · iniciales sin imagen
        </p>
        <UserIdentity
          displayName="Lucía Navarro"
          email="lucia@consulta.example.test"
          timezone="Europe/Madrid"
          variant="compact"
        />
      </div>
      <fieldset className="space-y-4">
        <legend className="mb-4 font-label text-label font-semibold">
          Configurar ejemplo
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: "Compacta", checked: compact, set: setCompact },
            { label: "Correo", checked: email, set: setEmail },
            { label: "Zona horaria", checked: timezone, set: setTimezone },
            { label: "Datos largos", checked: long, set: setLong },
          ].map(({ label, checked, set }) => (
            <label
              key={label}
              className="flex min-h-11 items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => set(event.target.checked)}
                className="size-4 accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
        <label className="block space-y-2 text-sm">
          <span className="block font-label font-medium">Avatar</span>
          <select
            value={image}
            onChange={(event) => setImage(event.target.value as typeof image)}
            className="min-h-11 max-w-full rounded-md bg-surface-container-low px-3 py-2"
          >
            <option value="none">Sin imagen</option>
            <option value="available">Imagen disponible</option>
            <option value="broken">Imagen fallida</option>
          </select>
        </label>
        <div
          id="identity-preview"
          className="rounded-xl bg-surface-container-low p-5"
        >
          <UserIdentity
            displayName={long ? longName : "Lucía Navarro"}
            email={
              email
                ? long
                  ? longEmail
                  : "lucia@consulta.example.test"
                : undefined
            }
            timezone={timezone ? "Europe/Madrid" : undefined}
            avatarSrc={
              image === "available"
                ? avatar
                : image === "broken"
                  ? "data:image/png;base64,invalid"
                  : undefined
            }
            variant={compact ? "compact" : "full"}
          />
        </div>
      </fieldset>
      <div className="space-y-3">
        <p className="font-label text-caption text-on-surface-variant">
          Datos largos · sin correo ni zona horaria
        </p>
        <UserIdentity displayName={longName} />
        <p className="font-label text-caption text-on-surface-variant">
          Nombre y correo completos · ajuste en espacios estrechos
        </p>
        <UserIdentity displayName={longName} email={longEmail} />
      </div>
      <p className="text-sm leading-6 text-on-surface-variant">
        API: displayName es obligatorio; email, avatarSrc y timezone son
        opcionales. variant acepta full (por defecto) o compact (solo avatar
        visible; nombre y metadatos accesibles). La imagen es decorativa y se
        sirve sin optimización; si falta o falla, se muestran las iniciales del
        primer y último término del nombre. Los valores vacíos opcionales se
        omiten. Un nombre vacío se presenta como Usuario.
      </p>
      <p className="text-sm leading-6 text-on-surface-variant">
        Usa Tab y Espacio para cambiar los controles del ejemplo. La identidad
        presenta información y no añade paradas de teclado. Los datos son
        ficticios.
      </p>
    </div>
  );
}
