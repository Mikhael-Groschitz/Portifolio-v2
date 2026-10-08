import type { ReactNode } from "react";
import { ConnectDialog } from "@/components/connect/connect-dialog";
import { ObjectExplorer } from "@/components/explorer/object-explorer";
import { localize } from "@/content";
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
        dialog={
          <ConnectDialog
            text={localize((texts) => texts.shell.connect)}
            login={localize((texts) => texts.shell.connection.login)}
          />
        }
      />
    </WorkspaceProvider>
  );
}
