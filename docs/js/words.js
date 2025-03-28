// Functions related to the dictionary, but not its contents (e.g. checking validity and choosing the daily word).
import {words} from "./dictionary.js"
import {solutions} from "./solutions.js"

function triple32(x) {
    x ^= x >> 17n;
    x *= 0xED5AD4BBn;
    x = BigInt.asUintN(32, x);
    x ^= x >> 11n;
    x *= 0xAC4C1B51n;
    x = BigInt.asUintN(32, x);
    x ^= x >> 15n;
    x *= 0x31848BABn;
    x = BigInt.asUintN(32, x);
    x ^= x >> 14n;
    return x;
}
// This argument should be a BigInt!
export function chooseDailyWord(daysSinceUnixEpoch) {
  return solutions[Number(
    triple32(daysSinceUnixEpoch) % BigInt(solutions.length)
  )];
}
console.debug(
  "these should be different words:",
  chooseDailyWord(BigInt(20166)),
  chooseDailyWord(BigInt(20167)),
  chooseDailyWord(BigInt(20168)),
  chooseDailyWord(BigInt(20169)),
);
export function isWordValid(word){
  return words.includes(word);
}
