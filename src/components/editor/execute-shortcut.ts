export const EXECUTE_SHORTCUTS = "F5 Alt+X";

interface ShortcutEvent {
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export function isExecuteShortcut(event: ShortcutEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.shiftKey) {
    return false;
  }
  return event.altKey ? event.code === "KeyX" : event.key === "F5";
}
