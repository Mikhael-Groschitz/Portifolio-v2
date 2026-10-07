export type Placeholder = `TODO:${string}`;

export function isPlaceholder(value: unknown): value is Placeholder {
  return typeof value === "string" && value.startsWith("TODO:");
}
