export type DecimalRestrictions = {
  allowNegative?: boolean;
  min?: string;
  max?: string;
};

export type DecimalResult =
  | { status: "empty" }
  | { status: "incomplete" }
  | {
      status: "invalid";
      reason: "format" | "precision" | "negative" | "min" | "max";
    }
  | { status: "valid"; decimal: string };

function scaled(decimal: string): bigint {
  const [integer, fraction = ""] = decimal.split(".");
  return BigInt(`${integer}${fraction.padEnd(2, "0")}`);
}

function bound(value: string | undefined): bigint | undefined {
  if (value === undefined) return undefined;
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new Error(
      "Decimal limits must be decimal strings with at most two places and a dot separator.",
    );
  }
  return scaled(value);
}

export function parseDecimal(
  raw: string,
  { allowNegative = true, min, max }: DecimalRestrictions = {},
): DecimalResult {
  const lower = bound(min);
  const upper = bound(max);
  if (lower !== undefined && upper !== undefined && lower > upper) {
    throw new Error("Decimal min must not exceed max.");
  }
  if (raw === "") return { status: "empty" };
  if (!/^[+-]?(?:\d*(?:[.,]\d*)?)$/.test(raw))
    return { status: "invalid", reason: "format" };
  if (!allowNegative && raw.startsWith("-"))
    return { status: "invalid", reason: "negative" };
  const unsigned = raw.replace(/^[+-]/, "");
  if (!/\d/.test(unsigned) || /[.,]$/.test(raw))
    return { status: "incomplete" };
  const [integer, fraction] = unsigned.split(/[.,]/);
  if (fraction !== undefined && fraction.length > 2)
    return { status: "invalid", reason: "precision" };
  const decimal = `${raw.startsWith("-") ? "-" : ""}${integer.replace(/^0+(?=\d)/, "") || "0"}${fraction === undefined ? "" : `.${fraction}`}`;
  const value = scaled(decimal);
  if (lower !== undefined && value < lower)
    return { status: "invalid", reason: "min" };
  if (upper !== undefined && value > upper)
    return { status: "invalid", reason: "max" };
  return { status: "valid", decimal };
}
