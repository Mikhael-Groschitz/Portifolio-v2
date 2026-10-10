import { createOrgan } from "./organ";
import {
  type Cursor,
  LATE,
  LOOKAHEAD,
  advance,
  createCursor,
  secondsOf,
} from "./sequencer";
import { TRACKS, type TrackName } from "./tracks";

const FADE = 0.3;

export interface MusicPlayer {
  play: (name: TrackName, at: number) => void;
  stop: (at: number) => void;
  update: (now: number) => void;
  close: () => void;
}

export type PlayerFactory = (
  context: BaseAudioContext,
  output: AudioNode,
) => MusicPlayer;

interface Playback {
  name: TrackName;
  start: number;
  cursor: Cursor;
  bus: GainNode;
  voices: Set<OscillatorNode>;
  stopped: boolean;
}

export function createOrganPlayer(
  context: BaseAudioContext,
  output: AudioNode,
): MusicPlayer {
  const organ = createOrgan(context);
  let playback: Playback | null = null;

  function finish(ending: Playback): void {
    if (ending.stopped && ending.voices.size === 0) {
      ending.bus.disconnect();
    }
  }

  function fadeOut(ending: Playback, at: number): void {
    ending.stopped = true;
    ending.bus.gain.setValueAtTime(ending.bus.gain.value, at);
    ending.bus.gain.linearRampToValueAtTime(0, at + FADE);
    for (const voice of ending.voices) {
      voice.stop(at + FADE);
    }
    finish(ending);
  }

  function schedule(playing: Playback, now: number): void {
    const track = TRACKS[playing.name];
    const until = now + LOOKAHEAD;
    for (
      let event = advance(track, playing.start, playing.cursor, until);
      event;
      event = advance(track, playing.start, playing.cursor, until)
    ) {
      const time = playing.cursor.time;
      if (time < now - LATE) {
        continue;
      }
      for (const midi of event.pitches) {
        const voice = organ.play(
          playing.bus,
          midi,
          event.stop,
          event.velocity,
          Math.max(time, now),
          secondsOf(track, event),
        );
        playing.voices.add(voice);
        voice.addEventListener("ended", () => {
          playing.voices.delete(voice);
          finish(playing);
        });
      }
    }
  }

  return {
    play(name, at) {
      if (playback) {
        fadeOut(playback, context.currentTime);
      }
      const bus = context.createGain();
      bus.connect(output);
      playback = {
        name,
        start: at,
        cursor: createCursor(),
        bus,
        voices: new Set(),
        stopped: false,
      };
    },
    stop(at) {
      if (playback) {
        fadeOut(playback, at);
        playback = null;
      }
    },
    update(now) {
      if (playback) {
        schedule(playback, now);
      }
    },
    close() {
      organ.silence();
    },
  };
}
