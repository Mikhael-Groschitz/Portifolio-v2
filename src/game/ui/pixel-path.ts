export function pixelPath(mask: readonly string[]): string {
  return mask
    .flatMap((row, y) =>
      [...row.matchAll(/X+/g)].map(
        (run) =>
          `M${run.index ?? 0} ${y}h${run[0].length}v1h-${run[0].length}z`,
      ),
    )
    .join("");
}
