import { describe, expect, it } from "vitest";
import type { Localized } from "@/content/locales";
import type { ExecutionOutcome } from "@/engine/execute";
import {
  connectionRun,
  initialWorkspace,
  neighborAfterClose,
  userRun,
  withActive,
  workspaceReducer,
} from "./workspace-state";

const rows: ExecutionOutcome = {
  kind: "results",
  database: "Portfolio",
  results: [
    {
      kind: "rows",
      resultSet: { source: "dbo.About", columns: [], rows: [] },
    },
  ],
};
const failure: ExecutionOutcome = {
  kind: "error",
  database: "Portfolio",
  error: { number: 404, level: 16, state: 1, line: 1, message: "x" },
  hint: { kind: "help", command: "SELECT * FROM dbo.About" },
};
const success: Localized<ExecutionOutcome> = { "pt-BR": rows, en: rows };
const travel: ExecutionOutcome = {
  kind: "results",
  database: "Portfolio_v1",
  results: [],
  effect: "travel",
};
const departure: Localized<ExecutionOutcome> = { "pt-BR": travel, en: travel };
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
      document: "career",
      active: "about",
    });
    const again = workspaceReducer(opened, {
      type: "open",
      document: "career",
      active: "career",
    });
    expect(again.tabs).toEqual(["about", "career"]);
  });

  it("starts the new query without results", () => {
    expect(initialWorkspace("query", null)).toEqual({
      tabs: ["query"],
      runs: {},
      effect: null,
    });
  });

  it("opens the new query next to the sections", () => {
    const state = workspaceReducer(initialWorkspace("about", success), {
      type: "open",
      document: "query",
      active: "about",
    });
    expect(state.tabs).toEqual(["about", "query"]);
  });

  it("keeps the tab reached through back and forward", () => {
    const state = workspaceReducer(initialWorkspace("about", success), {
      type: "open",
      document: "contact",
      active: "projects",
    });
    expect(state.tabs).toEqual(["about", "projects", "contact"]);
  });

  it("closes tabs with their results but always keeps one open", () => {
    const two = workspaceReducer(initialWorkspace("about", success), {
      type: "open",
      document: "career",
      active: "about",
    });
    const one = workspaceReducer(two, {
      type: "close",
      document: "about",
      active: "career",
    });
    expect(one.tabs).toEqual(["career"]);
    expect(one.runs.about).toBeUndefined();
    expect(
      workspaceReducer(one, {
        type: "close",
        document: "career",
        active: "career",
      }).tabs,
    ).toEqual(["career"]);
  });
});

describe("runs", () => {
  it("goes from executing to done", () => {
    const started = workspaceReducer(initialWorkspace("about", success), {
      type: "start",
      document: "about",
      id: 1,
    });
    expect(started.runs.about).toEqual({ id: 1, status: "executing" });
    const finished = workspaceReducer(started, {
      type: "finish",
      document: "about",
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
      document: "about",
      id: 1,
    });
    const second = workspaceReducer(first, {
      type: "start",
      document: "about",
      id: 2,
    });
    const stale = workspaceReducer(second, {
      type: "finish",
      document: "about",
      run: userRun(1, success, moment, 1),
    });
    expect(stale.runs.about).toEqual({ id: 2, status: "executing" });
  });

  it("runs the current section again when the visitor connects", () => {
    const connected = workspaceReducer(initialWorkspace("about", success), {
      type: "connect",
      document: "career",
      run: connectionRun(success, { id: 3, completedAt: moment }),
    });
    expect(connected.tabs).toEqual(["about", "career"]);
    expect(connected.runs.career).toMatchObject({
      id: 3,
      status: "done",
      origin: "connection",
      completedAt: moment,
    });
    expect(connected.runs.about).toMatchObject({ id: 0 });
  });
});

describe("effects", () => {
  function finish(
    state: ReturnType<typeof initialWorkspace>,
    id: number,
    outcomes: Localized<ExecutionOutcome>,
  ) {
    const started = workspaceReducer(state, {
      type: "start",
      document: "query",
      id,
    });
    return workspaceReducer(started, {
      type: "finish",
      document: "query",
      run: userRun(id, outcomes, moment, 150),
    });
  }

  it("remembers the effect of the last run that asked for one", () => {
    const traveled = finish(initialWorkspace("query", null), 4, departure);
    expect(traveled.effect).toEqual({ id: 4, kind: "travel" });
    expect(finish(traveled, 5, success).effect).toEqual({
      id: 4,
      kind: "travel",
    });
  });

  it("ignores the effect of a run that was replaced", () => {
    const started = workspaceReducer(initialWorkspace("query", null), {
      type: "start",
      document: "query",
      id: 2,
    });
    const stale = workspaceReducer(started, {
      type: "finish",
      document: "query",
      run: userRun(1, departure, moment, 150),
    });
    expect(stale.effect).toBeNull();
  });

  it("keeps the effect when tabs close or a connection run arrives", () => {
    const traveled = finish(initialWorkspace("query", null), 4, departure);
    const connected = workspaceReducer(traveled, {
      type: "connect",
      document: "query",
      run: connectionRun(success, { id: 5, completedAt: moment }),
    });
    expect(connected.effect).toEqual({ id: 4, kind: "travel" });
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
