import {
  CAST_FRAMES,
  CLOUD,
  HURT,
  MOVEMENT,
  QUERY_ENERGY,
  RAM,
  WHIP,
} from "../balance";
import {
  type Body,
  type Box,
  hitsSolid,
  moveBody,
  standsOnLedge,
} from "../core/collision";
import { type Cell, type Level, TILE } from "../levels/level";

const HERO_WIDTH = 12;
export const HERO_HEIGHT = 28;
const HAND_HEIGHT = 11;

export const LASH_FRAMES =
  WHIP.windupFrames + WHIP.activeFrames + WHIP.recoverFrames;

const EXTEND_FRAMES = 2;
const LASH_THICKNESS = 7;
const CROUCH_DROP = HERO_HEIGHT - MOVEMENT.crouchHeight;

export type Subweapon = "select" | "join" | "truncate";

export interface Controls {
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  attackPressed: boolean;
  subweaponPressed: boolean;
  switchPressed: boolean;
}

export const NO_CONTROLS: Readonly<Controls> = {
  left: false,
  right: false,
  down: false,
  jump: false,
  jumpPressed: false,
  attackPressed: false,
  subweaponPressed: false,
  switchPressed: false,
};

export interface Hero extends Body {
  facing: 1 | -1;
  coyote: number;
  jumpBuffer: number;
  lash: number;
  lashes: number;
  stun: number;
  invulnerable: number;
  crouching: boolean;
  dropThrough: number;
  cloud: number;
  cloudCooldown: number;
  cast: number;
  ram: number;
  energy: number;
  subweapons: Subweapon[];
  subweapon: number;
  stride: number;
}

export type HeroPose =
  | "idle"
  | "walk"
  | "jump"
  | "fall"
  | "windup"
  | "strike"
  | "hurt"
  | "crouch"
  | "crouchStrike"
  | "cast"
  | "cloud";

const STANDING: Box = { x: 0, y: 0, width: HERO_WIDTH, height: HERO_HEIGHT };

export function createHero(cell: Cell): Hero {
  const hero: Hero = {
    x: 0,
    y: 0,
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    vx: 0,
    vy: 0,
    grounded: true,
    facing: 1,
    coyote: 0,
    jumpBuffer: 0,
    lash: -1,
    lashes: 0,
    stun: 0,
    invulnerable: 0,
    crouching: false,
    dropThrough: 0,
    cloud: 0,
    cloudCooldown: 0,
    cast: 0,
    ram: RAM.start,
    energy: QUERY_ENERGY.start,
    subweapons: ["select"],
    subweapon: 0,
    stride: 0,
  };
  placeHero(hero, cell);
  return hero;
}

export function placeHero(hero: Hero, cell: Cell): void {
  hero.height = HERO_HEIGHT;
  hero.x = cell.column * TILE + (TILE - HERO_WIDTH) / 2;
  hero.y = (cell.row + 1) * TILE - HERO_HEIGHT;
  hero.vx = 0;
  hero.vy = 0;
  hero.grounded = true;
  hero.facing = 1;
  hero.coyote = 0;
  hero.jumpBuffer = 0;
  hero.lash = -1;
  hero.stun = 0;
  hero.invulnerable = 0;
  hero.crouching = false;
  hero.dropThrough = 0;
  hero.cloud = 0;
  hero.cloudCooldown = 0;
  hero.cast = 0;
  hero.stride = 0;
}

function standUp(hero: Hero, level: Level): void {
  if (!hero.crouching) {
    return;
  }
  STANDING.x = hero.x;
  STANDING.y = hero.y - CROUCH_DROP;
  if (hitsSolid(level, STANDING)) {
    return;
  }
  hero.y = STANDING.y;
  hero.height = HERO_HEIGHT;
  hero.crouching = false;
}

function crouch(hero: Hero, controls: Controls, level: Level): void {
  const wants =
    controls.down && hero.grounded && hero.stun === 0 && hero.cloud === 0;
  if (wants && !hero.crouching) {
    hero.y += CROUCH_DROP;
    hero.height = MOVEMENT.crouchHeight;
    hero.crouching = true;
  } else if (!wants) {
    standUp(hero, level);
  }
}

function advanceLash(hero: Hero, controls: Controls): void {
  if (hero.lash >= 0) {
    hero.lash = hero.lash + 1 < LASH_FRAMES ? hero.lash + 1 : -1;
  }
  if (
    hero.lash < 0 &&
    controls.attackPressed &&
    hero.stun === 0 &&
    hero.cloud === 0 &&
    hero.cast === 0
  ) {
    hero.lash = 0;
    hero.lashes += 1;
  }
}

function turn(hero: Hero, direction: number): void {
  if (direction !== 0) {
    hero.facing = direction > 0 ? 1 : -1;
  }
}

function steer(hero: Hero, controls: Controls): void {
  const direction = Number(controls.right) - Number(controls.left);
  if (hero.stun > 0 || hero.lash >= 0 || hero.crouching) {
    if (hero.grounded) {
      hero.vx = 0;
    }
    if (hero.crouching && hero.lash < 0) {
      turn(hero, direction);
    }
    return;
  }
  hero.vx = direction * (hero.cloud > 0 ? CLOUD.speed : MOVEMENT.walkSpeed);
  turn(hero, direction);
}

function endCloud(hero: Hero): void {
  hero.cloud = 0;
  hero.cloudCooldown = CLOUD.cooldownFrames;
}

function canGlide(hero: Hero): boolean {
  return (
    !hero.grounded &&
    hero.coyote === 0 &&
    hero.cloud === 0 &&
    hero.cloudCooldown === 0 &&
    !hero.crouching
  );
}

function jump(hero: Hero, controls: Controls, level: Level): void {
  hero.coyote = hero.grounded
    ? MOVEMENT.coyoteFrames
    : Math.max(hero.coyote - 1, 0);
  hero.jumpBuffer = controls.jumpPressed
    ? MOVEMENT.jumpBufferFrames
    : Math.max(hero.jumpBuffer - 1, 0);
  if (hero.stun > 0) {
    return;
  }
  if (controls.jumpPressed && hero.crouching && standsOnLedge(level, hero)) {
    hero.dropThrough = MOVEMENT.dropThroughFrames;
    hero.jumpBuffer = 0;
    hero.coyote = 0;
    return;
  }
  if (hero.jumpBuffer > 0 && hero.coyote > 0 && hero.lash < 0) {
    standUp(hero, level);
    if (!hero.crouching) {
      hero.vy = -MOVEMENT.jumpSpeed;
      hero.coyote = 0;
      hero.jumpBuffer = 0;
    }
  } else if (controls.jumpPressed && canGlide(hero)) {
    hero.cloud = CLOUD.frames;
    hero.jumpBuffer = 0;
    hero.lash = -1;
  }
  if (hero.cloud === 0 && !controls.jump && hero.vy < -MOVEMENT.jumpCutSpeed) {
    hero.vy = -MOVEMENT.jumpCutSpeed;
  }
}

function glide(hero: Hero, controls: Controls): void {
  if (hero.cloud === 0) {
    hero.cloudCooldown = Math.max(hero.cloudCooldown - 1, 0);
    return;
  }
  hero.cloud -= 1;
  if (hero.cloud === 0 || !controls.jump) {
    endCloud(hero);
  }
}

export function updateHero(hero: Hero, controls: Controls, level: Level): void {
  hero.invulnerable = Math.max(hero.invulnerable - 1, 0);
  hero.stun = Math.max(hero.stun - 1, 0);
  hero.cast = Math.max(hero.cast - 1, 0);
  hero.dropThrough = Math.max(hero.dropThrough - 1, 0);
  crouch(hero, controls, level);
  advanceLash(hero, controls);
  steer(hero, controls);
  jump(hero, controls, level);
  glide(hero, controls);
  hero.vy =
    hero.cloud > 0
      ? CLOUD.fallSpeed
      : Math.min(hero.vy + MOVEMENT.gravity, MOVEMENT.maxFallSpeed);
  moveBody(level, hero, hero.dropThrough === 0);
  if (hero.grounded && hero.cloud > 0) {
    endCloud(hero);
  }
  hero.stride = hero.grounded && hero.vx !== 0 ? hero.stride + 1 : 0;
}

export function hurtHero(hero: Hero, amount: number, fromX: number): boolean {
  if (hero.invulnerable > 0) {
    return false;
  }
  const away = fromX > hero.x + hero.width / 2 ? -1 : 1;
  if (hero.cloud > 0) {
    endCloud(hero);
  }
  hero.ram = Math.min(hero.ram + amount, RAM.crash);
  hero.invulnerable = HURT.invulnerableFrames;
  hero.stun = HURT.stunFrames;
  hero.lash = -1;
  hero.facing = away > 0 ? -1 : 1;
  hero.vx = away * HURT.knockbackSpeed;
  hero.vy = -HURT.knockbackLift;
  hero.grounded = false;
  return true;
}

export function isCrashed(hero: Hero): boolean {
  return hero.ram >= RAM.crash;
}

export function lashReach(lash: number): number {
  const strike = lash - WHIP.windupFrames;
  if (lash < 0 || strike < 0) {
    return 0;
  }
  if (strike < WHIP.activeFrames) {
    return (WHIP.reach * Math.min(strike + 1, EXTEND_FRAMES)) / EXTEND_FRAMES;
  }
  const recovered = strike - WHIP.activeFrames + 1;
  return WHIP.reach * Math.max(1 - recovered / WHIP.recoverFrames, 0);
}

export function handY(hero: Hero): number {
  return hero.y + HAND_HEIGHT;
}

export function lashBox(hero: Hero, box: Box): boolean {
  const strike = hero.lash - WHIP.windupFrames;
  if (hero.lash < 0 || strike < 0 || strike >= WHIP.activeFrames) {
    return false;
  }
  const reach = lashReach(hero.lash);
  box.width = reach;
  box.height = LASH_THICKNESS;
  box.x = hero.facing > 0 ? hero.x + hero.width : hero.x - reach;
  box.y = handY(hero) - Math.floor(LASH_THICKNESS / 2);
  return true;
}

export function activeSubweapon(hero: Hero): Subweapon {
  return hero.subweapons[hero.subweapon];
}

export function cycleSubweapon(hero: Hero): boolean {
  if (hero.subweapons.length < 2) {
    return false;
  }
  hero.subweapon = (hero.subweapon + 1) % hero.subweapons.length;
  return true;
}

export function grantSubweapon(hero: Hero, subweapon: Subweapon): void {
  if (!hero.subweapons.includes(subweapon)) {
    hero.subweapons.push(subweapon);
  }
  hero.subweapon = hero.subweapons.indexOf(subweapon);
}

export function startCast(hero: Hero): void {
  hero.cast = CAST_FRAMES;
}

function lashPose(hero: Hero): HeroPose {
  const striking = hero.lash >= WHIP.windupFrames;
  if (hero.crouching) {
    return striking ? "crouchStrike" : "crouch";
  }
  return striking ? "strike" : "windup";
}

export function heroPose(hero: Hero): HeroPose {
  if (hero.stun > 0) {
    return "hurt";
  }
  if (hero.cloud > 0) {
    return "cloud";
  }
  if (hero.lash >= 0) {
    return lashPose(hero);
  }
  if (hero.crouching) {
    return "crouch";
  }
  if (hero.cast > 0) {
    return "cast";
  }
  if (!hero.grounded) {
    return hero.vy < 0 ? "jump" : "fall";
  }
  return hero.vx !== 0 ? "walk" : "idle";
}
