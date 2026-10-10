import { CUES, type Cues } from "../core/cues";
import type { Mode, World } from "../core/world";
import { chooseTrack } from "./director";
import { createNoise, playEffect } from "./effects";
import {
  type MusicPlayer,
  type PlayerFactory,
  createOrganPlayer,
} from "./organ-player";
import { createReverb } from "./reverb";
import type { TrackName } from "./tracks";

export const VOLUME = 0.5;

const MIX = {
  music: 0.9,
  effects: 0.8,
  musicReverb: 0.5,
  effectsReverb: 0.12,
} as const;

const COMPRESSOR = {
  threshold: -18,
  knee: 12,
  ratio: 3,
  attack: 0.01,
  release: 0.25,
} as const;

const START_DELAY = 0.05;
const MUTE_SMOOTHING = 0.03;

const AUDIBLE_MODES: ReadonlySet<Mode> = new Set([
  "intro",
  "playing",
  "crash",
  "victory",
]);

interface Graph {
  context: AudioContext;
  master: GainNode;
  effects: GainNode;
  player: MusicPlayer;
  noise: AudioBuffer;
}

export interface GameAudio {
  start: () => void;
  sync: (world: World) => void;
  close: () => void;
}

export type ContextFactory = () => AudioContext | null;

export interface AudioOptions {
  createContext?: ContextFactory;
  createPlayer?: PlayerFactory;
}

function browserContext(): AudioContext | null {
  try {
    return new AudioContext({ latencyHint: "interactive" });
  } catch {
    return null;
  }
}

function send(
  context: AudioContext,
  from: AudioNode,
  to: AudioNode,
  level: number,
): void {
  const gain = context.createGain();
  gain.gain.value = level;
  from.connect(gain).connect(to);
}

function bus(context: AudioContext, output: AudioNode, level: number) {
  const gain = context.createGain();
  gain.gain.value = level;
  gain.connect(output);
  return gain;
}

function build(
  context: AudioContext,
  muted: boolean,
  createPlayer: PlayerFactory,
): Graph {
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = COMPRESSOR.threshold;
  compressor.knee.value = COMPRESSOR.knee;
  compressor.ratio.value = COMPRESSOR.ratio;
  compressor.attack.value = COMPRESSOR.attack;
  compressor.release.value = COMPRESSOR.release;
  compressor.connect(context.destination);
  const master = bus(context, compressor, muted ? 0 : VOLUME);
  const reverb = createReverb(context);
  reverb.connect(master);
  const music = bus(context, master, MIX.music);
  send(context, music, reverb, MIX.musicReverb);
  const effects = bus(context, master, MIX.effects);
  send(context, effects, reverb, MIX.effectsReverb);
  return {
    context,
    master,
    effects,
    player: createPlayer(context, music),
    noise: createNoise(context),
  };
}

function clearCues(cues: Cues): void {
  for (const name of CUES) {
    cues[name] = 0;
  }
}

export function createGameAudio({
  createContext = browserContext,
  createPlayer = createOrganPlayer,
}: AudioOptions = {}): GameAudio {
  let graph: Graph | null = null;
  let current: TrackName | null = null;
  let requested: AudioContextState | null = null;
  let muted = false;

  function setRunning(target: Graph, audible: boolean): void {
    const state: AudioContextState = audible ? "running" : "suspended";
    if (state === requested) {
      return;
    }
    requested = state;
    const change = audible ? target.context.resume() : target.context.suspend();
    change.catch(() => {
      requested = null;
    });
  }

  function setMuted(target: Graph, value: boolean): void {
    if (value === muted) {
      return;
    }
    muted = value;
    target.master.gain.setTargetAtTime(
      value ? 0 : VOLUME,
      target.context.currentTime,
      MUTE_SMOOTHING,
    );
  }

  function setTrack(target: Graph, name: TrackName | null): void {
    const now = target.context.currentTime;
    if (name) {
      target.player.play(name, now + START_DELAY);
    } else {
      target.player.stop(now);
    }
    current = name;
  }

  function playCues(target: Graph, cues: Cues, silent: boolean): void {
    for (const name of CUES) {
      if (cues[name] > 0) {
        cues[name] = 0;
        if (!silent) {
          playEffect(
            target.context,
            target.effects,
            target.noise,
            name,
            target.context.currentTime,
          );
        }
      }
    }
  }

  return {
    start() {
      if (graph) {
        return;
      }
      const context = createContext();
      if (context) {
        graph = build(context, muted, createPlayer);
        requested = context.state;
      }
    },
    sync(world) {
      if (!graph) {
        muted = world.muted;
        clearCues(world.cues);
        return;
      }
      const audible = AUDIBLE_MODES.has(world.mode);
      setRunning(graph, audible);
      setMuted(graph, world.muted);
      const wanted = chooseTrack(world, current);
      if (wanted !== current) {
        setTrack(graph, wanted);
      }
      graph.player.update(graph.context.currentTime);
      playCues(graph, world.cues, world.muted || !audible);
    },
    close() {
      if (!graph) {
        return;
      }
      graph.player.close();
      graph.context.close().catch(() => {});
      graph = null;
      current = null;
      requested = null;
    },
  };
}
