import type { ReactNode } from "react";
import { ObjectExplorer } from "@/components/explorer/object-explorer";
import { ShellFrame } from "./shell-frame";
import { StatusBar } from "./status-bar";
import { TitleBar } from "./title-bar";
import { Toolbar } from "./toolbar";
import { Workspace } from "./workspace";
import { WorkspaceProvider } from "./workspace-context";

export function Shell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <WorkspaceProvider>
      <ShellFrame
        titleBar={<TitleBar />}
        toolbar={<Toolbar />}
        explorer={<ObjectExplorer />}
        workspace={<Workspace>{children}</Workspace>}
        statusBar={<StatusBar />}
      />
    </WorkspaceProvider>
  );
}
