const WEB_PROTOCOLS = new Set(["http:", "https:"]);

export function parseV1Url(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  try {
    const url = new URL(value.trim());
    return WEB_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export const V1_URL = parseV1Url(process.env.NEXT_PUBLIC_V1_URL);
