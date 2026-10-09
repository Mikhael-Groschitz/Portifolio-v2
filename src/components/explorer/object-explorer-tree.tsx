"use client";

import { useShell } from "@/components/shell/shell-frame";
import { useWorkspace } from "@/components/shell/workspace-context";
import { isSectionId } from "@/content/types";
import { ExplorerTree } from "./explorer-tree";
import type { TreeNode } from "./tree-model";

interface ObjectExplorerTreeProps {
  nodes: readonly TreeNode[];
  labelledBy: string;
}

export function ObjectExplorerTree({
  nodes,
  labelledBy,
}: Readonly<ObjectExplorerTreeProps>) {
  const { activeDocument, openSection } = useWorkspace();
  const { closeExplorer } = useShell();

  function activate(id: string) {
    if (isSectionId(id)) {
      openSection(id);
      closeExplorer();
    }
  }

  return (
    <ExplorerTree
      nodes={nodes}
      labelledBy={labelledBy}
      selectedId={activeDocument}
      onActivate={activate}
    />
  );
}
