import { describe, expect, it } from "vitest";
import { CATALOG, qualifiedName } from "@/engine/catalog";
import { explorerNodes } from "./explorer-nodes";
import { type TreeNode, expandableIds, isExpandable } from "./tree-model";

function leaves(nodes: readonly TreeNode[]): TreeNode[] {
  return nodes.flatMap((node) =>
    isExpandable(node) ? leaves(node.children ?? []) : [node],
  );
}

describe("explorerNodes", () => {
  const nodes = explorerNodes();

  it("shows every catalog object once, by its qualified name", () => {
    expect(leaves(nodes).map((node) => node.label)).toEqual(
      CATALOG.map(qualifiedName),
    );
  });

  it("uses the section ids for the objects", () => {
    expect(leaves(nodes).map((node) => node.id)).toEqual(
      CATALOG.map((object) => object.section),
    );
  });

  it("nests tables and procedures under the Portfolio database", () => {
    expect(expandableIds(nodes)).toEqual([
      "server",
      "databases",
      "database",
      "tables",
      "programmability",
      "stored-procedures",
    ]);
  });
});
