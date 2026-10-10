import { ENEMY_DYING_FRAMES, SYNTAX_ERROR, WATCHDOG } from "../balance";
import type { Enemy } from "../entities/enemy";
import type { Hero } from "../entities/hero";
import { headLine } from "../entities/watchdog";
import {
  CHARGE_KEYS,
  type Fin,
  type Look,
  MARCH,
  SYNTAX_ERROR_COLLAPSE,
  type SyntaxErrorPose,
  watchdogKey,
} from "./enemy-art";

export const MARCH_PIXELS = 4;
export const THROW_FRAMES = 12;
export const SQUIGGLE_FRAMES = 12;
export const BLINK_PERIOD = 220;
export const BLINK_FRAMES = 8;

const FIN_BAND = 2;
const LOOK_BAND = 6;
const BLINK_OFFSET = 37;

export function syntaxErrorPose(enemy: Enemy): SyntaxErrorPose {
  if (enemy.hurt > 0) {
    return "hurt";
  }
  if (enemy.state === "windup") {
    return enemy.timer > SYNTAX_ERROR.windupFrames / 2 ? "pull" : "raise";
  }
  const sinceThrow = SYNTAX_ERROR.cooldownFrames - enemy.cooldown;
  if (enemy.cooldown > 0 && sinceThrow < THROW_FRAMES) {
    return sinceThrow < THROW_FRAMES / 2 ? "throw" : "recoil";
  }
  return MARCH[Math.floor(Math.abs(enemy.x) / MARCH_PIXELS) % MARCH.length];
}

export function squigglePhase(
  enemy: Enemy,
  clock: number,
  reducedMotion: boolean,
): number {
  return reducedMotion
    ? 0
    : Math.floor((clock + enemy.home.column) / SQUIGGLE_FRAMES) % 2;
}

export function collapseStage(enemy: Enemy): number {
  const progress = 1 - enemy.dying / ENEMY_DYING_FRAMES;
  return Math.min(
    Math.floor(progress * SYNTAX_ERROR_COLLAPSE.length),
    SYNTAX_ERROR_COLLAPSE.length - 1,
  );
}

function finFor(enemy: Enemy, reducedMotion: boolean): Fin {
  const lift = enemy.y - enemy.baseY;
  if (reducedMotion || Math.abs(lift) <= FIN_BAND) {
    return "mid";
  }
  return lift < 0 ? "up" : "down";
}

function lookFor(enemy: Enemy, hero: Hero): Look {
  const gaze = headLine(hero) - (enemy.y + enemy.height / 2);
  if (Math.abs(gaze) <= LOOK_BAND) {
    return "ahead";
  }
  return gaze < 0 ? "up" : "down";
}

export function watchdogPose(
  enemy: Enemy,
  hero: Hero,
  clock: number,
  reducedMotion: boolean,
): string {
  if (enemy.hurt > 0) {
    return "hurt";
  }
  if (enemy.state === "charge") {
    const progress = 1 - enemy.timer / WATCHDOG.chargeFrames;
    return CHARGE_KEYS[
      Math.min(
        Math.floor(progress * CHARGE_KEYS.length),
        CHARGE_KEYS.length - 1,
      )
    ];
  }
  const fin = finFor(enemy, reducedMotion);
  const blinking =
    !reducedMotion &&
    (clock + enemy.home.column * BLINK_OFFSET) % BLINK_PERIOD < BLINK_FRAMES;
  return watchdogKey(fin, blinking ? "blink" : lookFor(enemy, hero));
}
