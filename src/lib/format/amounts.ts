const euros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export const recordCount = new Intl.NumberFormat("es-ES");

export function formatEuroCents(cents: `${bigint}`) {
  const sign = cents.startsWith("-") ? "-" : "";
  const digits = cents.replace(/^-/, "").padStart(3, "0");
  const amount =
    `${sign}${digits.slice(0, -2)}.${digits.slice(-2)}` as `${number}`;
  return euros.format(amount);
}
