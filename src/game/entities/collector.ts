import { BOSS_HURT_FRAMES, COLLECTOR } from "../balance";
import type { Box } from "../core/collision";
import { approach, clamp } from "../core/math";
import { random } from "../core/random";
import { type Cell, type Level, TILE } from "../levels/level";
import type { BossEvent, BossSurroundings } from "./boss";
import { centerX } from "./enemy";
import type { Hero } from "./hero";
import { burst } from "./particles";

export type CollectorState =
  | "dormant"
  | "intro"
  | "hover"
  | "windup"
  | "slash"
  | "recover"
  | "rise"
  | "mark"
  | "sweep"
  | "defeat"
  | "gone";

export interface Collector extends Box {
  kind: "collector";
  home: Cell;
  floor: number;
  left: number;
  right: number;
  trigger: number;
  state: CollectorState;
  timer: number;
  health: number;
  facing: 1 | -1;
  hurt: number;
  struck: number;
  hitToken: number;
  cycle: number;
  baseY: number;
  bob: number;
  lanes: boolean[];
}

const COLLECTOR_SIZE = { width: 22, height: 34 } as const;
export const LANE_WIDTH = COLLECTOR.laneTiles * TILE;

const TRIGGER_TILES = 3;
const GROUND_GAP = 2;
const MARK_HEIGHT = 2 * TILE;
const MARK_SPEED = 2.4;
const ATTACKS_PER_MARK = 3;
const DEFEAT_SPARK_FRAMES = 9;

const VULNERABLE: ReadonlySet<CollectorState> = new Set([
  "hover",
  "windup",
  "slash",
  "recover",
  "rise",
  "mark",
  "sweep",
]);

function hoverY(boss: Collector): number {
  return boss.floor - COLLECTOR.hoverHeight - boss.height;
}

function groundY(boss: Collector): number {
  return boss.floor - GROUND_GAP - boss.height;
}

function isHurried(boss: Collector): boolean {
  return boss.health <= COLLECTOR.health / 2;
}

export function createCollector(home: Cell, level: Level): Collector {
  const left = TILE;
  const right = level.width - TILE;
  const boss: Collector = {
    kind: "collector",
    home,
    floor: (level.start.row + 1) * TILE,
    left,
    right,
    trigger: (level.start.column + TRIGGER_TILES) * TILE,
    x: 0,
    y: 0,
    width: COLLECTOR_SIZE.width,
    height: COLLECTOR_SIZE.height,
    state: "dormant",
    timer: 0,
    health: 0,
    facing: -1,
    hurt: 0,
    struck: 0,
    hitToken: 0,
    cycle: 0,
    baseY: 0,
    bob: 0,
    lanes: Array.from(
      { length: Math.floor((right - left) / LANE_WIDTH) },
      () => false,
    ),
  };
  resetCollector(boss);
  return boss;
}

export function resetCollector(boss: Collector): void {
  boss.x = boss.home.column * TILE + TILE / 2 - boss.width / 2;
  boss.baseY = hoverY(boss);
  boss.y = boss.baseY;
  boss.state = "dormant";
  boss.timer = 0;
  boss.health = 0;
  boss.facing = -1;
  boss.hurt = 0;
  boss.struck = 0;
  boss.hitToken = 0;
  boss.cycle = 0;
  boss.bob = 0;
  boss.lanes.fill(false);
}

function face(boss: Collector, hero: Hero): void {
  boss.facing = centerX(hero) >= centerX(boss) ? 1 : -1;
}

function float(boss: Collector): void {
  boss.bob += 1;
  boss.y =
    boss.baseY +
    Math.sin((boss.bob * 2 * Math.PI) / COLLECTOR.bobFrames) *
      COLLECTOR.bobHeight;
}

function hoverFrames(boss: Collector): number {
  return isHurried(boss) ? COLLECTOR.hurriedHoverFrames : COLLECTOR.hoverFrames;
}

function startHover(boss: Collector): void {
  boss.state = "hover";
  boss.timer = hoverFrames(boss);
}

export function laneOf(boss: Collector, x: number): number {
  return clamp(
    Math.floor((x - boss.left) / LANE_WIDTH),
    0,
    boss.lanes.length - 1,
  );
}

function markLanes(boss: Collector, surroundings: BossSurroundings): void {
  boss.lanes.fill(false);
  boss.lanes[laneOf(boss, centerX(surroundings.hero))] = true;
  const wanted = Math.min(
    isHurried(boss) ? COLLECTOR.hurriedLanes : COLLECTOR.lanes,
    boss.lanes.length - 1,
  );
  let marked = 1;
  while (marked < wanted) {
    const lane = Math.floor(random(surroundings) * boss.lanes.length);
    if (!boss.lanes[lane]) {
      boss.lanes[lane] = true;
      marked += 1;
    }
  }
}

function attack(boss: Collector, surroundings: BossSurroundings): void {
  boss.cycle += 1;
  if (boss.cycle % ATTACKS_PER_MARK === 0) {
    boss.state = "mark";
    boss.timer = COLLECTOR.markFrames;
    markLanes(boss, surroundings);
    return;
  }
  boss.state = "windup";
  boss.timer = isHurried(boss)
    ? COLLECTOR.hurriedWindupFrames
    : COLLECTOR.windupFrames;
}

function wake(boss: Collector, hero: Hero): BossEvent | null {
  if (centerX(hero) < boss.trigger) {
    return null;
  }
  boss.state = "intro";
  boss.timer = COLLECTOR.introFrames;
  return "awake";
}

function introduce(boss: Collector, hero: Hero): void {
  boss.timer -= 1;
  boss.health = Math.round(
    COLLECTOR.health * (1 - boss.timer / COLLECTOR.introFrames),
  );
  face(boss, hero);
  float(boss);
  if (boss.timer <= 0) {
    boss.health = COLLECTOR.health;
    startHover(boss);
  }
}

function hover(boss: Collector, surroundings: BossSurroundings): void {
  const { hero } = surroundings;
  face(boss, hero);
  const target = clamp(
    centerX(hero) - boss.facing * COLLECTOR.keepAway - boss.width / 2,
    boss.left,
    boss.right - boss.width,
  );
  boss.x = approach(boss.x, target, COLLECTOR.driftSpeed);
  boss.baseY = approach(boss.baseY, hoverY(boss), COLLECTOR.climbSpeed);
  float(boss);
  boss.timer -= 1;
  if (boss.timer <= 0) {
    attack(boss, surroundings);
  }
}

function windUp(boss: Collector, hero: Hero): void {
  face(boss, hero);
  const target = clamp(
    centerX(hero) -
      boss.facing * (COLLECTOR.slashGap + boss.width / 2) -
      boss.width / 2,
    boss.left,
    boss.right - boss.width,
  );
  boss.x = approach(boss.x, target, COLLECTOR.approachSpeed);
  boss.baseY = approach(boss.baseY, groundY(boss), COLLECTOR.climbSpeed);
  boss.y = boss.baseY;
  boss.timer -= 1;
  if (boss.timer <= 0) {
    boss.state = "slash";
    boss.timer = COLLECTOR.slashFrames;
  }
}

function slash(boss: Collector): void {
  boss.timer -= 1;
  if (boss.timer <= 0) {
    boss.state = "recover";
    boss.timer = isHurried(boss)
      ? COLLECTOR.hurriedRecoverFrames
      : COLLECTOR.recoverFrames;
  }
}

function recover(boss: Collector): void {
  boss.timer -= 1;
  if (boss.timer <= 0) {
    boss.state = "rise";
  }
}

function rise(boss: Collector): void {
  boss.baseY = approach(boss.baseY, hoverY(boss), COLLECTOR.climbSpeed);
  boss.y = boss.baseY;
  if (boss.baseY === hoverY(boss)) {
    startHover(boss);
  }
}

function mark(boss: Collector): void {
  const middle = (boss.left + boss.right) / 2 - boss.width / 2;
  boss.x = approach(boss.x, middle, MARK_SPEED);
  boss.baseY = approach(boss.baseY, MARK_HEIGHT, MARK_SPEED);
  float(boss);
  boss.timer -= 1;
  if (boss.timer <= 0) {
    boss.state = "sweep";
    boss.timer = COLLECTOR.sweepFrames;
  }
}

function sweep(boss: Collector): void {
  float(boss);
  boss.timer -= 1;
  if (boss.timer <= 0) {
    boss.lanes.fill(false);
    startHover(boss);
  }
}

function crumble(
  boss: Collector,
  surroundings: BossSurroundings,
): BossEvent | null {
  boss.timer -= 1;
  if (boss.timer % DEFEAT_SPARK_FRAMES === 0) {
    burst(
      surroundings.particles,
      surroundings,
      boss.timer % (2 * DEFEAT_SPARK_FRAMES) === 0 ? "data" : "ember",
      boss.x + random(surroundings) * boss.width,
      boss.y + random(surroundings) * boss.height,
      5,
    );
  }
  if (boss.timer > 0) {
    return null;
  }
  boss.state = "gone";
  return "freed";
}

export function updateCollector(
  boss: Collector,
  surroundings: BossSurroundings,
): BossEvent | null {
  boss.hurt = Math.max(boss.hurt - 1, 0);
  switch (boss.state) {
    case "dormant":
      return wake(boss, surroundings.hero);
    case "intro":
      introduce(boss, surroundings.hero);
      return null;
    case "hover":
      hover(boss, surroundings);
      return null;
    case "windup":
      windUp(boss, surroundings.hero);
      return null;
    case "slash":
      slash(boss);
      return null;
    case "recover":
      recover(boss);
      return null;
    case "rise":
      rise(boss);
      return null;
    case "mark":
      mark(boss);
      return null;
    case "sweep":
      sweep(boss);
      return null;
    case "defeat":
      return crumble(boss, surroundings);
    case "gone":
      return null;
  }
}

export function isCollectorVulnerable(boss: Collector): boolean {
  return VULNERABLE.has(boss.state);
}

export function damageCollector(boss: Collector, amount: number): void {
  boss.health = Math.max(boss.health - amount, 0);
  if (boss.hurt === 0) {
    boss.hurt = BOSS_HURT_FRAMES;
  }
  if (boss.health === 0) {
    boss.state = "defeat";
    boss.timer = COLLECTOR.defeatFrames;
    boss.lanes.fill(false);
  }
}

export function slashBox(boss: Collector, box: Box): boolean {
  if (boss.state !== "slash") {
    return false;
  }
  box.width = COLLECTOR.slashReach;
  box.height = COLLECTOR.slashHeight;
  box.x =
    boss.facing > 0 ? centerX(boss) : centerX(boss) - COLLECTOR.slashReach;
  box.y = boss.floor - COLLECTOR.slashHeight;
  return true;
}

export function laneBox(boss: Collector, lane: number, box: Box): void {
  box.x = boss.left + lane * LANE_WIDTH;
  box.y = boss.floor - COLLECTOR.sweepHeight;
  box.width = LANE_WIDTH;
  box.height = COLLECTOR.sweepHeight;
}
