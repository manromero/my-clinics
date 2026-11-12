const euros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const percentage = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 2,
});

const dates = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export const activityCount = new Intl.NumberFormat("es-ES");

export function formatEuroCents(cents: `${bigint}`) {
  const sign = cents.startsWith("-") ? "-" : "";
  const digits = cents.replace(/^-/, "").padStart(3, "0");
  const amount =
    `${sign}${digits.slice(0, -2)}.${digits.slice(-2)}` as `${number}`;
  return euros.format(amount);
}

export function formatActivityRate(basisPoints: number) {
  return percentage.format(basisPoints / 10_000);
}

export function formatActivityDate(date: string) {
  return dates.format(new Date(`${date}T00:00:00Z`));
}
