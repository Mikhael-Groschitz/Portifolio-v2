import type { Notice, World } from "./world";

const NOTICE_FRAMES = 180;

export function announce(world: World, notice: Notice): void {
  world.notice = notice;
  world.notices += 1;
  world.noticeFrames = NOTICE_FRAMES;
}
