// Functions related to the dictionary, but not its contents (e.g. checking validity and choosing the daily word).
import {words, solutions} from "dictionary"

function triple32(x) {
    x ^= x >> 17n;
    x *= 0xED5AD4BBn;
    x ^= x >> 11n;
    x *= 0xAC4C1B51n;
    x ^= x >> 15n;
    x *= 0x31848BABn;
    x ^= x >> 14n;
    x = BigInt.asIntN(32, x);
    return x;
}
// This argument should be a BigInt!
export function chooseDailyWord(daysSinceUnixEpoch) {
  return solutions[
    triple32(daysSinceUnixEpoch) % BigInt(solutions.length)
  ];
}
export function isWordValid(word){
  return words.includes(word);
}