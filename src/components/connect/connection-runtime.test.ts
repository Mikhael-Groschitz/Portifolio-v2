import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  CONNECTION_ATTRIBUTE,
  CONNECTION_SCRIPT,
  CONNECTION_STORAGE_KEY,
  type ConnectionRecord,
  PROFILE_ATTRIBUTE,
  applyConnection,
  readConnectionStatus,
  storeConnection,
} from "./connection-runtime";

function fakeRoot() {
  const attributes = new Map<string, string>();
  const styles = new Map<string, string>();
  return {
    attributes,
    styles,
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
    style: {
      setProperty: (name: string, value: string | null) => {
        styles.set(name, String(value));
      },
      removeProperty: (name: string) => {
        styles.delete(name);
        return "";
      },
    },
  };
}

function storageWith(value: string | null) {
  return { getItem: () => value };
}

const blockedStorage = {
  getItem: (): string | null => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

function runHeadScript(storage: { getItem: () => string | null }) {
  const root = fakeRoot();
  runInNewContext(CONNECTION_SCRIPT, {
    document: { documentElement: root },
    sessionStorage: storage,
  });
  return {
    status: root.getAttribute(CONNECTION_ATTRIBUTE),
    profile: root.getAttribute(PROFILE_ATTRIBUTE),
    styles: Object.fromEntries(root.styles),
  };
}

function storedRecord(record: ConnectionRecord): string | null {
  const values = new Map<string, string>();
  storeConnection(record, {
    setItem: (key, value) => {
      values.set(key, value);
    },
  });
  return values.get(CONNECTION_STORAGE_KEY) ?? null;
}

const visitor: ConnectionRecord = { profile: "visitor", colors: null };
const darkInk: ConnectionRecord = {
  profile: "dev",
  colors: { background: "#9cdcfe", ink: "dark" },
};
const lightInk: ConnectionRecord = {
  profile: "visitor",
  colors: { background: "#1f3a5f", ink: "light" },
};

describe("connection head script", () => {
  it("shows the dialog on the first visit of a session", () => {
    expect(runHeadScript(storageWith(null))).toEqual({
      status: "pending",
      profile: null,
      styles: {},
    });
  });

  it("skips the dialog once the session has connected", () => {
    expect(runHeadScript(storageWith(storedRecord(visitor)))).toEqual({
      status: "connected",
      profile: "visitor",
      styles: {},
    });
  });

  it("paints the custom color before the first frame", () => {
    expect(runHeadScript(storageWith(storedRecord(darkInk)))).toEqual({
      status: "connected",
      profile: "dev",
      styles: { "--status-connected": "#9cdcfe" },
    });
    expect(runHeadScript(storageWith(storedRecord(lightInk))).styles).toEqual({
      "--status-connected": "#1f3a5f",
      "--text-on-status": "var(--text-on-selection)",
    });
  });

  it.each([
    "{",
    "5",
    '"dev"',
    "[]",
    "null",
    '{"profile":"admin","colors":null}',
    '{"colors":null}',
  ])("asks to connect again when the session holds %s", (raw) => {
    expect(runHeadScript(storageWith(raw)).status).toBe("pending");
  });

  it.each([
    { background: "red;}body{display:none", ink: "dark" },
    { background: "#9cdcfe", ink: "pink" },
    { background: ["#9cdcfe"], ink: "dark" },
    "#9cdcfe",
  ])("ignores colors that are not a plain hex value: %j", (colors) => {
    const raw = JSON.stringify({ profile: "dev", colors });
    expect(runHeadScript(storageWith(raw))).toEqual({
      status: "connected",
      profile: "dev",
      styles: {},
    });
  });

  it("asks to connect when storage is blocked", () => {
    expect(runHeadScript(blockedStorage).status).toBe("pending");
  });
});

describe("connection runtime", () => {
  it("applies a connection exactly like the head script", () => {
    for (const record of [visitor, darkInk, lightInk]) {
      const root = fakeRoot();
      applyConnection(record, root);
      expect({
        status: root.getAttribute(CONNECTION_ATTRIBUTE),
        profile: root.getAttribute(PROFILE_ATTRIBUTE),
        styles: Object.fromEntries(root.styles),
      }).toEqual(runHeadScript(storageWith(storedRecord(record))));
    }
  });

  it("drops a previous custom color", () => {
    const root = fakeRoot();
    applyConnection(lightInk, root);
    applyConnection(visitor, root);
    expect(Object.fromEntries(root.styles)).toEqual({});
  });

  it("reads the connection status from the root element", () => {
    const root = fakeRoot();
    expect(readConnectionStatus(root)).toBe("unknown");
    root.setAttribute(CONNECTION_ATTRIBUTE, "pending");
    expect(readConnectionStatus(root)).toBe("pending");
    applyConnection(visitor, root);
    expect(readConnectionStatus(root)).toBe("connected");
    root.setAttribute(CONNECTION_ATTRIBUTE, "<b>");
    expect(readConnectionStatus(root)).toBe("unknown");
  });

  it("keeps working when storage is blocked", () => {
    expect(storeConnection(visitor, blockedStorage)).toBe(false);
  });
});
