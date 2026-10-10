import type { Locale } from "@/content/locales";
import type { BossHud } from "../core/world";
import { BOSS_HEALTH } from "../entities/boss";
import type { Subweapon } from "../entities/hero";
import { pixelPath } from "./pixel-path";
import type { GameHud } from "./runtime";
import type { GameTexts } from "./texts";
import styles from "./game.module.css";

const RAM_WARNING = 50;
const RAM_CRITICAL = 80;
const FULL_UPTIME = 99.999;

const SUBWEAPON_ICONS: Readonly<Record<Subweapon, readonly string[]>> = {
  select: [
    "...X....",
    "...XX...",
    "XXXXXX..",
    "XXXXXXX.",
    "XXXXXX..",
    "...XX...",
    "...X....",
  ],
  join: [
    "X........X",
    "XX......XX",
    "XXX....XXX",
    "XXXX..XXXX",
    "XXXXXXXXXX",
    "XXXXXXXXXX",
    "XXXX..XXXX",
    "XXX....XXX",
    "XX......XX",
    "X........X",
  ],
  truncate: [
    "XXXXXXXXXX",
    "X.......XX",
    "XXXXXXXXXX",
    "X.....XX.X",
    "X....XX..X",
    "X...XX...X",
    "X..XX....X",
    "XXXXXXXXXX",
  ],
};

const SOUND_ICONS = {
  on: [
    "....X.....",
    "...XX..X..",
    "XXXXX...X.",
    "XXXXX.X.X.",
    "XXXXX.X.X.",
    "XXXXX...X.",
    "...XX..X..",
    "....X.....",
  ],
  off: [
    "....X.....",
    "...XX.....",
    "XXXXX.X..X",
    "XXXXX..XX.",
    "XXXXX..XX.",
    "XXXXX.X..X",
    "...XX.....",
    "....X.....",
  ],
} as const;

const CLOUD_ICON = [
  "....XXX.....",
  "..XXXXXX.XX.",
  ".XXXXXXXXXXX",
  "XXXXXXXXXXXX",
  "XXXXXXXXXXXX",
  ".XXXXXXXXXX.",
];

function PixelIcon({
  mask,
  className,
}: Readonly<{ mask: readonly string[]; className: string }>) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${mask[0].length} ${mask.length}`}
      width={mask[0].length * 2}
      height={mask.length * 2}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d={pixelPath(mask)} fill="currentColor" />
    </svg>
  );
}

function uptime(boss: BossHud, locale: Locale): string {
  const percent = (FULL_UPTIME * boss.health) / BOSS_HEALTH[boss.kind];
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(percent);
}

function BossBar({
  boss,
  text,
  locale,
}: Readonly<{ boss: BossHud | null; text: GameTexts; locale: Locale }>) {
  if (!boss) {
    return <div className={styles.bossBar} data-hidden />;
  }
  const max = BOSS_HEALTH[boss.kind];
  const legacy = boss.kind === "legacy";
  const value = legacy
    ? `${uptime(boss, locale)}%`
    : `${Math.round((100 * boss.health) / max)}%`;
  return (
    <div className={styles.bossBar}>
      <span className={styles.bossName}>{text.bosses[boss.kind]}</span>
      <label className={styles.stat}>
        {legacy ? text.hud.uptime : text.hud.heap}
        <meter
          className={`${styles.meter} ${styles.bossMeter}`}
          min={0}
          max={max}
          value={boss.health}
        />
        <span className={styles.value} aria-hidden="true">
          {value}
        </span>
      </label>
    </div>
  );
}

export function Hud({
  hud,
  text,
  locale,
  hidden,
}: Readonly<{
  hud: GameHud;
  text: GameTexts;
  locale: Locale;
  hidden: boolean;
}>) {
  const labels = text.hud;

  return (
    <div className={styles.hud} data-hidden={hidden || undefined}>
      <span className={styles.player}>{labels.player}</span>
      <label className={styles.stat}>
        {labels.ram}
        <meter
          className={styles.meter}
          min={0}
          max={100}
          low={RAM_WARNING}
          high={RAM_CRITICAL}
          optimum={0}
          value={hud.ram}
        />
        <span className={styles.value} aria-hidden="true">
          {hud.ram}%
        </span>
      </label>
      <span className={styles.stat}>
        {labels.energy}
        <span className={styles.subweapon} data-subweapon={hud.subweapon}>
          <PixelIcon
            mask={SUBWEAPON_ICONS[hud.subweapon]}
            className={styles.icon}
          />
          {text.subweapons[hud.subweapon]}
        </span>
        <span className={styles.value}>
          {String(hud.energy).padStart(2, "0")}
        </span>
      </span>
      <span className={styles.stat}>
        <PixelIcon
          mask={CLOUD_ICON}
          className={hud.cloudReady ? styles.cloud : styles.cloudCharging}
        />
        {labels.cloud}
        <span className="visually-hidden">
          {hud.cloudReady ? labels.cloudReady : labels.cloudCharging}
        </span>
      </span>
      <span className={styles.hint}>
        <kbd className={styles.key}>M</kbd>
        <PixelIcon
          mask={hud.muted ? SOUND_ICONS.off : SOUND_ICONS.on}
          className={hud.muted ? styles.cloudCharging : styles.cloud}
        />
        {labels.sound}
        <span className="visually-hidden">
          : {hud.muted ? labels.soundOff : labels.soundOn}
        </span>
      </span>
      <span className={styles.hint}>
        <kbd className={styles.key}>P</kbd> {labels.pause}
      </span>
      <span className={styles.hint}>
        <kbd className={styles.key}>Esc</kbd> {labels.exit}
      </span>
      <BossBar boss={hud.boss} text={text} locale={locale} />
    </div>
  );
}
