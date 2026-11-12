"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ActionLink } from "../action-link/action-link";
import { Alert } from "../alert/alert";
import { Button } from "../button/button";
import { IconButton } from "../icon-button/icon-button";
import {
  UserIdentity,
  type UserIdentityProps,
} from "../user-identity/user-identity";

export type UserMenuProps = {
  identity: Omit<UserIdentityProps, "variant">;
  variant?: UserIdentityProps["variant"];
  accountLink?: { href: string; label: string };
  onSignOut?: () => void;
  signOutPending?: boolean;
  signOutError?: string;
};

export function UserMenu({
  identity,
  variant = "full",
  accountLink,
  onSignOut,
  signOutPending = false,
  signOutError,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const name = identity.displayName.trim() || "Usuario";

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target)
      ) {
        if (root.current?.contains(document.activeElement))
          trigger.current?.focus();
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <div
      ref={root}
      className="relative w-full max-w-sm min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <div className="flex min-w-0 items-center justify-end gap-2">
        <UserIdentity {...identity} variant={variant} />
        <IconButton
          ref={trigger}
          label={`Menú de cuenta de ${name}`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen(!open)}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={open ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
            </svg>
          }
        />
      </div>
      <section
        id={`${id}-panel`}
        aria-label={`Cuenta de ${name}`}
        hidden={!open}
        className="absolute inset-x-0 top-full z-20 mt-3 max-h-[65dvh] overflow-y-auto rounded-xl bg-surface-container-lowest/80 p-4 shadow-[0_12px_32px_rgb(26_27_32/0.06)] backdrop-blur-[20px]"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <h2 className="py-2 font-headline text-xl">Tu cuenta</h2>
          <IconButton
            label="Cerrar menú de cuenta"
            size="sm"
            onClick={close}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 6 12 12M6 18 18 6" />
              </svg>
            }
          />
        </div>
        <UserIdentity {...identity} />
        <div className="mt-5 flex flex-col items-stretch gap-3">
          {accountLink && (
            <ActionLink
              href={accountLink.href}
              variant="secondary"
              onClick={close}
            >
              {accountLink.label}
            </ActionLink>
          )}
          {onSignOut && (
            <Button
              variant="tertiary"
              className="text-error! aria-disabled:cursor-default aria-disabled:opacity-60"
              aria-disabled={signOutPending}
              aria-busy={signOutPending}
              onClick={() => {
                if (!signOutPending) onSignOut();
              }}
            >
              {signOutPending ? "Cerrando sesión…" : "Cerrar sesión"}
            </Button>
          )}
          {signOutPending && (
            <p role="status" className="text-sm text-on-surface-variant">
              Cierre de sesión en curso. Espera un momento.
            </p>
          )}
          {signOutError && !signOutPending && (
            <Alert
              title="No se ha cerrado la sesión"
              variant="error"
              announcement="assertive"
            >
              {signOutError}
            </Alert>
          )}
        </div>
      </section>
    </div>
  );
}
