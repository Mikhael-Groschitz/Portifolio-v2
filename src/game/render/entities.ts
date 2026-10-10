import { ENEMY_DYING_FRAMES } from "../balance";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../core/camera";
import type { Box } from "../core/collision";
import { SWEEP_FRAMES } from "../core/combat";
import type { World } from "../core/world";
import { type Enemy, ENEMY_HEALTH } from "../entities/enemy";
import type { Spark } from "../entities/particles";
import type { Projectile } from "../entities/projectiles";
import { COLORS, PALETTE } from "../palette";
import type { Art, Facing } from "./art";
import {
  SQUIGGLE_OFFSET,
  SYNTAX_ERROR_FRAME,
  WATCHDOG_FRAME,
} from "./enemy-art";
import {
  collapseStage,
  squigglePhase,
  syntaxErrorPose,
  watchdogPose,
} from "./enemy-poses";
import { SPARK_PAINT } from "./item-art";

const MARGIN = 32;
const DYING_FALL = 0.5;
const BOB_FRAMES = 20;
const BOB_HEIGHT = 1.5;
const SPIN_FRAMES = 4;
const SWEEP_TRAIL = 8;
const TRAIL_ALPHA = 0.4;

const SPARK_COLORS: Readonly<Record<Spark, string>> = {
  bone: COLORS[PALETTE[SPARK_PAINT.bone]],
  plastic: COLORS[PALETTE[SPARK_PAINT.plastic]],
  glass: COLORS[PALETTE[SPARK_PAINT.glass]],
  data: COLORS[PALETTE[SPARK_PAINT.data]],
  ember: COLORS[PALETTE[SPARK_PAINT.ember]],
  impact: COLORS[PALETTE[SPARK_PAINT.impact]],
  card: COLORS[PALETTE[SPARK_PAINT.card]],
};

function visible(box: Box, cameraX: number, cameraY: number): boolean {
  return (
    box.x + box.width > cameraX - MARGIN &&
    box.x < cameraX + VIEW_WIDTH + MARGIN &&
    box.y + box.height > cameraY - MARGIN &&
    box.y < cameraY + VIEW_HEIGHT + MARGIN
  );
}

function pick(facing: Facing, direction: number): HTMLCanvasElement {
  return direction > 0 ? facing[0] : facing[1];
}

function drawCentered(
  context: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  box: Box,
  cameraX: number,
  cameraY: number,
  lift = 0,
): void {
  context.drawImage(
    image,
    Math.round(box.x + box.width / 2 - image.width / 2) - cameraX,
    Math.round(box.y + box.height / 2 - image.height / 2 + lift) - cameraY,
  );
}

function bob(world: World, offset: number): number {
  return world.reducedMotion
    ? 0
    : Math.sin((world.frame + offset) / BOB_FRAMES) * BOB_HEIGHT;
}

function drawSyntaxError(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  enemy: Enemy,
  cameraX: number,
  cameraY: number,
): void {
  const x = Math.round(enemy.x) - SYNTAX_ERROR_FRAME.left - cameraX;
  const y = Math.round(enemy.y) - SYNTAX_ERROR_FRAME.top - cameraY;
  if (!enemy.alive) {
    context.drawImage(
      pick(art.collapse[collapseStage(enemy)], enemy.facing),
      x,
      y,
    );
    return;
  }
  context.drawImage(
    art.squiggle[squigglePhase(enemy, world.frame, world.reducedMotion)],
    x + SQUIGGLE_OFFSET.x,
    y + SQUIGGLE_OFFSET.y,
  );
  const frames =
    enemy.health < ENEMY_HEALTH.syntaxError
      ? art.syntaxErrorDamaged
      : art.syntaxError;
  context.drawImage(pick(frames[syntaxErrorPose(enemy)], enemy.facing), x, y);
}

function drawWatchdog(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  enemy: Enemy,
  cameraX: number,
  cameraY: number,
): void {
  const x = Math.round(enemy.x) - WATCHDOG_FRAME.left - cameraX;
  const y = Math.round(enemy.y) - WATCHDOG_FRAME.top - cameraY;
  if (!enemy.alive) {
    const fall = world.reducedMotion
      ? 0
      : Math.round((ENEMY_DYING_FRAMES - enemy.dying) * DYING_FALL);
    context.globalAlpha = enemy.dying / ENEMY_DYING_FRAMES;
    context.drawImage(
      pick(art.watchdogDamaged.hurt, enemy.facing),
      x,
      y + fall,
    );
    context.globalAlpha = 1;
    return;
  }
  const frames =
    enemy.health < ENEMY_HEALTH.watchdog ? art.watchdogDamaged : art.watchdog;
  const pose = watchdogPose(
    enemy,
    world.hero,
    world.frame,
    world.reducedMotion,
  );
  context.drawImage(pick(frames[pose], enemy.facing), x, y);
}

export function drawEnemies(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  cameraX: number,
  cameraY: number,
): void {
  for (const enemy of world.room.enemies) {
    const shown = enemy.alive || enemy.dying > 0;
    if (!shown || !visible(enemy, cameraX, cameraY)) {
      continue;
    }
    if (enemy.kind === "syntaxError") {
      drawSyntaxError(context, world, art, enemy, cameraX, cameraY);
    } else {
      drawWatchdog(context, world, art, enemy, cameraX, cameraY);
    }
  }
}

export function drawItems(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  cameraX: number,
  cameraY: number,
): void {
  for (const relic of world.room.relics) {
    if (relic.taken || !visible(relic, cameraX, cameraY)) {
      continue;
    }
    const image = art.relics[relic.kind];
    context.drawImage(
      image,
      Math.round(relic.x + relic.width / 2 - image.width / 2) - cameraX,
      Math.round(relic.y + relic.height + 1 - image.height) - cameraY,
    );
  }
  for (const container of world.room.containers) {
    if (!container.broken && visible(container, cameraX, cameraY)) {
      drawCentered(
        context,
        art.containers[container.kind],
        container,
        cameraX,
        cameraY,
        bob(world, container.x),
      );
    }
  }
  for (const drop of world.drops) {
    if (drop.active) {
      drawCentered(context, art.drops[drop.kind], drop, cameraX, cameraY);
    }
  }
}

function projectileImage(
  projectile: Projectile,
  world: World,
  art: Art,
): HTMLCanvasElement {
  switch (projectile.kind) {
    case "select":
      return pick(art.select, projectile.facing);
    case "join":
      return art.join[
        world.reducedMotion
          ? 0
          : Math.floor(projectile.age / SPIN_FRAMES) % art.join.length
      ];
    case "glyph":
      return art.glyphs[projectile.variant];
    case "beam":
      return art.beams[projectile.variant];
    case "card":
      return art.cards[projectile.variant];
  }
}

export function drawProjectiles(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  cameraX: number,
  cameraY: number,
): void {
  for (const projectile of world.projectiles) {
    if (projectile.active) {
      drawCentered(
        context,
        projectileImage(projectile, world, art),
        projectile,
        cameraX,
        cameraY,
      );
    }
  }
}

export function drawParticles(
  context: CanvasRenderingContext2D,
  world: World,
  cameraX: number,
  cameraY: number,
): void {
  for (const particle of world.particles) {
    if (particle.active) {
      context.fillStyle = SPARK_COLORS[particle.spark];
      context.fillRect(
        Math.round(particle.x) - cameraX,
        Math.round(particle.y) - cameraY,
        2,
        2,
      );
    }
  }
}

export function drawSweep(context: CanvasRenderingContext2D, world: World) {
  if (world.sweep === 0 || world.reducedMotion) {
    return;
  }
  const x = Math.round((1 - world.sweep / SWEEP_FRAMES) * VIEW_WIDTH);
  context.fillStyle = COLORS.string;
  context.globalAlpha = TRAIL_ALPHA;
  context.fillRect(x - SWEEP_TRAIL - 1, 0, SWEEP_TRAIL, VIEW_HEIGHT);
  context.globalAlpha = 1;
  context.fillRect(x - 1, 0, 3, VIEW_HEIGHT);
}
