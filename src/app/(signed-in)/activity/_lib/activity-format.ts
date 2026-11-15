const percentage = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function formatActivityRate(basisPoints: number) {
  return percentage.format(basisPoints / 10_000);
}

export function formatActivityDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
