export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

export const LETTERS_FROM = KONAMI_CODE.indexOf("b");

function normalize(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key;
}

export function nextKonamiStep(step: number, key: string): number {
  const pressed = normalize(key);
  if (pressed === KONAMI_CODE[step]) {
    return step + 1;
  }
  if (pressed !== KONAMI_CODE[0]) {
    return 0;
  }
  return step === 2 ? 2 : 1;
}
