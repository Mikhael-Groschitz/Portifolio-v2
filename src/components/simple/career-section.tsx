import { getTable, getTexts } from "@/content";
import { formatYearMonth } from "@/content/format";
import type { Locale } from "@/content/locales";
import { isPlaceholder } from "@/content/placeholder";
import type { CareerDate } from "@/content/types";
import { Section } from "./section";
import styles from "./simple.module.css";

function CareerTime({
  date,
  locale,
}: Readonly<{ date: CareerDate; locale: Locale }>) {
  if (isPlaceholder(date)) {
    return <span>{date}</span>;
  }
  return <time dateTime={date}>{formatYearMonth(date, locale)}</time>;
}

export function CareerSection({ locale }: Readonly<{ locale: Locale }>) {
  const text = getTexts(locale).simpleVersion;

  return (
    <Section id="career" locale={locale}>
      <ol className={styles.list}>
        {getTable("career", locale).map((job) => (
          <li key={`${job.company}-${job.startDate}`} className={styles.item}>
            <h3>
              {job.role} · {job.company}
            </h3>
            <p className={styles.meta}>
              <CareerTime date={job.startDate} locale={locale} /> –{" "}
              {job.endDate ? (
                <CareerTime date={job.endDate} locale={locale} />
              ) : (
                text.present
              )}
            </p>
            <p>{job.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
