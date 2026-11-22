"use client";

import { useState } from "react";
import {
  DecimalInput,
  parseDecimal,
  type DecimalResult,
  type DecimalRestrictions,
} from "@/lib/components/decimal-input/decimal-input";

function message(result: DecimalResult) {
  if (result.status === "empty")
    return "Sin valor: el campo vacío no equivale a cero.";
  if (result.status === "incomplete")
    return "Edición incompleta: termina el número.";
  if (result.status === "valid") return `Decimal exacto: ${result.decimal}`;
  return {
    format: "Usa un número sin espacios ni separadores de miles.",
    precision: "Escribe como máximo dos decimales.",
    negative: "Este ejemplo no admite signo negativo.",
    min: "El valor está por debajo del mínimo.",
    max: "El valor supera el máximo.",
  }[result.reason];
}

function Editable({
  label,
  initial,
  adornment,
  help,
  ...restrictions
}: DecimalRestrictions & {
  label: string;
  initial: string;
  adornment?: "€" | "%";
  help: string;
}) {
  const [raw, setRaw] = useState(initial);
  const parsed = parseDecimal(raw, restrictions);
  const error = parsed.status === "invalid" ? message(parsed) : undefined;
  return (
    <div className="min-w-0 space-y-3">
      <DecimalInput
        label={label}
        value={raw}
        onValueChange={setRaw}
        adornment={adornment}
        help={help}
        error={error}
        {...restrictions}
      />
      <p
        role="status"
        className="break-words text-sm leading-6 text-on-surface-variant"
      >
        {error ? "Valor inválido; se conserva el texto." : message(parsed)}
      </p>
      <p className="break-all font-mono text-xs text-on-surface-variant">
        raw: {JSON.stringify(raw)} · status: {parsed.status}
      </p>
    </div>
  );
}

export function DecimalInputSpecimen() {
  return (
    <div className="space-y-8">
      <div className="grid min-w-0 gap-6 rounded-xl bg-surface-container-low p-4 sm:grid-cols-2 sm:p-6">
        <Editable
          label="Importe (€)"
          initial="-12,50"
          adornment="€"
          help="Admite negativos y cero. Prueba -, 0, 12, o 12,345."
        />
        <Editable
          label="Porcentaje (%)"
          initial="20,00"
          adornment="%"
          allowNegative={false}
          min="0"
          max="100"
          help="Límites de este ejemplo: de 0 a 100, ambos incluidos."
        />
        <Editable
          label="Decimal sin adorno"
          initial="0"
          help="También acepta punto: 0.25. No admite notación exponencial ni miles."
        />
        <Editable
          label="Límites personalizados"
          initial="10,001"
          min="-25.50"
          max="25.50"
          help="De -25,50 a 25,50. Corrige el tercer decimal para retirar el error."
        />
      </div>
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">
        <DecimalInput
          label="Importe deshabilitado (€)"
          value="0,00"
          onValueChange={() => {}}
          adornment="€"
          disabled
        />
        <DecimalInput
          label="Porcentaje de solo lectura (%)"
          value="15,00"
          onValueChange={() => {}}
          adornment="%"
          readOnly
        />
      </div>
      <div className="space-y-3 text-sm leading-6 text-on-surface-variant">
        <p>
          Contrato: value es siempre el texto sin modificar. onValueChange(raw,
          parsed) entrega ese texto y un resultado con status: empty,
          incomplete, invalid o valid. Solo valid incluye decimal, una cadena
          exacta con punto, sin separadores de miles ni signo +. Conserva los
          decimales escritos y el cero negativo.
        </p>
        <p>
          Ejemplos: vacío → empty; - o 12, → incomplete; 0 → valid con decimal
          &quot;0&quot;; -0,00 → valid con decimal &quot;-0.00&quot;; ,5 → valid
          con decimal &quot;0.5&quot;; 1,234 → invalid con reason precision. No
          convierte, recorta ni redondea el texto al perder el foco.
        </p>
        <p>
          allowNegative vale true por defecto. min y max son cadenas decimales
          exactas con punto y hasta dos decimales; son inclusivos. Una
          configuración mal formada o min mayor que max produce un error de
          programación. adornment admite € o %; incluye la unidad en label para
          que sea accesible.
        </p>
        <p>
          La página consumidora usa parseDecimal(value, restricciones) al
          validar o al cambiar los límites, decide cuándo mostrar error y
          comprueba required al guardar. El estado intermedio no es un valor
          guardable. Se mantienen los atributos nativos de texto, ref y eventos
          de foco; no hay cálculos financieros ni conversión a Number.
        </p>
      </div>
    </div>
  );
}
