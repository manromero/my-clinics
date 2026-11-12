import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { DateInput } from "@/lib/components/date-input/date-input";
import { DecimalInput } from "@/lib/components/decimal-input/decimal-input";
import { FormPanel } from "@/lib/components/form-panel/form-panel";
import { SegmentedControl } from "@/lib/components/segmented-control/segmented-control";
import { Select } from "@/lib/components/select/select";
import { Surface } from "@/lib/components/surface/surface";
import { TextInput } from "@/lib/components/text-input/text-input";
import {
  activityAmountInput,
  activityEarnings,
  defaultIrpfBasisPoints,
  isActivityDate,
  newActivityDate,
  parseActivityAmount,
} from "../_lib/activity-entry";
import { formatActivityRate, formatEuroCents } from "../_lib/activity-format";
import {
  activityMonthKey,
  activityMonthName,
  type ActivityClinicOption,
  type ActivityRow,
  type ActivityScope,
} from "../_lib/activity-view";

const modeOptions = [
  { value: "percentage", label: "Porcentaje" },
  { value: "direct", label: "Importe directo" },
];

const amountError = "Introduce un importe con un máximo de dos decimales.";

export function ActivityForm({
  row,
  scope,
  clinics,
  lastEntered,
  pending,
  error,
  onSave,
  onCancel,
}: {
  row?: ActivityRow;
  scope: ActivityScope;
  clinics: readonly ActivityClinicOption[];
  lastEntered?: ActivityRow["date"];
  pending: boolean;
  error?: string;
  onSave: (entry: Omit<ActivityRow, "id">) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(
    () => row?.date ?? newActivityDate(scope, lastEntered),
  );
  const [clinicId, setClinicId] = useState(
    () =>
      row?.clinicId ??
      clinics.find(({ id, active }) => active && id === scope.clinicId)?.id ??
      "",
  );
  const [description, setDescription] = useState(row?.description ?? "");
  const [price, setPrice] = useState(
    row ? activityAmountInput(row.priceCents) : "",
  );
  const [mode, setMode] = useState(row?.calculationMode ?? "percentage");
  const [direct, setDirect] = useState(
    row?.calculationMode === "direct"
      ? activityAmountInput(row.grossCents)
      : "",
  );
  const [submissions, setSubmissions] = useState(0);
  const focusError = useRef<HTMLElement | null>(null);
  const dateInput = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    focusError.current?.focus();
    focusError.current = null;
  }, [submissions]);

  useLayoutEffect(() => {
    if (error) dateInput.current?.form?.scrollIntoView({ block: "start" });
  }, [error]);

  const availableClinics = clinics.filter(
    ({ active, id }) => active || id === row?.clinicId,
  );
  const clinic = availableClinics.find(({ id }) => id === clinicId);
  const percentage =
    row && row.clinicId === clinicId
      ? row.appliedPercentageBasisPoints
      : clinic?.percentageBasisPoints;
  const irpf = row?.appliedIrpfBasisPoints ?? defaultIrpfBasisPoints;
  const priceCents = parseActivityAmount(price);
  const directCents = mode === "direct" ? parseActivityAmount(direct) : null;
  const month = activityMonthKey(scope);
  const monthLabel = `${activityMonthName(scope.month)} de ${scope.year}`;
  const validDate = isActivityDate(date) ? date : null;
  const dateError = !validDate
    ? "Introduce una fecha válida."
    : !row && !date.startsWith(`${month}-`)
      ? `Selecciona una fecha de ${monthLabel}.`
      : undefined;
  const clinicError = clinic ? undefined : "Selecciona una clínica.";
  const priceError = priceCents === null ? amountError : undefined;
  const directError =
    mode === "direct" && directCents === null ? amountError : undefined;
  const earnings =
    priceCents !== null && percentage !== undefined && !directError
      ? activityEarnings(priceCents, directCents, percentage, irpf)
      : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    if (dateError || clinicError || priceError || directError) {
      const field = dateError
        ? "date"
        : clinicError
          ? "clinic"
          : priceError
            ? "price"
            : "direct";
      focusError.current = event.currentTarget.elements.namedItem(
        field,
      ) as HTMLElement;
      setSubmissions((current) => current + 1);
      return;
    }
    if (
      !validDate ||
      priceCents === null ||
      percentage === undefined ||
      !earnings
    )
      return;

    onSave({
      date: validDate,
      clinicId,
      description: description.trim() || null,
      calculationMode: mode,
      appliedPercentageBasisPoints: percentage,
      appliedIrpfBasisPoints: irpf,
      priceCents,
      ...earnings,
    });
  }

  const preview = [
    {
      label: "Porcentaje aplicado",
      value: percentage === undefined ? "—" : formatActivityRate(percentage),
    },
    { label: "IRPF aplicado", value: formatActivityRate(irpf) },
    {
      label: "Ganancia bruta",
      value: earnings ? formatEuroCents(earnings.grossCents) : "—",
    },
    {
      label: "Ganancia tras IRPF",
      value: earnings ? formatEuroCents(earnings.netCents) : "—",
    },
  ];

  return (
    <FormPanel
      presentation="modal"
      open
      title={row ? "Editar actividad" : "Nueva actividad"}
      initialFocusRef={dateInput}
      noValidate
      onSubmit={submit}
      onCancel={onCancel}
      pending={pending}
      error={error}
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <DateInput
            ref={dateInput}
            name="date"
            label="Fecha"
            value={date}
            help={row ? undefined : `Periodo: ${monthLabel}`}
            error={submissions ? dateError : undefined}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <Select
            name="clinic"
            label="Clínica"
            value={clinicId}
            placeholder="Selecciona una clínica"
            options={availableClinics.map(({ id, name, active }) => ({
              value: id,
              label: active ? name : `${name} (inactiva)`,
            }))}
            onChange={(event) => setClinicId(event.target.value)}
            error={submissions ? clinicError : undefined}
            required
          />
        </div>
        <TextInput
          name="description"
          label="Concepto"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <SegmentedControl
          label="Modo de cálculo"
          options={modeOptions}
          value={mode}
          onValueChange={(next) =>
            setMode(next === "direct" ? "direct" : "percentage")
          }
        />
        <div
          className={`grid items-end gap-3 sm:grid-cols-2 sm:gap-4 ${mode === "direct" ? "grid-cols-2" : ""}`}
        >
          <DecimalInput
            name="price"
            label="Importe"
            value={price}
            onValueChange={setPrice}
            adornment="€"
            error={submissions ? priceError : undefined}
            required
          />
          {mode === "direct" && (
            <DecimalInput
              name="direct"
              label="Ganancia directa"
              value={direct}
              onValueChange={setDirect}
              adornment="€"
              error={submissions ? directError : undefined}
              required
            />
          )}
        </div>
        <Surface
          as="section"
          variant="tonal"
          aria-label="Previsión de ganancias"
          className="p-4!"
        >
          <h3 className="font-label text-label font-semibold">
            Previsión de ganancias
          </h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:grid-cols-4">
            {(mode === "percentage" ? preview : preview.slice(1)).map(
              ({ label, value }) => (
                <div key={label}>
                  <dt className="text-caption leading-snug text-on-surface-variant">
                    {label}
                  </dt>
                  <dd className="font-semibold text-primary tabular-nums">
                    {value}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </Surface>
      </div>
    </FormPanel>
  );
}
