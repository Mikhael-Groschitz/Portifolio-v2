import { describe, expect, it } from "vitest";
import {
  initialWorkspace,
  neighborAfterClose,
  withActive,
  workspaceReducer,
} from "./workspace-state";

describe("workspaceReducer", () => {
  it("starts with the tab of the current address", () => {
    expect(initialWorkspace("career").tabs).toEqual(["career"]);
  });

  it("opens a tab once and never duplicates it", () => {
    const opened = workspaceReducer(initialWorkspace("about"), {
      type: "open",
      section: "career",
      active: "about",
    });
    const again = workspaceReducer(opened, {
      type: "open",
      section: "career",
      active: "career",
    });
    expect(again.tabs).toEqual(["about", "career"]);
  });

  it("keeps the tab reached through back and forward", () => {
    const state = workspaceReducer(initialWorkspace("about"), {
      type: "open",
      section: "contact",
      active: "projects",
    });
    expect(state.tabs).toEqual(["about", "projects", "contact"]);
  });

  it("closes tabs but always keeps one open", () => {
    const two = { tabs: ["about", "career"] as const };
    const one = workspaceReducer(two, {
      type: "close",
      section: "career",
      active: "career",
    });
    expect(one.tabs).toEqual(["about"]);
    expect(
      workspaceReducer(one, {
        type: "close",
        section: "about",
        active: "about",
      }).tabs,
    ).toEqual(["about"]);
  });
});

describe("withActive", () => {
  it("adds the active tab only when it is missing", () => {
    expect(withActive(["about"], "about")).toEqual(["about"]);
    expect(withActive(["about"], "resume")).toEqual(["about", "resume"]);
  });
});

describe("neighborAfterClose", () => {
  it("prefers the tab on the right, then the one on the left", () => {
    const tabs = ["about", "career", "contact"] as const;
    expect(neighborAfterClose(tabs, "career")).toBe("contact");
    expect(neighborAfterClose(tabs, "contact")).toBe("career");
  });
});
