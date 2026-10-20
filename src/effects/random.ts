export function hash(text: string, seed = 1) {
  let n = seed >>> 0;
  for (const char of text) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
  return n >>> 0;
}
export function random(seed: number) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
    n = n + Math.imul(n ^ n >>> 7, 61 | n) ^ n;
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
