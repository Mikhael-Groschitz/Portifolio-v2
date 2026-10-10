import { PASSAGE_FRAMES, QUERY_ENERGY, RAM } from "../balance";
import {
  type Boss,
  type BossKind,
  createBoss,
  isCleared,
  isFighting,
  isVulnerable,
  resetBoss,
} from "../entities/boss";
import {
  type Enemy,
  centerX,
  createEnemies,
  resetEnemy,
} from "../entities/enemy";
import {
  type Controls,
  type Hero,
  type Subweapon,
  activeSubweapon,
  createHero,
  hurtHero,
  isCrashed,
  placeHero,
  updateHero,
} from "../entities/hero";
import {
  type Container,
  type Drop,
  type Relic,
  createContainers,
  createDrops,
  createRelics,
  updateDrops,
} from "../entities/items";
import {
  type Particle,
  createParticles,
  updateParticles,
} from "../entities/particles";
import {
  type Projectile,
  createProjectiles,
  moveProjectile,
} from "../entities/projectiles";
import { updateSyntaxError } from "../entities/syntax-error";
import { updateWatchdog } from "../entities/watchdog";
import { type Cell, type Level, TILE } from "../levels/level";
import { hitBoss, moveBoss } from "./bosses";
import {
  type Camera,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  aimCamera,
  descend,
} from "./camera";
import { type Box, overlaps } from "./collision";
import { fireSubweapon, resolveCombat } from "./combat";
import { type Cues, createCues, cue } from "./cues";
import { announce } from "./notices";
import { clearPool } from "./pool";

export type Mode =
  "title" | "intro" | "playing" | "paused" | "crash" | "victory";

export type Notice =
  | "join"
  | "truncate"
  | "switch"
  | BossKind
  | "freed"
  | "rollback"
  | "soundOn"
  | "soundOff";

export const INTRO_FRAMES = 300;
export const STILL_INTRO_FRAMES = 90;
export const INTRO_RISE = 220;

const AWAKE_MARGIN = 48;
const CHECKPOINT_REACH = 3 * TILE;
const DOORWAY = { inset: 8, width: 16, rows: 3 } as const;

export interface Room {
  index: number;
  level: Level;
  doorway: Box | null;
  enemies: Enemy[];
  containers: Container[];
  relics: Relic[];
  boss: Boss | null;
}

export interface Checkpoint {
  room: number;
  cell: Cell;
  mark: number;
}

export interface World {
  rooms: readonly Room[];
  room: Room;
  hero: Hero;
  camera: Camera;
  mode: Mode;
  reducedMotion: boolean;
  seed: number;
  frame: number;
  intro: number;
  playFrames: number;
  checkpoint: Checkpoint;
  restY: number;
  tokens: number;
  drops: Drop[];
  projectiles: Projectile[];
  particles: Particle[];
  sweep: number;
  quake: number;
  passage: number;
  notice: Notice | null;
  notices: number;
  noticeFrames: number;
  muted: boolean;
  cues: Cues;
}

export interface BossHud {
  kind: BossKind;
  health: number;
}

export interface Hud {
  mode: Mode;
  ram: number;
  energy: number;
  subweapon: Subweapon;
  cloudReady: boolean;
  notice: Notice | null;
  notices: number;
  boss: BossHud | null;
  muted: boolean;
}

function doorwayOf({ exit }: Level): Box | null {
  return (
    exit && {
      x: exit.column * TILE + DOORWAY.inset,
      y: (exit.row + 1 - DOORWAY.rows) * TILE,
      width: DOORWAY.width,
      height: DOORWAY.rows * TILE,
    }
  );
}

function createRoom(level: Level, index: number): Room {
  return {
    index,
    level,
    doorway: doorwayOf(level),
    enemies: createEnemies(level),
    containers: createContainers(level),
    relics: createRelics(level),
    boss: createBoss(level),
  };
}

function frameHero(world: World): void {
  world.camera.y = world.room.level.height - VIEW_HEIGHT;
  aimCamera(world.camera, world.room.level, world.hero);
}

export function createWorld(
  levels: readonly Level[],
  {
    reducedMotion,
    seed = 1,
    muted = false,
  }: Readonly<{ reducedMotion: boolean; seed?: number; muted?: boolean }>,
): World {
  const rooms = levels.map(createRoom);
  const [first] = rooms;
  if (!first) {
    throw new Error("The stage needs at least one room");
  }
  const world: World = {
    rooms,
    room: first,
    hero: createHero(first.level.start),
    camera: { x: 0, y: 0 },
    mode: "title",
    reducedMotion,
    seed,
    frame: 0,
    intro: 0,
    playFrames: 0,
    checkpoint: { room: 0, cell: first.level.start, mark: -1 },
    restY: 0,
    tokens: 0,
    drops: createDrops(),
    projectiles: createProjectiles(),
    particles: createParticles(),
    sweep: 0,
    quake: 0,
    passage: 0,
    notice: null,
    notices: 0,
    noticeFrames: 0,
    muted,
    cues: createCues(),
  };
  frameHero(world);
  world.restY = world.camera.y;
  world.camera.y = world.restY - INTRO_RISE;
  return world;
}

function introLength(world: World): number {
  return world.reducedMotion ? STILL_INTRO_FRAMES : INTRO_FRAMES;
}

export function introProgress(world: World): number {
  if (world.mode === "title") {
    return 0;
  }
  return world.mode === "intro" ? world.intro / introLength(world) : 1;
}

function finishIntro(world: World): void {
  world.mode = "playing";
  frameHero(world);
}

export function startIntro(world: World): void {
  if (world.mode === "title") {
    world.mode = "intro";
    world.intro = 0;
  }
}

export function skipIntro(world: World): void {
  if (world.mode === "intro") {
    finishIntro(world);
  }
}

function advanceIntro(world: World): void {
  world.intro += 1;
  const progress = introProgress(world);
  const skyY = world.restY - INTRO_RISE;
  if (world.reducedMotion) {
    world.camera.y = progress < 0.5 ? skyY : world.restY;
  } else {
    world.camera.y = descend(skyY, world.restY, progress);
  }
  if (world.intro >= introLength(world)) {
    finishIntro(world);
  }
}

function setCheckpoint(world: World, cell: Cell, mark: number): void {
  world.checkpoint.room = world.room.index;
  world.checkpoint.cell = cell;
  world.checkpoint.mark = mark;
}

function reachCheckpoints(world: World): void {
  const { hero, checkpoint } = world;
  const places = world.room.level.places.checkpoint;
  const feet = hero.y + hero.height;
  for (let mark = checkpoint.mark + 1; mark < places.length; mark++) {
    const cell = places[mark];
    if (
      centerX(hero) >= cell.column * TILE &&
      Math.abs(feet - (cell.row + 1) * TILE) <= CHECKPOINT_REACH
    ) {
      setCheckpoint(world, cell, mark);
    }
  }
}

function checkCrash(world: World): void {
  if (world.mode === "playing" && isCrashed(world.hero)) {
    world.mode = "crash";
  }
}

function isAwake(world: World, enemy: Enemy): boolean {
  const middleX = world.camera.x + VIEW_WIDTH / 2;
  const middleY = world.camera.y + VIEW_HEIGHT / 2;
  return (
    Math.abs(centerX(enemy) - middleX) < VIEW_WIDTH / 2 + AWAKE_MARGIN &&
    Math.abs(enemy.y + enemy.height / 2 - middleY) <
      VIEW_HEIGHT / 2 + AWAKE_MARGIN
  );
}

function moveEnemies(world: World): void {
  for (const enemy of world.room.enemies) {
    if (!enemy.alive) {
      enemy.dying = Math.max(enemy.dying - 1, 0);
      continue;
    }
    if (!isAwake(world, enemy)) {
      continue;
    }
    if (enemy.kind === "syntaxError") {
      updateSyntaxError(enemy, world);
    } else {
      updateWatchdog(enemy, world);
    }
  }
}

function moveProjectiles(world: World): void {
  for (const projectile of world.projectiles) {
    if (projectile.active) {
      moveProjectile(projectile, world.room.level, world.hero);
    }
  }
}

export function isOpen(room: Room): boolean {
  return room.boss === null || isCleared(room.boss);
}

function resetRoom(world: World, room: Room): void {
  for (const enemy of room.enemies) {
    resetEnemy(enemy);
  }
  for (const container of room.containers) {
    container.broken = false;
  }
  if (room.boss && !isCleared(room.boss)) {
    resetBoss(room.boss);
  }
  clearPool(world.drops);
  clearPool(world.projectiles);
  clearPool(world.particles);
  world.sweep = 0;
  world.quake = 0;
  world.noticeFrames = 0;
}

function enterRoom(world: World, room: Room, cell: Cell): void {
  world.room = room;
  resetRoom(world, room);
  placeHero(world.hero, cell);
  frameHero(world);
}

function nextRoom(world: World): Room | null {
  return world.rooms[world.room.index + 1] ?? null;
}

function enterDoor(world: World): void {
  const { room, hero } = world;
  if (
    room.doorway &&
    isOpen(room) &&
    nextRoom(world) &&
    overlaps(hero, room.doorway)
  ) {
    world.passage = PASSAGE_FRAMES;
    cue(world, "door");
  }
}

function advancePassage(world: World): void {
  world.passage -= 1;
  const next = nextRoom(world);
  if (world.passage === PASSAGE_FRAMES / 2 && next) {
    enterRoom(world, next, next.level.start);
    setCheckpoint(world, next.level.start, -1);
  }
}

export function passageProgress(world: World): number {
  return world.passage > 0 ? 1 - world.passage / PASSAGE_FRAMES : 0;
}

function play(world: World, controls: Controls): void {
  world.playFrames += 1;
  if (world.passage > 0) {
    advancePassage(world);
    return;
  }
  const { hero, room } = world;
  const { lashes, cloud } = hero;
  updateHero(hero, controls, room.level);
  if (hero.lashes > lashes) {
    cue(world, "whip");
  }
  if (cloud === 0 && hero.cloud > 0) {
    cue(world, "cloud");
  }
  fireSubweapon(world, controls);
  moveEnemies(world);
  moveBoss(world);
  moveProjectiles(world);
  updateDrops(world.drops, room.level);
  updateParticles(world.particles);
  resolveCombat(world);
  world.sweep = Math.max(world.sweep - 1, 0);
  world.quake = Math.max(world.quake - 1, 0);
  world.noticeFrames = Math.max(world.noticeFrames - 1, 0);
  reachCheckpoints(world);
  enterDoor(world);
  aimCamera(world.camera, room.level, hero);
  checkCrash(world);
}

export function step(world: World, controls: Controls): void {
  if (world.mode === "intro") {
    advanceIntro(world);
  } else if (world.mode === "playing") {
    play(world, controls);
  } else if (world.mode !== "title") {
    return;
  }
  world.frame += 1;
}

export function pause(world: World): void {
  if (world.mode === "playing") {
    world.mode = "paused";
  }
}

export function resume(world: World): void {
  if (world.mode === "paused") {
    world.mode = "playing";
  }
}

export function retry(world: World): void {
  if (world.mode !== "crash") {
    return;
  }
  const { hero, checkpoint } = world;
  enterRoom(world, world.rooms[checkpoint.room], checkpoint.cell);
  hero.ram = RAM.start;
  hero.energy = Math.max(hero.energy, QUERY_ENERGY.start);
  world.passage = 0;
  world.mode = "playing";
}

export function overload(world: World): void {
  if (world.mode !== "playing") {
    return;
  }
  const { hero } = world;
  hurtHero(hero, RAM.devOverload, hero.x + hero.width / 2 + hero.facing);
  checkCrash(world);
}

export function toggleSound(world: World): void {
  world.muted = !world.muted;
  announce(world, world.muted ? "soundOff" : "soundOn");
}

export function skipAhead(world: World): void {
  if (world.mode !== "playing" || world.passage > 0) {
    return;
  }
  const { boss, level } = world.room;
  if (boss && !isCleared(boss)) {
    if (isVulnerable(boss)) {
      hitBoss(world, boss, boss.health);
    }
    return;
  }
  if (level.exit) {
    placeHero(world.hero, level.exit);
  }
}

function cloudReady(hero: Hero): boolean {
  return hero.cloud === 0 && hero.cloudCooldown === 0;
}

function currentNotice(world: World): Notice | null {
  return world.noticeFrames > 0 ? world.notice : null;
}

function shownBoss(world: World): Boss | null {
  const { boss } = world.room;
  return boss && isFighting(boss) ? boss : null;
}

export function hudOf(world: World): Hud {
  const { hero } = world;
  const boss = shownBoss(world);
  return {
    mode: world.mode,
    ram: Math.round(hero.ram),
    energy: hero.energy,
    subweapon: activeSubweapon(hero),
    cloudReady: cloudReady(hero),
    notice: currentNotice(world),
    notices: world.notices,
    boss: boss && { kind: boss.kind, health: boss.health },
    muted: world.muted,
  };
}

function bossMatches(shown: BossHud | null, boss: Boss | null): boolean {
  if (shown === null || boss === null) {
    return shown === null && boss === null;
  }
  return shown.kind === boss.kind && shown.health === boss.health;
}

export function hudMatches(hud: Hud, world: World): boolean {
  const { hero } = world;
  return (
    hud.mode === world.mode &&
    hud.ram === Math.round(hero.ram) &&
    hud.energy === hero.energy &&
    hud.subweapon === activeSubweapon(hero) &&
    hud.cloudReady === cloudReady(hero) &&
    hud.notice === currentNotice(world) &&
    hud.notices === world.notices &&
    hud.muted === world.muted &&
    bossMatches(hud.boss, shownBoss(world))
  );
}
