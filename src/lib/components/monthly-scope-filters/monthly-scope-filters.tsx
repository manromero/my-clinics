"use client";

import Form from "next/form";
import { useContext, useLayoutEffect, useState } from "react";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { Button } from "@/lib/components/button/button";
import { FieldLabel } from "@/lib/components/field-label/field-label";
import { Select } from "@/lib/components/select/select";
import {
  monthName,
  monthlyPeriodParams,
  monthlyScopeParams,
  adjacentMonthlyPeriod,
  type MonthlyPeriod,
  type MonthlyScope,
} from "@/lib/monthly-scope/monthly-scope";
import { MonthlyScopeFocus } from "./monthly-scope-focus";

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: monthName(index + 1),
  value: String(index + 1).padStart(2, "0"),
}));

function AdjacentMonth({
  path,
  scope,
  direction,
  rememberFocus,
}: {
  path: string;
  scope: MonthlyScope;
  direction: -1 | 1;
  rememberFocus: (target: MonthlyPeriod) => void;
}) {
  const period = adjacentMonthlyPeriod(scope, direction);

  return (
    <ActionLink
      id={`${path.slice(1)}-${direction === -1 ? "previous" : "next"}-month`}
      href={`${path}?${monthlyScopeParams({ ...(period ?? scope), clinicId: scope.clinicId })}`}
      prefetch={false}
      scroll={false}
      aria-disabled={period === null || undefined}
      onClick={(event) => {
        if (period === null) event.preventDefault();
      }}
      onNavigate={() => {
        if (period !== null) rememberFocus(period);
      }}
      className="mb-px size-11 shrink-0 bg-surface-container-low hover:bg-surface-container-high aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-surface-container-low"
    >
      <span className="sr-only">
        {direction === -1 ? "Mes anterior" : "Mes siguiente"}
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={direction === -1 ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </ActionLink>
  );
}

export function MonthlyScopeFilters({
  path,
  label,
  scope,
  clinicOptions,
}: {
  path: "/activity" | "/summary";
  label: string;
  scope: MonthlyScope;
  clinicOptions: readonly { id: string; name: string; active: boolean }[];
}) {
  const prefix = path.slice(1);
  const formId = `${prefix}-filters`;
  const pendingFocusRef = useContext(MonthlyScopeFocus);
  const appliedScope = monthlyScopeParams(scope);
  const appliedFields = {
    ...monthlyPeriodParams(scope),
    clinic: scope.clinicId ?? "",
  };
  const [draft, setDraft] = useState({
    scope: appliedScope,
    fields: appliedFields,
  });

  // Synchronize the controls on navigation without replacing the focused element.
  if (draft.scope !== appliedScope) {
    setDraft({ scope: appliedScope, fields: appliedFields });
  }

  const { year, month, clinicId } = scope;
  useLayoutEffect(() => {
    const intent = pendingFocusRef?.current;
    if (!pendingFocusRef || !intent) return;
    pendingFocusRef.current = null;

    // A canonical redirect can temporarily remove the filter form from the page.
    if (
      intent.target.year === year &&
      intent.target.month === month &&
      !intent.control.isConnected &&
      document.activeElement === document.body
    ) {
      document
        .getElementById(intent.control.id)
        ?.focus({ preventScroll: true });
    }
  }, [pendingFocusRef, year, month, clinicId]);

  function rememberFocus(target: MonthlyPeriod) {
    if (!pendingFocusRef) return;
    const control = document.activeElement;
    pendingFocusRef.current =
      control instanceof HTMLElement &&
      control.id &&
      control.closest(`#${formId}`) &&
      control.matches(":focus-visible")
        ? { target, control }
        : null;
  }

  function updateField(name: keyof typeof appliedFields, value: string) {
    setDraft((current) => ({
      ...current,
      fields: { ...current.fields, [name]: value },
    }));
  }

  return (
    <Form
      id={formId}
      action={path}
      prefetch={false}
      aria-label={label}
      scroll={false}
      onSubmit={() => {
        rememberFocus({
          year: Number(draft.fields.year),
          month: Number(draft.fields.month),
        });
      }}
      className="flex flex-wrap items-end gap-x-4 gap-y-3"
    >
      <div className="flex w-full min-w-0 items-end gap-2 sm:w-auto">
        <AdjacentMonth
          path={path}
          scope={scope}
          direction={-1}
          rememberFocus={rememberFocus}
        />
        <div className="min-w-0 flex-1 sm:w-34">
          <Select
            id={`${prefix}-month`}
            name="month"
            label="Mes"
            className="capitalize"
            value={draft.fields.month}
            onChange={(event) => updateField("month", event.target.value)}
            options={monthOptions}
            showRequirement={false}
          />
        </div>
        <div className="w-16 shrink-0 space-y-2">
          <FieldLabel htmlFor={`${prefix}-year`} className="block">
            Año
          </FieldLabel>
          <input
            id={`${prefix}-year`}
            name="year"
            type="text"
            inputMode="numeric"
            value={draft.fields.year}
            onChange={(event) => updateField("year", event.target.value)}
            maxLength={4}
            pattern="(?!0000)[0-9]{4}"
            title="Introduce un año de cuatro cifras."
            required
            className="min-h-11 w-full rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-2.5 py-2 tabular-nums focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          />
        </div>
        <AdjacentMonth
          path={path}
          scope={scope}
          direction={1}
          rememberFocus={rememberFocus}
        />
      </div>
      <div className="flex min-w-0 flex-1 items-end gap-2 sm:flex-initial">
        <div className="min-w-0 flex-1 sm:w-44">
          <Select
            id={`${prefix}-clinic`}
            name="clinic"
            label="Clínica"
            value={draft.fields.clinic}
            onChange={(event) => updateField("clinic", event.target.value)}
            options={[
              { value: "", label: "Todas las clínicas" },
              ...clinicOptions.map(({ id, name, active }) => ({
                value: id,
                label: active ? name : `${name} (inactiva)`,
              })),
            ]}
            showRequirement={false}
          />
        </div>
        <Button
          id={`${prefix}-apply`}
          type="submit"
          size="sm"
          variant="secondary"
        >
          Aplicar
        </Button>
      </div>
    </Form>
  );
}
