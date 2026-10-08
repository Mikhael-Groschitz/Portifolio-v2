import { describe, expect, it } from "vitest";
import type { Localized } from "@/content/locales";
import type { ExecutionOutcome } from "@/engine/execute";
import {
  initialWorkspace,
  neighborAfterClose,
  userRun,
  withActive,
  workspaceReducer,
} from "./workspace-state";

const rows: ExecutionOutcome = {
  kind: "rows",
  database: "Portfolio",
  resultSet: { source: "dbo.About", columns: [], rows: [] },
};
const failure: ExecutionOutcome = {
  kind: "error",
  database: "Portfolio",
  error: { number: 102, level: 15, state: 1, line: 1, message: "x" },
};
const success: Localized<ExecutionOutcome> = { "pt-BR": rows, en: rows };
const moment = new Date(0);

describe("tabs", () => {
  it("starts with the tab of the current address, already run", () => {
    const state = initialWorkspace("career", success);
    expect(state.tabs).toEqual(["career"]);
    expect(state.runs.career).toMatchObject({
      status: "done",
      origin: "connection",
      completedAt: null,
    });
  });

  it("opens a tab once and never duplicates it", () => {
    const opened = workspaceReducer(initialWorkspace("about", success), {
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
    const state = workspaceReducer(initialWorkspace("about", success), {
      type: "open",
      section: "contact",
      active: "projects",
    });
    expect(state.tabs).toEqual(["about", "projects", "contact"]);
  });

  it("closes tabs with their results but always keeps one open", () => {
    const two = workspaceReducer(initialWorkspace("about", success), {
      type: "open",
      section: "career",
      active: "about",
    });
    const one = workspaceReducer(two, {
      type: "close",
      section: "about",
      active: "career",
    });
    expect(one.tabs).toEqual(["career"]);
    expect(one.runs.about).toBeUndefined();
    expect(
      workspaceReducer(one, {
        type: "close",
        section: "career",
        active: "career",
      }).tabs,
    ).toEqual(["career"]);
  });
});

describe("runs", () => {
  it("goes from executing to done", () => {
    const started = workspaceReducer(initialWorkspace("about", success), {
      type: "start",
      section: "about",
      id: 1,
    });
    expect(started.runs.about).toEqual({ id: 1, status: "executing" });
    const finished = workspaceReducer(started, {
      type: "finish",
      section: "about",
      run: userRun(1, success, moment, 150),
    });
    expect(finished.runs.about).toMatchObject({
      status: "done",
      origin: "user",
      elapsedMs: 150,
    });
  });

  it("marks failed runs as errors", () => {
    expect(
      userRun(1, { "pt-BR": failure, en: failure }, moment, 1).status,
    ).toBe("error");
  });

  it("ignores a run that was replaced or closed", () => {
    const first = workspaceReducer(initialWorkspace("about", success), {
      type: "start",
      section: "about",
      id: 1,
    });
    const second = workspaceReducer(first, {
      type: "start",
      section: "about",
      id: 2,
    });
    const stale = workspaceReducer(second, {
      type: "finish",
      section: "about",
      run: userRun(1, success, moment, 1),
    });
    expect(stale.runs.about).toEqual({ id: 2, status: "executing" });
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
