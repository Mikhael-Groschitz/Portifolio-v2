import { frequencyOf } from "./notes";
import type { StopName } from "./score";
import { type Stop, STOPS } from "./stops";

const VIBRATO_HZ = 5.2;
const DETUNE_SPREAD = 3;
const TAIL = 0.05;

export interface Organ {
  play: (
    output: AudioNode,
    midi: number,
    stopName: StopName,
    velocity: number,
    time: number,
    duration: number,
  ) => OscillatorNode;
  silence: () => void;
}

function perStop<T>(make: (stop: Stop) => T): Record<StopName, T> {
  return Object.fromEntries(
    Object.entries(STOPS).map(([name, stop]) => [name, make(stop)]),
  ) as Record<StopName, T>;
}

function waveOf(context: BaseAudioContext, stop: Stop): PeriodicWave {
  const real = new Float32Array(stop.harmonics.length + 1);
  const imag = new Float32Array(stop.harmonics.length + 1);
  stop.harmonics.forEach((amplitude, index) => {
    imag[index + 1] = amplitude;
  });
  return context.createPeriodicWave(real, imag);
}

export function createOrgan(context: BaseAudioContext): Organ {
  const waves = perStop((stop) => waveOf(context, stop));
  const lfo = context.createOscillator();
  lfo.frequency.value = VIBRATO_HZ;
  const depths = perStop((stop) => {
    const depth = context.createGain();
    depth.gain.value = stop.vibrato;
    lfo.connect(depth);
    return depth;
  });
  lfo.start();

  return {
    play(output, midi, stopName, velocity, time, duration) {
      const stop = STOPS[stopName];
      const oscillator = context.createOscillator();
      oscillator.setPeriodicWave(waves[stopName]);
      oscillator.frequency.value = frequencyOf(midi);
      oscillator.detune.value = (Math.random() * 2 - 1) * DETUNE_SPREAD;
      const envelope = context.createGain();
      const level = stop.gain * velocity;
      const swell = time + Math.min(stop.attack, duration);
      const release = Math.max(time + duration, swell);
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(level, swell);
      envelope.gain.setValueAtTime(level, release);
      envelope.gain.linearRampToValueAtTime(0, release + stop.release);
      oscillator.connect(envelope).connect(output);
      const depth = stop.vibrato > 0 ? depths[stopName] : null;
      depth?.connect(oscillator.detune);
      oscillator.addEventListener("ended", () => {
        depth?.disconnect(oscillator.detune);
        oscillator.disconnect();
        envelope.disconnect();
      });
      oscillator.start(time);
      oscillator.stop(release + stop.release + TAIL);
      return oscillator;
    },
    silence() {
      lfo.stop();
      lfo.disconnect();
    },
  };
}
