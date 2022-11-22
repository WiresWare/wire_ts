export function utilRandomRange(max: number, min = 0): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function* utilFromObjectToEntities(input: { [index: string]: any }) {
  for (const key in input) yield [key, input[key]];
}
