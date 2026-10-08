export function normalize(input: string): string {
  return input
    .replace(/--[^\n]*/g, " ")
    .toLowerCase()
    .replaceAll(";", " ")
    .replace(/\bgo\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
