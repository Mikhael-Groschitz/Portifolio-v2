import { describe, expect, it } from "vitest";
import { contrastRatio, isHexColor, relativeLuminance } from "./contrast";

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
});
