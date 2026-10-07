import type { Placeholder } from "./placeholder";

export const SECTION_IDS = [
  "about",
  "tech-stack",
  "career",
  "projects",
  "contact",
  "resume",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

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

export interface Texts {
  about: AboutRow;
  techStack: TechStackRow[];
  career: CareerRow[];
  projects: ProjectRow[];
  contact: { intro: string; channels: ContactRow[] };
  resume: ResumeRow;
  simpleVersion: SimpleVersionText;
}

export interface Tables {
  about: AboutRow[];
  "tech-stack": TechStackRow[];
  career: CareerRow[];
  projects: ProjectRow[];
  contact: ContactRow[];
  resume: ResumeRow[];
}
