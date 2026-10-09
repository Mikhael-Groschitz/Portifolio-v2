import { describe, expect, it } from "vitest";
import { parseV1Url } from "./v1-url";

describe("parseV1Url", () => {
  it.each([
    ["https://mgroschitz.dev", "https://mgroschitz.dev/"],
    [" https://v1.example.com/path ", "https://v1.example.com/path"],
    ["http://localhost:3999/", "http://localhost:3999/"],
  ])("accepts %j", (value, href) => {
    expect(parseV1Url(value)).toBe(href);
  });

  it.each([
    undefined,
    "",
    "   ",
    "mgroschitz.dev",
    "javascript:alert(1)",
    "ftp://example.com",
  ])("ignores %j", (value) => {
    expect(parseV1Url(value)).toBeNull();
  });
});
