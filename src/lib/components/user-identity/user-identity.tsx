"use client";

import Image from "next/image";
import { useId, useState } from "react";

export type UserIdentityProps = {
  displayName: string;
  email?: string;
  avatarSrc?: string;
  timezone?: string;
  variant?: "full" | "compact" | "responsive";
};

export function UserIdentity({
  displayName,
  email,
  avatarSrc,
  timezone,
  variant = "full",
}: UserIdentityProps) {
  const id = useId();
  const [failedSrc, setFailedSrc] = useState<string>();
  const name = displayName.trim() || "Usuario";
  const emailText = email?.trim();
  const timezoneText = timezone?.trim();
  const source = avatarSrc?.trim();
  const initials = name
    .split(/\s+/u)
    .filter(Boolean)
    .map((part) => Array.from(part)[0]);
  const fallback = (
    initials.length > 1 ? initials[0] + initials.at(-1) : initials[0]
  ).toLocaleUpperCase("es");
  const descriptionIds =
    [emailText && `${id}-email`, timezoneText && `${id}-timezone`]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      role="group"
      aria-labelledby={`${id}-name`}
      aria-describedby={descriptionIds}
      className="inline-flex max-w-full min-w-0 items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-label text-caption font-semibold text-on-primary"
      >
        {source && source !== failedSrc ? (
          <Image
            src={source}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="size-8 object-cover"
            onError={() => setFailedSrc(source)}
          />
        ) : (
          fallback
        )}
      </span>
      <div
        className={
          variant === "compact"
            ? "sr-only"
            : variant === "responsive"
              ? "min-w-0 max-lg:sr-only"
              : "min-w-0"
        }
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            id={`${id}-name`}
            className="text-sm font-semibold text-on-surface [overflow-wrap:anywhere]"
          >
            {name}
          </span>
          {timezoneText && (
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label text-caption text-on-surface [overflow-wrap:anywhere]">
              <span
                id={`${id}-timezone`}
                className="sr-only"
              >{`Zona horaria: ${timezoneText}`}</span>
              <span aria-hidden="true">{timezoneText}</span>
            </span>
          )}
        </div>
        {emailText && (
          <span
            id={`${id}-email`}
            className="mt-1 block font-label text-caption text-on-surface-variant [overflow-wrap:anywhere]"
          >
            {emailText}
          </span>
        )}
      </div>
    </div>
  );
}
