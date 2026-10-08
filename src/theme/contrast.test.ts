import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  hexFromRgb,
  isHexColor,
  readableInk,
  relativeLuminance,
} from "./contrast";

describe("contrast", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("does not depend on argument order", () => {
    expect(contrastRatio("#0078d4", "#ffffff")).toBe(
      contrastRatio("#ffffff", "#0078d4"),
    );
  });

  it("accepts only #rrggbb colors", () => {
    expect(isHexColor("#1E1e1E")).toBe(true);
    expect(isHexColor("#12345")).toBe(false);
    expect(() => relativeLuminance("red")).toThrow();
  });

  it("turns a computed rgb() color into #rrggbb", () => {
    expect(hexFromRgb("rgb(240, 230, 140)")).toBe("#f0e68c");
    expect(hexFromRgb("rgba(0, 0, 0, 1)")).toBe("#000000");
    expect(hexFromRgb("rgba(0, 0, 0, 0.5)")).toBeNull();
    expect(hexFromRgb("rgb(256, 0, 0)")).toBeNull();
    expect(hexFromRgb("khaki")).toBeNull();
  });

  it("picks the text color that reads better on a background", () => {
    expect(readableInk("#f0e68c")).toBe("dark");
    expect(readableInk("#ffffff")).toBe("dark");
    expect(readableInk("#1f1f1f")).toBe("light");
    expect(readableInk("#1f3a5f")).toBe("light");
  });

  it("keeps any background at AA with the chosen text color", () => {
    for (const background of ["#7160e8", "#808080", "#ff0000", "#00ff00"]) {
      const ink = readableInk(background) === "dark" ? "#000000" : "#ffffff";
      expect(contrastRatio(background, ink)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
