import type { Localized } from "@/content/locales";
import type { SectionId } from "@/content/types";
import type { ExecutionOutcome } from "@/engine/execute";

export interface PendingRun {
  id: number;
  status: "executing";
}

export interface FinishedRun {
  id: number;
  status: "done" | "error";
  origin: "connection" | "user";
  outcomes: Localized<ExecutionOutcome>;
  completedAt: Date | null;
  elapsedMs: number;
}

export type Run = PendingRun | FinishedRun;

export interface WorkspaceState {
  tabs: readonly SectionId[];
  runs: Partial<Record<SectionId, Run>>;
}

export type WorkspaceAction =
  | { type: "open"; section: SectionId; active: SectionId }
  | { type: "close"; section: SectionId; active: SectionId }
  | { type: "start"; section: SectionId; id: number }
  | { type: "finish"; section: SectionId; run: FinishedRun };

export function connectionRun(
  outcomes: Localized<ExecutionOutcome>,
): FinishedRun {
  return {
    id: 0,
    status: "done",
    origin: "connection",
    outcomes,
    completedAt: null,
    elapsedMs: 0,
  };
}

export function userRun(
  id: number,
  outcomes: Localized<ExecutionOutcome>,
  completedAt: Date,
  elapsedMs: number,
): FinishedRun {
  const failed = Object.values(outcomes).some(
    (outcome) => outcome.kind === "error",
  );
  return {
    id,
    status: failed ? "error" : "done",
    origin: "user",
    outcomes,
    completedAt,
    elapsedMs,
  };
}

export function initialWorkspace(
  active: SectionId,
  outcomes: Localized<ExecutionOutcome>,
): WorkspaceState {
  return { tabs: [active], runs: { [active]: connectionRun(outcomes) } };
}

export function withActive(
  tabs: readonly SectionId[],
  active: SectionId,
): readonly SectionId[] {
  return tabs.includes(active) ? tabs : [...tabs, active];
}

export function neighborAfterClose(
  tabs: readonly SectionId[],
  closed: SectionId,
): SectionId {
  const index = tabs.indexOf(closed);
  return tabs[index + 1] ?? tabs[index - 1] ?? closed;
}

function withoutRun(
  runs: WorkspaceState["runs"],
  section: SectionId,
): WorkspaceState["runs"] {
  return Object.fromEntries(
    Object.entries(runs).filter(([key]) => key !== section),
  );
}

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "open": {
      const tabs = withActive(state.tabs, action.active);
      return {
        ...state,
        tabs: tabs.includes(action.section) ? tabs : [...tabs, action.section],
      };
    }
    case "close": {
      const tabs = withActive(state.tabs, action.active);
      if (tabs.length < 2) {
        return { ...state, tabs };
      }
      return {
        tabs: tabs.filter((tab) => tab !== action.section),
        runs: withoutRun(state.runs, action.section),
      };
    }
    case "start":
      return {
        ...state,
        runs: {
          ...state.runs,
          [action.section]: { id: action.id, status: "executing" },
        },
      };
    case "finish":
      if (state.runs[action.section]?.id !== action.run.id) {
        return state;
      }
      return {
        ...state,
        runs: { ...state.runs, [action.section]: action.run },
      };
  }
}
