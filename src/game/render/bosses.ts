import { COLLECTOR } from "../balance";
import { VIEW_WIDTH } from "../core/camera";
import type { Box } from "../core/collision";
import { clamp } from "../core/math";
import type { World } from "../core/world";
import { type Boss, isFighting } from "../entities/boss";
import { type Collector, LANE_WIDTH, laneBox } from "../entities/collector";
import { centerX } from "../entities/enemy";
import type { Legacy } from "../entities/legacy";
import { COLORS } from "../palette";
import type { Art, Facing, RoomArt } from "./art";
import {
  collectorPose,
  collectorPresence,
  crumbleStage,
  legacyCommand,
  legacyFace,
  legacyPose,
  isGlowing,
  legacyPresence,
  markAlpha,
  reelStep,
} from "./boss-poses";
import { COLLECTOR_FRAME, CRUMBLE_FLOOR } from "./collector-art";
import { LEGACY_ART, LEGACY_FRAME, REELS, SCREEN } from "./legacy-art";

const GLOW_ALPHA = 0.5;
const LABEL_GAP = 6;
const LANE_FILL = 0.18;
const SWEEP_FILL = 0.35;
const SWEEP_LINE = 2;
const MARKER_HEIGHT = 2;
const HOTFIX_OFFSET = { x: 13, y: -3 } as const;
const LANE: Box = { x: 0, y: 0, width: 0, height: 0 };

function pick(facing: Facing, direction: number): HTMLCanvasElement {
  return direction > 0 ? facing[0] : facing[1];
}

function frameLeft(boss: Boss, frame: { width: number; left: number }): number {
  return boss.facing > 0
    ? Math.round(boss.x) - frame.left
    : Math.round(boss.x) - (frame.width - frame.left - boss.width);
}

function drawLanes(
  context: CanvasRenderingContext2D,
  world: World,
  boss: Collector,
  cameraX: number,
  cameraY: number,
): void {
  const sweeping = boss.state === "sweep";
  if (!sweeping && boss.state !== "mark") {
    return;
  }
  const progress = sweeping ? 1 - boss.timer / COLLECTOR.sweepFrames : 0;
  for (let lane = 0; lane < boss.lanes.length; lane++) {
    if (!boss.lanes[lane]) {
      continue;
    }
    laneBox(boss, lane, LANE);
    const x = LANE.x - cameraX;
    const y = LANE.y - cameraY;
    context.fillStyle = COLORS.string;
    context.globalAlpha = sweeping ? SWEEP_FILL : LANE_FILL;
    context.fillRect(x, y, LANE.width, LANE.height);
    context.globalAlpha = sweeping
      ? 1
      : markAlpha(world.frame, world.reducedMotion);
    context.fillStyle = COLORS.led;
    context.fillRect(x, y, LANE.width, 1);
    context.fillRect(x, y, 1, LANE.height);
    context.fillRect(x + LANE.width - 1, y, 1, LANE.height);
    context.fillRect(x, y + LANE.height - 1, LANE.width, 1);
    if (sweeping && !world.reducedMotion) {
      context.fillStyle = COLORS.white;
      context.fillRect(
        x + Math.round(progress * (LANE_WIDTH - SWEEP_LINE)),
        y,
        SWEEP_LINE,
        LANE.height,
      );
    }
  }
  context.globalAlpha = 1;
}

function drawSlash(
  context: CanvasRenderingContext2D,
  art: Art,
  boss: Collector,
  cameraX: number,
  cameraY: number,
): void {
  if (boss.state !== "slash") {
    return;
  }
  const image = pick(art.slashArc, boss.facing);
  const x = boss.facing > 0 ? centerX(boss) : centerX(boss) - image.width;
  context.globalAlpha = boss.timer / COLLECTOR.slashFrames;
  context.drawImage(
    image,
    Math.round(x) - cameraX,
    boss.floor - image.height - cameraY,
  );
  context.globalAlpha = 1;
}

function drawCollector(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  boss: Collector,
  cameraX: number,
  cameraY: number,
): void {
  drawLanes(context, world, boss, cameraX, cameraY);
  const x = frameLeft(boss, COLLECTOR_FRAME) - cameraX;
  if (boss.state === "defeat") {
    const stage = crumbleStage(boss, art.crumble.length);
    context.drawImage(
      art.crumble[stage],
      x,
      boss.floor - CRUMBLE_FLOOR - cameraY,
    );
    return;
  }
  const y = Math.round(boss.y) - COLLECTOR_FRAME.top - cameraY;
  const pose = collectorPose(boss, world.frame, world.reducedMotion);
  context.globalAlpha = collectorPresence(boss);
  context.drawImage(pick(art.collector[pose], boss.facing), x, y);
  if (isGlowing(boss)) {
    context.globalAlpha = GLOW_ALPHA;
    context.drawImage(pick(art.collectorGlow[pose], boss.facing), x, y);
  }
  context.globalAlpha = 1;
  drawSlash(context, art, boss, cameraX, cameraY);
}

function drawShrunk(
  context: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  x: number,
  y: number,
  presence: number,
  reducedMotion: boolean,
): void {
  if (reducedMotion || presence >= 1) {
    context.globalAlpha = presence;
    context.drawImage(image, x, y);
    context.globalAlpha = 1;
    return;
  }
  const height = Math.max(Math.round(image.height * presence), 1);
  const top = y + Math.round((image.height - height) / 2);
  context.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    x,
    top,
    image.width,
    height,
  );
  if (height <= 2) {
    const width = Math.round(image.width * presence * 2);
    context.fillStyle = COLORS.white;
    context.fillRect(x + Math.round((image.width - width) / 2), top, width, 1);
  }
}

function drawMarker(
  context: CanvasRenderingContext2D,
  world: World,
  boss: Legacy,
  cameraX: number,
  cameraY: number,
): void {
  if (boss.state !== "aim") {
    return;
  }
  const x = Math.round(boss.x) - cameraX;
  const y = boss.floor - MARKER_HEIGHT - cameraY;
  context.globalAlpha = markAlpha(world.frame, world.reducedMotion);
  context.fillStyle = COLORS.gold;
  context.fillRect(x, y, boss.width, MARKER_HEIGHT);
  context.fillRect(x, y - 4, 1, 4);
  context.fillRect(x + boss.width - 1, y - 4, 1, 4);
  context.globalAlpha = 1;
}

function drawCommand(
  context: CanvasRenderingContext2D,
  art: Art,
  boss: Legacy,
  cameraX: number,
  cameraY: number,
): void {
  const command = legacyCommand(boss);
  if (!command) {
    return;
  }
  const image = art.commands[command];
  const x = clamp(
    Math.round(centerX(boss) - image.width / 2) - cameraX,
    2,
    VIEW_WIDTH - image.width - 2,
  );
  const y = Math.round(boss.y) - LEGACY_FRAME.top - image.height - LABEL_GAP;
  context.drawImage(image, x, Math.max(y - cameraY, 2));
}

function drawLegacy(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  boss: Legacy,
  cameraX: number,
  cameraY: number,
): void {
  drawMarker(context, world, boss, cameraX, cameraY);
  const presence = legacyPresence(boss);
  if (presence > 0) {
    const pose = legacyPose(boss);
    const x = frameLeft(boss, LEGACY_FRAME) - cameraX;
    const y = Math.round(boss.y) - LEGACY_FRAME.top - cameraY;
    drawShrunk(
      context,
      pick(art.legacy[pose], boss.facing),
      x,
      y,
      presence,
      world.reducedMotion,
    );
    if (presence >= 1) {
      const [screenX, screenY] = LEGACY_ART[pose].screen;
      const faceX =
        boss.facing > 0 ? screenX : LEGACY_FRAME.width - screenX - SCREEN.width;
      context.drawImage(art.faces[legacyFace(boss)], x + faceX, y + screenY);
      if (boss.patched) {
        context.drawImage(
          art.hotfix,
          x + faceX + HOTFIX_OFFSET.x,
          y + screenY + HOTFIX_OFFSET.y,
        );
      }
      if (isGlowing(boss)) {
        context.globalAlpha = GLOW_ALPHA;
        context.drawImage(pick(art.legacyGlow[pose], boss.facing), x, y);
        context.globalAlpha = 1;
      }
    }
  }
  drawCommand(context, art, boss, cameraX, cameraY);
}

export function drawThroneReels(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  room: RoomArt,
  cameraX: number,
  cameraY: number,
): void {
  if (!room.throne) {
    return;
  }
  const { boss } = world.room;
  const legacy = boss?.kind === "legacy" ? boss : null;
  const reel =
    art.reels[
      reelStep(legacy, world.frame, world.reducedMotion, art.reels.length)
    ];
  for (const [x, y] of REELS) {
    context.drawImage(
      reel,
      room.throne.x + x - Math.floor(reel.width / 2) - cameraX,
      room.throne.y + y - Math.floor(reel.height / 2) - cameraY,
    );
  }
}

export function drawBoss(
  context: CanvasRenderingContext2D,
  world: World,
  art: Art,
  cameraX: number,
  cameraY: number,
): void {
  const { boss } = world.room;
  if (!boss || (!isFighting(boss) && boss.kind === "collector")) {
    return;
  }
  if (boss.kind === "collector") {
    drawCollector(context, world, art, boss, cameraX, cameraY);
  } else if (boss.state !== "gone") {
    drawLegacy(context, world, art, boss, cameraX, cameraY);
  }
}
