import { BOSS_HURT_FRAMES, LEGACY } from "../balance";
import type { Box } from "../core/collision";
import { approach, clamp } from "../core/math";
import { random } from "../core/random";
import { type Cell, type Level, TILE } from "../levels/level";
import type { BossEvent, BossSurroundings } from "./boss";
import { type Enemy, centerX, isFree, summon } from "./enemy";
import type { Hero } from "./hero";
import { burst } from "./particles";
import { PROJECTILE_SIZE, launch } from "./projectiles";

export type LegacyState =
  | "dormant"
  | "intro"
  | "throne"
  | "perform"
  | "call"
  | "vanish"
  | "hidden"
  | "appear"
  | "aim"
  | "dive"
  | "recover"
  | "rollback"
  | "commit"
  | "gone";

export type LegacyMove = "perform" | "goto" | "call";

export interface Legacy extends Box {
  kind: "legacy";
  home: Cell;
  floor: number;
  left: number;
  right: number;
  trigger: number;
  state: LegacyState;
  timer: number;
  health: number;
  facing: 1 | -1;
  hurt: number;
  struck: number;
  hitToken: number;
  cycle: number;
  patched: boolean;
  seated: boolean;
  thrown: number;
  dives: number;
  vy: number;
  fromX: number;
  fromY: number;
}

const LEGACY_SIZE = { width: 26, height: 56 } as const;

export const MOVES: readonly LegacyMove[] = ["perform", "goto", "call"];
export const PATCHED_MOVES: readonly LegacyMove[] = [
  "goto",
  "perform",
  "goto",
  "call",
];

export const CARD_LANES = [16, 6, 24] as const;

const TRIGGER_TILES = 3;
const TRACK_SPEED = 1.2;
const COMMIT_SPARK_FRAMES = 8;
const DUST = 10;

const VULNERABLE: ReadonlySet<LegacyState> = new Set([
  "throne",
  "perform",
  "call",
  "aim",
  "dive",
  "recover",
]);

function seatX(boss: Legacy): number {
  return boss.home.column * TILE + TILE / 2 - boss.width / 2;
}

function groundY(boss: Legacy): number {
  return boss.floor - boss.height;
}

function sit(boss: Legacy): void {
  boss.x = seatX(boss);
  boss.y = groundY(boss);
  boss.seated = true;
}

export function createLegacy(home: Cell, level: Level): Legacy {
  const boss: Legacy = {
    kind: "legacy",
    home,
    floor: (level.start.row + 1) * TILE,
    left: TILE,
    right: level.width - TILE,
    trigger: (level.start.column + TRIGGER_TILES) * TILE,
    x: 0,
    y: 0,
    width: LEGACY_SIZE.width,
    height: LEGACY_SIZE.height,
    state: "dormant",
    timer: 0,
    health: 0,
    facing: -1,
    hurt: 0,
    struck: 0,
    hitToken: 0,
    cycle: 0,
    patched: false,
    seated: true,
    thrown: 0,
    dives: 0,
    vy: 0,
    fromX: 0,
    fromY: 0,
  };
  resetLegacy(boss);
  return boss;
}

export function resetLegacy(boss: Legacy): void {
  sit(boss);
  boss.state = "dormant";
  boss.timer = 0;
  boss.health = 0;
  boss.facing = -1;
  boss.hurt = 0;
  boss.struck = 0;
  boss.hitToken = 0;
  boss.cycle = 0;
  boss.patched = false;
  boss.thrown = 0;
  boss.dives = 0;
  boss.vy = 0;
}

function face(boss: Legacy, hero: Hero): void {
  boss.facing = centerX(hero) >= centerX(boss) ? 1 : -1;
}

function settle(boss: Legacy): void {
  boss.state = "throne";
  boss.timer = boss.patched ? LEGACY.patchedThroneFrames : LEGACY.throneFrames;
}

export function movesOf(boss: Legacy): readonly LegacyMove[] {
  return boss.patched ? PATCHED_MOVES : MOVES;
}

function freeSlots(enemies: readonly Enemy[]): number {
  let free = 0;
  for (const enemy of enemies) {
    if (isFree(enemy)) {
      free += 1;
    }
  }
  return free;
}

function begin(boss: Legacy, move: LegacyMove): void {
  switch (move) {
    case "perform":
      boss.state = "perform";
      boss.thrown = 0;
      boss.timer = LEGACY.cardGap;
      return;
    case "call":
      boss.state = "call";
      boss.timer = LEGACY.callFrames;
      return;
    case "goto":
      boss.state = "vanish";
      boss.timer = LEGACY.vanishFrames;
      boss.dives = 0;
      return;
  }
}

function choose(boss: Legacy, surroundings: BossSurroundings): void {
  const moves = movesOf(boss);
  const move = moves[boss.cycle % moves.length];
  boss.cycle += 1;
  const crowded = move === "call" && freeSlots(surroundings.room.enemies) === 0;
  begin(boss, crowded ? "perform" : move);
}

function wake(boss: Legacy, hero: Hero): BossEvent | null {
  if (centerX(hero) < boss.trigger) {
    return null;
  }
  boss.state = "intro";
  boss.timer = LEGACY.introFrames;
  return "awake";
}

function introduce(boss: Legacy): void {
  boss.timer -= 1;
  boss.health = Math.round(
    LEGACY.health * (1 - boss.timer / LEGACY.introFrames),
  );
  if (boss.timer <= 0) {
    boss.health = LEGACY.health;
    settle(boss);
  }
}

function rest(boss: Legacy, surroundings: BossSurroundings): void {
  face(boss, surroundings.hero);
  boss.timer -= 1;
  if (boss.timer <= 0) {
    choose(boss, surroundings);
  }
}

export function cardsPerPerform(boss: Legacy): number {
  return (
    (boss.patched ? LEGACY.patchedVolleys : LEGACY.volleys) *
    LEGACY.cardsPerVolley
  );
}

export function cardLane(thrown: number): number {
  const volley = Math.floor(thrown / LEGACY.cardsPerVolley);
  return CARD_LANES[(thrown + volley) % CARD_LANES.length];
}

function throwCard(boss: Legacy, surroundings: BossSurroundings): void {
  const { width, height } = PROJECTILE_SIZE.card;
  const speed = boss.patched ? LEGACY.patchedCardSpeed : LEGACY.cardSpeed;
  launch(surroundings.projectiles, {
    kind: "card",
    x: boss.facing > 0 ? boss.x + boss.width : boss.x - width,
    y: boss.floor - cardLane(boss.thrown) - height / 2,
    vx: boss.facing * speed,
    vy: 0,
    facing: boss.facing,
    variant: boss.thrown % 2,
    token: 0,
  });
  boss.thrown += 1;
}

function perform(boss: Legacy, surroundings: BossSurroundings): void {
  face(boss, surroundings.hero);
  boss.timer -= 1;
  if (boss.timer > 0) {
    return;
  }
  if (boss.thrown >= cardsPerPerform(boss)) {
    settle(boss);
    return;
  }
  throwCard(boss, surroundings);
  boss.timer =
    boss.thrown % LEGACY.cardsPerVolley === 0
      ? LEGACY.volleyGap
      : LEGACY.cardGap;
}

function farthestFree(enemies: readonly Enemy[], hero: Hero): Enemy | null {
  let chosen: Enemy | null = null;
  let distance = -1;
  for (const enemy of enemies) {
    const gap = Math.abs(enemy.home.column * TILE - centerX(hero));
    if (isFree(enemy) && gap > distance) {
      chosen = enemy;
      distance = gap;
    }
  }
  return chosen;
}

function callSyntaxErrors(boss: Legacy, surroundings: BossSurroundings): void {
  const calls = boss.patched ? LEGACY.patchedCalls : LEGACY.calls;
  for (let call = 0; call < calls; call++) {
    const enemy = farthestFree(surroundings.room.enemies, surroundings.hero);
    if (!enemy) {
      return;
    }
    summon(enemy);
    burst(
      surroundings.particles,
      surroundings,
      "data",
      centerX(enemy),
      enemy.y + enemy.height / 2,
      10,
    );
  }
}

function call(boss: Legacy, surroundings: BossSurroundings): void {
  face(boss, surroundings.hero);
  boss.timer -= 1;
  if (boss.timer === Math.floor(LEGACY.callFrames / 2)) {
    callSyntaxErrors(boss, surroundings);
  }
  if (boss.timer <= 0) {
    settle(boss);
  }
}

export function divesOf(boss: Legacy): number {
  return boss.patched ? LEGACY.patchedDives : LEGACY.dives;
}

function vanish(boss: Legacy): void {
  boss.timer -= 1;
  if (boss.timer <= 0) {
    boss.state = "hidden";
    boss.timer = LEGACY.hiddenFrames;
    boss.seated = false;
  }
}

function reappear(boss: Legacy, hero: Hero): void {
  boss.timer -= 1;
  if (boss.timer > 0) {
    return;
  }
  if (boss.dives >= divesOf(boss)) {
    sit(boss);
  } else {
    boss.x = clamp(
      centerX(hero) - boss.width / 2,
      boss.left,
      boss.right - boss.width,
    );
    boss.y = groundY(boss) - LEGACY.diveHeight;
  }
  face(boss, hero);
  boss.state = "appear";
  boss.timer = LEGACY.appearFrames;
}

function appear(boss: Legacy): void {
  boss.timer -= 1;
  if (boss.timer > 0) {
    return;
  }
  if (boss.seated) {
    settle(boss);
    return;
  }
  boss.state = "aim";
  boss.timer = boss.patched ? LEGACY.patchedAimFrames : LEGACY.aimFrames;
}

function aim(boss: Legacy, hero: Hero): void {
  boss.timer -= 1;
  if (boss.patched && boss.timer > LEGACY.patchedAimFrames / 2) {
    const target = clamp(
      centerX(hero) - boss.width / 2,
      boss.left,
      boss.right - boss.width,
    );
    boss.x = approach(boss.x, target, TRACK_SPEED);
  }
  if (boss.timer <= 0) {
    boss.state = "dive";
    boss.vy = 0;
  }
}

function dive(boss: Legacy, surroundings: BossSurroundings): BossEvent | null {
  boss.vy = Math.min(boss.vy + LEGACY.diveGravity, LEGACY.maxDiveSpeed);
  boss.y += boss.vy;
  if (boss.y < groundY(boss)) {
    return null;
  }
  boss.y = groundY(boss);
  boss.vy = 0;
  boss.dives += 1;
  boss.state = "recover";
  boss.timer = boss.patched
    ? LEGACY.patchedRecoverFrames
    : LEGACY.recoverFrames;
  burst(
    surroundings.particles,
    surroundings,
    "bone",
    centerX(boss),
    boss.floor - 2,
    DUST,
  );
  return "landing";
}

function recover(boss: Legacy, hero: Hero): void {
  face(boss, hero);
  boss.timer -= 1;
  if (boss.timer <= 0) {
    boss.state = "vanish";
    boss.timer = LEGACY.vanishFrames;
  }
}

function rewind(boss: Legacy): void {
  boss.timer -= 1;
  const progress = 1 - boss.timer / LEGACY.rollbackFrames;
  boss.x = boss.fromX + (seatX(boss) - boss.fromX) * progress;
  boss.y = boss.fromY + (groundY(boss) - boss.fromY) * progress;
  boss.health = Math.round(LEGACY.rollbackHealth * progress);
  if (boss.timer <= 0) {
    sit(boss);
    boss.health = LEGACY.rollbackHealth;
    boss.patched = true;
    boss.cycle = 0;
    settle(boss);
  }
}

function commit(
  boss: Legacy,
  surroundings: BossSurroundings,
): BossEvent | null {
  boss.timer -= 1;
  if (boss.timer % COMMIT_SPARK_FRAMES === 0) {
    burst(
      surroundings.particles,
      surroundings,
      "card",
      boss.x + random(surroundings) * boss.width,
      boss.y + random(surroundings) * boss.height,
      4,
    );
  }
  if (boss.timer > 0) {
    return null;
  }
  boss.state = "gone";
  return "finished";
}

export function updateLegacy(
  boss: Legacy,
  surroundings: BossSurroundings,
): BossEvent | null {
  boss.hurt = Math.max(boss.hurt - 1, 0);
  switch (boss.state) {
    case "dormant":
      return wake(boss, surroundings.hero);
    case "intro":
      introduce(boss);
      return null;
    case "throne":
      rest(boss, surroundings);
      return null;
    case "perform":
      perform(boss, surroundings);
      return null;
    case "call":
      call(boss, surroundings);
      return null;
    case "vanish":
      vanish(boss);
      return null;
    case "hidden":
      reappear(boss, surroundings.hero);
      return null;
    case "appear":
      appear(boss);
      return null;
    case "aim":
      aim(boss, surroundings.hero);
      return null;
    case "dive":
      return dive(boss, surroundings);
    case "recover":
      recover(boss, surroundings.hero);
      return null;
    case "rollback":
      rewind(boss);
      return null;
    case "commit":
      return commit(boss, surroundings);
    case "gone":
      return null;
  }
}

export function isLegacyVulnerable(boss: Legacy): boolean {
  return VULNERABLE.has(boss.state);
}

export function damageLegacy(boss: Legacy, amount: number): BossEvent | null {
  boss.health = Math.max(boss.health - amount, 0);
  if (boss.hurt === 0) {
    boss.hurt = BOSS_HURT_FRAMES;
  }
  if (boss.health > 0) {
    return null;
  }
  boss.vy = 0;
  if (boss.patched) {
    boss.state = "commit";
    boss.timer = LEGACY.commitFrames;
    return "committed";
  }
  boss.state = "rollback";
  boss.timer = LEGACY.rollbackFrames;
  boss.fromX = boss.x;
  boss.fromY = boss.y;
  boss.seated = false;
  return "rollback";
}
