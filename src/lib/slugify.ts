export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Naira input ("2500", "2500.50") -> minor units (kobo) */
export function nairaToKobo(value: string | number) {
  const n = typeof value === "number" ? value : parseFloat(value || "0");
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function koboToNaira(kobo: number) {
  return (kobo / 100).toFixed(2);
}