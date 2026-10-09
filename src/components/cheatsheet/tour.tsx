"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/components/locale/language-context";
import { COMPACT_MEDIA_QUERY } from "@/components/shell/breakpoints";
import { useShell } from "@/components/shell/shell-frame";
import { useMediaQuery } from "@/components/shell/use-media-query";
import type { Localized } from "@/content/locales";
import type { TourStepId, TourText } from "@/content/types";
import { TOUR_STEPS, useGuide } from "./guide-context";
import { type CardPosition, type Placement, placeCard } from "./tour-placement";
import styles from "./tour.module.css";

const CARD_WIDTH = 320;
const SIDE_MARGIN = 24;

interface StepLayout {
  target: string;
  placement: Placement;
}

interface CardPlacement extends CardPosition {
  width: number;
}

function layoutOf(
  step: TourStepId,
  compact: boolean,
  explorerOpen: boolean,
): StepLayout {
  if (step === "tables") {
    return compact && !explorerOpen
      ? { target: '[data-tour="explorer-toggle"]', placement: "below" }
      : {
          target: '[data-node-id="tables"]',
          placement: compact ? "below" : "right",
        };
  }
  if (step === "results") {
    return { target: '[data-tour="results"]', placement: "above" };
  }
  return { target: '[data-tour="new-query"]', placement: "below" };
}

interface TourCardProps {
  step: TourStepId;
  index: number;
  text: TourText;
  compact: boolean;
  explorerOpen: boolean;
}

function TourCard({
  step,
  index,
  text,
  compact,
  explorerOpen,
}: Readonly<TourCardProps>) {
  const { nextTourStep, finishTour } = useGuide();
  const [position, setPosition] = useState<CardPlacement | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const focused = useRef(false);
  const titleId = useId();
  const bodyId = useId();
  const { target: selector, placement } = layoutOf(step, compact, explorerOpen);

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(selector);
    target?.setAttribute("data-tour-target", "");
    target?.scrollIntoView({ block: "nearest" });
    let frame = 0;
    function measure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = Math.min(CARD_WIDTH, window.innerWidth - SIDE_MARGIN);
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        const box = target?.getBoundingClientRect() ?? null;
        setPosition({ ...placeCard(box, viewport, placement, width), width });
      });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      target?.removeAttribute("data-tour-target");
    };
  }, [selector, placement]);

  useEffect(() => {
    if (position && !focused.current) {
      focused.current = true;
      primaryRef.current?.focus({ preventScroll: true });
    }
  }, [position]);

  useEffect(() => {
    function skipOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        finishTour();
      }
    }
    document.addEventListener("keydown", skipOnEscape);
    return () => document.removeEventListener("keydown", skipOnEscape);
  }, [finishTour]);

  if (!position) {
    return null;
  }

  const last = index === TOUR_STEPS.length - 1;
  const body =
    step === "tables" && compact && !explorerOpen
      ? text.compactTablesText
      : text.steps[step].text;

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className={styles.card}
      style={position}
    >
      <p className={styles.progress}>
        {text.progress
          .replace("{current}", String(index + 1))
          .replace("{total}", String(TOUR_STEPS.length))}
      </p>
      <h2 id={titleId} className={styles.title}>
        {text.steps[step].title}
      </h2>
      <p id={bodyId} className={styles.text}>
        {body}
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={finishTour}>
          {text.skip}
        </button>
        <button
          ref={primaryRef}
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={nextTourStep}
        >
          {last ? text.done : text.next}
        </button>
      </div>
    </section>
  );
}

export function Tour({ text }: Readonly<{ text: Localized<TourText> }>) {
  const { tourIndex } = useGuide();
  const { locale } = useLanguage();
  const { explorerOpen } = useShell();
  const compact = useMediaQuery(COMPACT_MEDIA_QUERY);

  if (tourIndex === null) {
    return null;
  }

  const step = TOUR_STEPS[tourIndex];
  return (
    <TourCard
      key={step}
      step={step}
      index={tourIndex}
      text={text[locale]}
      compact={compact}
      explorerOpen={explorerOpen}
    />
  );
}
