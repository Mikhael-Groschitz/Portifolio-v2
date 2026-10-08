import { describe, expect, it } from "vitest";
import {
  type TreeNode,
  expandableIds,
  moveForKey,
  visibleNodes,
} from "./tree-model";

const tree: TreeNode[] = [
  {
    id: "server",
    label: "server",
    icon: "server",
    children: [
      {
        id: "tables",
        label: "Tables",
        icon: "folder",
        children: [
          { id: "about", label: "dbo.About", icon: "table" },
          { id: "career", label: "dbo.Career", icon: "table" },
        ],
      },
      { id: "empty", label: "Empty", icon: "folder", children: [] },
    ],
  },
];

const allOpen = new Set(expandableIds(tree));
const visible = visibleNodes(tree, allOpen);

describe("expandableIds", () => {
  it("lists only the nodes that have children", () => {
    expect(expandableIds(tree)).toEqual(["server", "tables"]);
  });
});

describe("visibleNodes", () => {
  it("lists expanded nodes in reading order", () => {
    expect(visible.map((node) => node.id)).toEqual([
      "server",
      "tables",
      "about",
      "career",
      "empty",
    ]);
  });

  it("hides the children of collapsed nodes", () => {
    const collapsed = visibleNodes(tree, new Set(["server"]));
    expect(collapsed.map((node) => node.id)).toEqual([
      "server",
      "tables",
      "empty",
    ]);
  });
});

describe("moveForKey", () => {
  it("moves focus up and down without wrapping", () => {
    expect(moveForKey("ArrowDown", visible, "tables")).toEqual({
      type: "focus",
      id: "about",
    });
    expect(moveForKey("ArrowUp", visible, "tables")).toEqual({
      type: "focus",
      id: "server",
    });
    expect(moveForKey("ArrowDown", visible, "empty")).toBeNull();
    expect(moveForKey("ArrowUp", visible, "server")).toBeNull();
  });

  it("jumps to the first and last visible nodes", () => {
    expect(moveForKey("Home", visible, "career")).toEqual({
      type: "focus",
      id: "server",
    });
    expect(moveForKey("End", visible, "server")).toEqual({
      type: "focus",
      id: "empty",
    });
  });

  it("expands, enters, collapses and climbs with the side arrows", () => {
    const closed = visibleNodes(tree, new Set(["server"]));
    expect(moveForKey("ArrowRight", closed, "tables")).toEqual({
      type: "toggle",
      id: "tables",
    });
    expect(moveForKey("ArrowRight", visible, "tables")).toEqual({
      type: "focus",
      id: "about",
    });
    expect(moveForKey("ArrowLeft", visible, "tables")).toEqual({
      type: "toggle",
      id: "tables",
    });
    expect(moveForKey("ArrowLeft", visible, "about")).toEqual({
      type: "focus",
      id: "tables",
    });
    const allClosed = visibleNodes(tree, new Set());
    expect(moveForKey("ArrowLeft", allClosed, "server")).toBeNull();
    expect(moveForKey("ArrowRight", visible, "about")).toBeNull();
  });

  it("toggles folders and activates leaves with Enter and Space", () => {
    expect(moveForKey("Enter", visible, "tables")).toEqual({
      type: "toggle",
      id: "tables",
    });
    expect(moveForKey(" ", visible, "about")).toEqual({
      type: "activate",
      id: "about",
    });
  });

  it("ignores other keys and unknown nodes", () => {
    expect(moveForKey("a", visible, "about")).toBeNull();
    expect(moveForKey("ArrowDown", visible, "missing")).toBeNull();
  });
});
