// A small seeded random number generator (mulberry32): the same seed gives the same game,
// which is what makes the screenshot scenes repeatable.

export function createRandom(seed) {
  let value = seed >>> 0 || 0x9e3779b9;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}
