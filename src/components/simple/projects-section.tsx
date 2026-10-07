import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { getTable, getTexts } from "@/content";
import type { Locale } from "@/content/locales";
import { ContentLink } from "./content-link";
import { Section } from "./section";
import styles from "./simple.module.css";

function isPublicFile(src: string): boolean {
  return existsSync(path.join(process.cwd(), "public", src));
}

export function ProjectsSection({ locale }: Readonly<{ locale: Locale }>) {
  const text = getTexts(locale).simpleVersion;

  return (
    <Section id="projects" locale={locale}>
      <ul className={styles.list}>
        {getTable("projects", locale).map((project) => (
          <li key={project.name} className={styles.item}>
            <article>
              <h3>{project.name}</h3>
              <p className={styles.meta}>{project.categories.join(" · ")}</p>
              {project.image && isPublicFile(project.image) && (
                <div className={styles.imageFrame}>
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(max-width: 760px) 100vw, 728px"
                    className={styles.image}
                  />
                </div>
              )}
              <p>{project.description}</p>
              <ul className={styles.tags} aria-label={text.technologies}>
                {project.stack.map((technology) => (
                  <li key={technology} className={styles.tag}>
                    {technology}
                  </li>
                ))}
              </ul>
              <p className={styles.links}>
                {project.repoUrl && (
                  <ContentLink
                    url={project.repoUrl}
                    newTabLabel={text.opensInNewTab}
                  >
                    {text.repository}
                  </ContentLink>
                )}
                {project.demoUrl && (
                  <ContentLink
                    url={project.demoUrl}
                    newTabLabel={text.opensInNewTab}
                  >
                    {text.demo}
                  </ContentLink>
                )}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
