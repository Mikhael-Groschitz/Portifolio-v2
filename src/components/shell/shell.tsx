import { ObjectExplorer } from "@/components/explorer/object-explorer";
import { ShellFrame } from "./shell-frame";
import { StatusBar } from "./status-bar";
import { TitleBar } from "./title-bar";
import { Toolbar } from "./toolbar";
import { Workspace } from "./workspace";

export function Shell() {
  return (
    <ShellFrame
      titleBar={<TitleBar />}
      toolbar={<Toolbar />}
      explorer={<ObjectExplorer />}
      workspace={<Workspace />}
      statusBar={<StatusBar />}
    />
  );
}
