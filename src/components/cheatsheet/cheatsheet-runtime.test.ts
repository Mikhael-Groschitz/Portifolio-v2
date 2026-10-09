import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  CHEATSHEET_ATTRIBUTE,
  CHEATSHEET_SCRIPT,
  CHEATSHEET_STORAGE_KEY,
  applyCheatsheet,
  defaultCheatsheet,
  readCheatsheet,
  readStoredCheatsheet,
  storeCheatsheet,
} from "./cheatsheet-runtime";

function fakeRoot(profile: string | null) {
  const attributes = new Map<string, string>();
  if (profile) {
    attributes.set("data-profile", profile);
  }
  return {
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
  };
}

function fakeStorage(value: string | null = null) {
  const values = new Map<string, string>();
  if (value !== null) {
    values.set(CHEATSHEET_STORAGE_KEY, value);
  }
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, next: string) => {
      values.set(key, next);
    },
  };
}

const blockedStorage = {
  getItem: (): string | null => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

function runHeadScript(
  profile: string | null,
  storage: { getItem: (key: string) => string | null },
) {
  const root = fakeRoot(profile);
  runInNewContext(CHEATSHEET_SCRIPT, {
    document: { documentElement: root },
    sessionStorage: storage,
  });
  return root.getAttribute(CHEATSHEET_ATTRIBUTE);
}

describe("cheatsheet head script", () => {
  it.each([
    [null, "open"],
    ["visitor", "open"],
    ["dev", "closed"],
  ])("opens by default for profile %s: %s", (profile, expected) => {
    expect(runHeadScript(profile, fakeStorage())).toBe(expected);
  });

  it("keeps what the visitor chose in this session", () => {
    expect(runHeadScript("visitor", fakeStorage("closed"))).toBe("closed");
    expect(runHeadScript("dev", fakeStorage("open"))).toBe("open");
  });

  it("ignores anything else in storage", () => {
    expect(runHeadScript("dev", fakeStorage("<b>"))).toBe("closed");
    expect(runHeadScript(null, blockedStorage)).toBe("open");
  });
});

describe("cheatsheet runtime", () => {
  it("follows the profile until the visitor decides", () => {
    expect(defaultCheatsheet("visitor")).toBe("open");
    expect(defaultCheatsheet("dev")).toBe("closed");
  });

  it("stores, reads and applies the state", () => {
    const storage = fakeStorage();
    expect(readStoredCheatsheet(storage)).toBeNull();
    expect(storeCheatsheet("closed", storage)).toBe(true);
    expect(readStoredCheatsheet(storage)).toBe("closed");
    const root = fakeRoot(null);
    expect(readCheatsheet(root)).toBe("open");
    applyCheatsheet("closed", root);
    expect(readCheatsheet(root)).toBe("closed");
  });

  it("keeps working when storage is blocked", () => {
    expect(storeCheatsheet("open", blockedStorage)).toBe(false);
    expect(readStoredCheatsheet(blockedStorage)).toBeNull();
  });
});
