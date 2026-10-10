import { random } from "../core/random";

export const CATHEDRAL = {
  seconds: 3.6,
  predelay: 0.025,
  decay: 6.9,
  darkening: 0.9,
  seed: 7,
} as const;

function channel(
  sampleRate: number,
  seconds: number,
  state: { seed: number },
): Float32Array<ArrayBuffer> {
  const data = new Float32Array(Math.round(sampleRate * seconds));
  const start = Math.round(CATHEDRAL.predelay * sampleRate);
  let smooth = 0;
  for (let index = start; index < data.length; index++) {
    const time = index / sampleRate;
    const brightness = 0.12 + 0.6 * Math.exp(-time / CATHEDRAL.darkening);
    smooth += brightness * (random(state) * 2 - 1 - smooth);
    data[index] = smooth * Math.exp((-CATHEDRAL.decay * time) / seconds);
  }
  return data;
}

export function impulse(
  sampleRate: number,
  seconds = CATHEDRAL.seconds,
  seed: number = CATHEDRAL.seed,
): readonly [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>] {
  const state = { seed };
  return [
    channel(sampleRate, seconds, state),
    channel(sampleRate, seconds, state),
  ];
}

export function createReverb(context: BaseAudioContext): ConvolverNode {
  const [left, right] = impulse(context.sampleRate);
  const buffer = context.createBuffer(2, left.length, context.sampleRate);
  buffer.copyToChannel(left, 0);
  buffer.copyToChannel(right, 1);
  const convolver = context.createConvolver();
  convolver.buffer = buffer;
  return convolver;
}
