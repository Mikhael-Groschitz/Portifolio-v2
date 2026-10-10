import { describe, expect, it } from "vitest";
import { pixelPath } from "./pixel-path";

describe("pixelPath", () => {
  it("draws one rectangle per horizontal run of pixels", () => {
    expect(pixelPath(["XX.X", ".X.."])).toBe(
      "M0 0h2v1h-2zM3 0h1v1h-1zM1 1h1v1h-1z",
    );
  });

  it("draws nothing for an empty mask", () => {
    expect(pixelPath(["...", "..."])).toBe("");
  });
});
