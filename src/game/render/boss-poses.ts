import {
  BOSS_GLOW_FRAMES,
  BOSS_HURT_FRAMES,
  COLLECTOR,
  LEGACY,
} from "../balance";
import type { Boss } from "../entities/boss";
import type { Collector } from "../entities/collector";
import { type Legacy, divesOf } from "../entities/legacy";
import type { CollectorPoseName } from "./collector-art";
import type { Command, Face, LegacyPoseName } from "./legacy-art";

export const FLOAT_FRAMES = 20;
const REEL_STEP_FRAMES = 12;
const REWIND_STEP_FRAMES = 4;
export const MARK_PULSE_FRAMES = 40;
const QUAKE_STEP = 2;
const QUAKE_HEIGHT = 2;

export function isGlowing(boss: Boss): boolean {
  return boss.hurt > BOSS_HURT_FRAMES - BOSS_GLOW_FRAMES;
}

export function collectorPose(
  boss: Collector,
  clock: number,
  reducedMotion: boolean,
): CollectorPoseName {
  switch (boss.state) {
    case "windup":
      return "raise";
    case "slash":
      return "slash";
    case "recover":
      return "recover";
    case "mark":
    case "sweep":
      return "mark";
    default:
      if (isGlowing(boss)) {
        return "hurt";
      }
      return reducedMotion || Math.floor(clock / FLOAT_FRAMES) % 2 === 0
        ? "float1"
        : "float2";
  }
}

export function crumbleStage(boss: Collector, stages: number): number {
  const progress = 1 - boss.timer / COLLECTOR.defeatFrames;
  return Math.min(Math.floor(progress * stages), stages - 1);
}

export function collectorPresence(boss: Collector): number {
  return boss.state === "intro" ? 1 - boss.timer / COLLECTOR.introFrames : 1;
}

export function markAlpha(clock: number, reducedMotion: boolean): number {
  return reducedMotion
    ? 0.8
    : 0.55 + 0.3 * Math.sin((clock * 2 * Math.PI) / MARK_PULSE_FRAMES);
}

export function legacyPose(boss: Legacy): LegacyPoseName {
  switch (boss.state) {
    case "perform":
    case "call":
      return "cast";
    case "aim":
    case "dive":
      return "dive";
    case "recover":
      return "recover";
    case "appear":
      return boss.seated ? "seated" : "dive";
    case "vanish":
    case "rollback":
    case "commit":
      return boss.seated ? "seated" : "standing";
    default:
      return "seated";
  }
}

export function legacyFace(boss: Legacy): Face {
  if (isGlowing(boss)) {
    return "hurt";
  }
  switch (boss.state) {
    case "dormant":
      return "off";
    case "intro":
      return "boot";
    case "rollback":
      return "rewind";
    case "commit":
    case "gone":
      return "commit";
    default:
      return boss.patched ? "patched" : "idle";
  }
}

export function legacyCommand(boss: Legacy): Command | null {
  switch (boss.state) {
    case "perform":
      return "perform";
    case "call":
      return "call";
    case "vanish":
      return boss.dives < divesOf(boss) ? "goto" : null;
    case "rollback":
      return "rollback";
    case "commit":
      return "commit";
    default:
      return null;
  }
}

export function legacyPresence(boss: Legacy): number {
  switch (boss.state) {
    case "vanish":
      return boss.timer / LEGACY.vanishFrames;
    case "hidden":
    case "gone":
      return 0;
    case "appear":
      return 1 - boss.timer / LEGACY.appearFrames;
    case "commit":
      return boss.timer / LEGACY.commitFrames;
    default:
      return 1;
  }
}

export function reelStep(
  boss: Legacy | null,
  clock: number,
  reducedMotion: boolean,
  frames: number,
): number {
  if (
    reducedMotion ||
    !boss ||
    boss.state === "dormant" ||
    boss.state === "gone"
  ) {
    return 0;
  }
  if (boss.state === "rollback") {
    return frames - 1 - (Math.floor(clock / REWIND_STEP_FRAMES) % frames);
  }
  return Math.floor(clock / REEL_STEP_FRAMES) % frames;
}

export function quakeOffset(quake: number, reducedMotion: boolean): number {
  if (quake === 0 || reducedMotion) {
    return 0;
  }
  return Math.floor(quake / QUAKE_STEP) % 2 === 0
    ? QUAKE_HEIGHT
    : -QUAKE_HEIGHT;
}
