import type { SectionId } from "@/content/types";

export interface WorkspaceState {
  tabs: readonly SectionId[];
}

export type WorkspaceAction =
  | { type: "open"; section: SectionId; active: SectionId }
  | { type: "close"; section: SectionId; active: SectionId };

export function initialWorkspace(active: SectionId): WorkspaceState {
  return { tabs: [active] };
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

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  const tabs = withActive(state.tabs, action.active);
  switch (action.type) {
    case "open":
      return {
        tabs: tabs.includes(action.section) ? tabs : [...tabs, action.section],
      };
    case "close":
      return {
        tabs:
          tabs.length > 1 ? tabs.filter((tab) => tab !== action.section) : tabs,
      };
  }
}
