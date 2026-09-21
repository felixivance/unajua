export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeAnswer(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
