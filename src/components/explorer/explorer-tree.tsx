"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DatabaseIcon,
  ExpanderIcon,
  FolderIcon,
  ProcedureIcon,
  ServerIcon,
  TableIcon,
} from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import {
  type TreeIcon,
  type TreeNode,
  expandableIds,
  isExpandable,
  moveForKey,
  visibleNodes,
} from "./tree-model";
import styles from "./object-explorer.module.css";

const INDENT = 18;

const NODE_ICONS: Record<TreeIcon, ReactNode> = {
  server: <ServerIcon />,
  folder: <FolderIcon />,
  database: <DatabaseIcon />,
  table: <TableIcon />,
  procedure: <ProcedureIcon />,
};

interface ExplorerTreeProps {
  nodes: readonly TreeNode[];
  labelledBy: string;
  defaultSelectedId: string;
}

export function ExplorerTree({
  nodes,
  labelledBy,
  defaultSelectedId,
}: Readonly<ExplorerTreeProps>) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(expandableIds(nodes)),
  );
  const [selectedId, setSelectedId] = useState(defaultSelectedId);
  const [focusedId, setFocusedId] = useState(defaultSelectedId);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const visible = useMemo(
    () => visibleNodes(nodes, expanded),
    [nodes, expanded],
  );

  function focusNode(id: string) {
    setFocusedId(id);
    itemRefs.current.get(id)?.focus();
  }

  function toggle(id: string) {
    const next = new Set(expanded);
    if (!next.delete(id)) {
      next.add(id);
    }
    setExpanded(next);
    const focusStillVisible = visibleNodes(nodes, next).some(
      (node) => node.id === focusedId,
    );
    if (!focusStillVisible) {
      focusNode(id);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const move = moveForKey(event.key, visible, focusedId);
    if (!move) {
      return;
    }
    event.preventDefault();
    if (move.type === "focus") {
      focusNode(move.id);
    } else if (move.type === "toggle") {
      toggle(move.id);
    } else {
      setSelectedId(move.id);
    }
  }

  function handleFocus(event: FocusEvent<HTMLUListElement>) {
    const { nodeId } = (event.target as HTMLElement).dataset;
    if (nodeId) {
      setFocusedId(nodeId);
    }
  }

  function renderNode(node: TreeNode, level: number): ReactNode {
    const expandable = isExpandable(node);
    const isOpen = expandable && expanded.has(node.id);

    return (
      <li
        key={node.id}
        ref={(element) => {
          if (element) {
            itemRefs.current.set(node.id, element);
          }
          return () => {
            itemRefs.current.delete(node.id);
          };
        }}
        data-node-id={node.id}
        role="treeitem"
        aria-level={level}
        aria-expanded={expandable ? isOpen : undefined}
        aria-selected={expandable ? undefined : node.id === selectedId}
        tabIndex={node.id === focusedId ? 0 : -1}
        className={styles.item}
      >
        <div
          className={styles.row}
          style={{ paddingInlineStart: (level - 1) * INDENT + 2 }}
          onClick={() =>
            expandable ? toggle(node.id) : setSelectedId(node.id)
          }
        >
          <span className={styles.expander}>
            {expandable && <ExpanderIcon expanded={isOpen} />}
          </span>
          <span className={styles.nodeIcon}>{NODE_ICONS[node.icon]}</span>
          <span className={styles.label}>
            {typeof node.label === "string" ? (
              node.label
            ) : (
              <LocaleText text={node.label} />
            )}
          </span>
        </div>
        {isOpen && (
          <ul role="group" className={styles.group}>
            {node.children?.map((child) => renderNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <ul
      role="tree"
      aria-labelledby={labelledBy}
      className={styles.tree}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
      {nodes.map((node) => renderNode(node, 1))}
    </ul>
  );
}
