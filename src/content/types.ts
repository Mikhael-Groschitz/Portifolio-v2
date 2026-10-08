import type { Placeholder } from "./placeholder";
import type { ByProfile } from "./profiles";

export const SECTION_IDS = [
  "about",
  "tech-stack",
  "career",
  "projects",
  "beyond-the-terminal",
  "contact",
  "resume",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function isSectionId(value: unknown): value is SectionId {
  return SECTION_IDS.some((id) => id === value);
}

export type YearMonth = `${number}-${number}`;

export type CareerDate = YearMonth | Placeholder;

export interface AboutRow {
  name: string;
  role: string;
  summary: string;
}

export interface TechStackRow {
  category: string;
  technology: string;
}

export interface CareerRow {
  company: string;
  role: string;
  startDate: CareerDate;
  endDate: CareerDate | null;
  description: string;
}

export interface ProjectRow {
  name: string;
  categories: string[];
  description: string;
  stack: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  image: string | null;
}

export interface BeyondTheTerminalRow {
  trait: string;
  description: string;
}

export interface ContactRow {
  channel: string;
  value: string;
  url: string;
}

export interface ResumeRow {
  fileName: string;
  url: string;
}

export interface SimpleVersionText {
  title: string;
  intro: string;
  sectionsLabel: string;
  sections: Record<SectionId, string>;
  present: string;
  repository: string;
  demo: string;
  technologies: string;
  downloadResume: string;
  opensInNewTab: string;
  switchLanguage: string;
  fullVersion: string;
}

export type MenuId = "file" | "edit" | "view" | "tools" | "window" | "help";

export type MenuItemId =
  | "newQuery"
  | "openFile"
  | "save"
  | "undo"
  | "redo"
  | "cut"
  | "copy"
  | "paste"
  | "objectExplorer"
  | "fullScreen"
  | "language"
  | "options"
  | "closeAllDocuments"
  | "resetWindowLayout"
  | "cheatsheet"
  | "tour"
  | "simpleVersion";

export interface CountText {
  one: string;
  other: string;
}

export interface MenuText {
  label: string;
  more: string;
  menus: Record<MenuId, string>;
  items: Record<MenuItemId, string>;
}

export interface ResultsText {
  results: string;
  messages: string;
  rowNumber: string;
  rowsAffected: CountText;
  completionTime: string;
  errorHeader: string;
  opensInNewTab: string;
}

export interface ConnectionText {
  connected: string;
  executing: string;
  succeeded: string;
  failed: string;
  login: ByProfile<string>;
  rows: CountText;
}

export interface ConnectText {
  title: string;
  close: string;
  brand: string;
  tabs: {
    login: string;
    connectionProperties: string;
    additionalParameters: string;
  };
  login: {
    server: string;
    serverType: string;
    serverTypeValue: string;
    serverName: string;
    authentication: string;
    profiles: ByProfile<string>;
    userName: string;
    password: string;
    rememberPassword: string;
    security: string;
    encryption: string;
    encryptionValue: string;
    trustCertificate: string;
    hostName: string;
  };
  properties: {
    intro: string;
    database: string;
    network: string;
    protocol: string;
    defaultValue: string;
    packetSize: string;
    bytes: string;
    connection: string;
    connectionTimeout: string;
    executionTimeout: string;
    seconds: string;
    customColor: string;
    selectColor: string;
    resetAll: string;
  };
  parameters: {
    label: string;
    hint: string;
  };
  buttons: {
    connect: string;
    connecting: string;
    cancel: string;
    help: string;
    options: string;
  };
  help: {
    title: string;
    body: string[];
    close: string;
  };
}

export interface ShellText {
  windowTitle: string;
  languageName: string;
  menu: MenuText;
  toolbar: {
    newQuery: string;
    databases: string;
    execute: string;
    simpleVersion: string;
  };
  explorer: {
    title: string;
    connect: string;
    close: string;
    databases: string;
    tables: string;
    programmability: string;
    storedProcedures: string;
  };
  editor: {
    tabsLabel: string;
    noIssues: string;
    line: string;
    column: string;
  };
  scripts: Record<SectionId, string[]>;
  results: ResultsText;
  connection: ConnectionText;
  connect: ConnectText;
  status: {
    ready: string;
  };
}

export interface Texts {
  about: AboutRow;
  techStack: TechStackRow[];
  career: CareerRow[];
  projects: ProjectRow[];
  beyondTheTerminal: BeyondTheTerminalRow[];
  contact: { intro: string; channels: ContactRow[] };
  resume: ResumeRow;
  simpleVersion: SimpleVersionText;
  shell: ShellText;
}

export interface Tables {
  about: AboutRow[];
  "tech-stack": TechStackRow[];
  career: CareerRow[];
  projects: ProjectRow[];
  "beyond-the-terminal": BeyondTheTerminalRow[];
  contact: ContactRow[];
  resume: ResumeRow[];
}
