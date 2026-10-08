import { localize } from "@/content";
import { type Localized, mapLocalized } from "@/content/locales";
import {
  CATALOG,
  type CatalogObjectKind,
  DATABASE,
  SERVER,
  qualifiedName,
} from "@/engine/catalog";
import type { TreeNode } from "./tree-model";

function objectNodes(kind: CatalogObjectKind): TreeNode[] {
  return CATALOG.filter((object) => object.kind === kind).map((object) => ({
    id: object.section,
    label: qualifiedName(object),
    icon: kind,
  }));
}

function folder(id: string, label: Localized, children: TreeNode[]): TreeNode {
  return { id, label, icon: "folder", children };
}

export function explorerNodes(): TreeNode[] {
  const explorer = localize((texts) => texts.shell.explorer);
  const login = localize((texts) => texts.shell.connection.login);

  return [
    {
      id: "server",
      icon: "server",
      label: mapLocalized(
        login,
        (user) =>
          `${SERVER.name} (${SERVER.product} ${SERVER.version} - ${user})`,
      ),
      children: [
        folder(
          "databases",
          mapLocalized(explorer, (text) => text.databases),
          [
            {
              id: "database",
              icon: "database",
              label: DATABASE,
              children: [
                folder(
                  "tables",
                  mapLocalized(explorer, (text) => text.tables),
                  objectNodes("table"),
                ),
                folder(
                  "programmability",
                  mapLocalized(explorer, (text) => text.programmability),
                  [
                    folder(
                      "stored-procedures",
                      mapLocalized(explorer, (text) => text.storedProcedures),
                      objectNodes("procedure"),
                    ),
                  ],
                ),
              ],
            },
          ],
        ),
      ],
    },
  ];
}
