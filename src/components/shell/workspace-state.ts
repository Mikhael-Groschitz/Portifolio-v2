import { DEFAULT_LOCALE, type Localized } from "@/content/locales";
import type { Effect } from "@/engine/easter-eggs";
import type { ExecutionOutcome } from "@/engine/execute";
import type { DocumentId } from "./section-routes";

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

export interface RunEffect {
  id: number;
  kind: Effect;
}

export interface WorkspaceState {
  tabs: readonly DocumentId[];
  runs: Partial<Record<DocumentId, Run>>;
  effect: RunEffect | null;
}

export type WorkspaceAction =
  | { type: "open"; document: DocumentId; active: DocumentId }
  | { type: "close"; document: DocumentId; active: DocumentId }
  | { type: "start"; document: DocumentId; id: number }
  | { type: "finish"; document: DocumentId; run: FinishedRun }
  | { type: "connect"; document: DocumentId; run: FinishedRun };

export function connectionRun(
  outcomes: Localized<ExecutionOutcome>,
  {
    id = 0,
    completedAt = null,
  }: { id?: number; completedAt?: Date | null } = {},
): FinishedRun {
  return {
    id,
    status: "done",
    origin: "connection",
    outcomes,
    completedAt,
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
  active: DocumentId,
  outcomes: Localized<ExecutionOutcome> | null,
): WorkspaceState {
  return {
    tabs: [active],
    runs: outcomes ? { [active]: connectionRun(outcomes) } : {},
    effect: null,
  };
}

export function effectOf(run: FinishedRun): RunEffect | null {
  const outcome = run.outcomes[DEFAULT_LOCALE];
  return outcome.kind === "results" && outcome.effect
    ? { id: run.id, kind: outcome.effect }
    : null;
}

export function withActive(
  tabs: readonly DocumentId[],
  active: DocumentId,
): readonly DocumentId[] {
  return tabs.includes(active) ? tabs : [...tabs, active];
}

export function neighborAfterClose(
  tabs: readonly DocumentId[],
  closed: DocumentId,
): DocumentId {
  const index = tabs.indexOf(closed);
  return tabs[index + 1] ?? tabs[index - 1] ?? closed;
}

function withoutRun(
  runs: WorkspaceState["runs"],
  document: DocumentId,
): WorkspaceState["runs"] {
  return Object.fromEntries(
    Object.entries(runs).filter(([key]) => key !== document),
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
        tabs: tabs.includes(action.document)
          ? tabs
          : [...tabs, action.document],
      };
    }
    case "close": {
      const tabs = withActive(state.tabs, action.active);
      if (tabs.length < 2) {
        return { ...state, tabs };
      }
      return {
        ...state,
        tabs: tabs.filter((tab) => tab !== action.document),
        runs: withoutRun(state.runs, action.document),
      };
    }
    case "start":
      return {
        ...state,
        runs: {
          ...state.runs,
          [action.document]: { id: action.id, status: "executing" },
        },
      };
    case "finish":
      if (state.runs[action.document]?.id !== action.run.id) {
        return state;
      }
      return {
        ...state,
        runs: { ...state.runs, [action.document]: action.run },
        effect: effectOf(action.run) ?? state.effect,
      };
    case "connect":
      return {
        ...state,
        tabs: withActive(state.tabs, action.document),
        runs: { ...state.runs, [action.document]: action.run },
      };
  }
}
