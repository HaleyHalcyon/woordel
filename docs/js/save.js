const PREFIX = "WDL_";
// just do everything in local timezone i can’t be assed
let now = new Date();
let daysSinceUnixEpoch = BigInt(
  Math.floor((now - new Date(1970, 0, 1)) / (new Date(1970, 0, 2) - new Date(1970, 0, 1)))
);
console.debug("today is ", daysSinceUnixEpoch, " since 1970-01-01");
let options = null // this will be populated later

export function firstTime() {
  const lastPlayed = window.localStorage.getItem(PREFIX + "dsue");
  if (lastPlayed == null) {
    return true; // we’ll eventually set lastPlayed somewhere else
  }
  return false;
}

export function getDaysSinceUnixEpoch() {
  return daysSinceUnixEpoch;
}

export function hasPlayedToday() {
  const lastPlayed = BigInt(window.localStorage.getItem(PREFIX + "dsue") || 0);
  console.debug("last played", lastPlayed);
  return daysSinceUnixEpoch === lastPlayed;
}

export function saveAutosave(autosave) {
  window.localStorage.setItem(PREFIX + "dsue", Number(daysSinceUnixEpoch));
  window.localStorage.setItem(PREFIX + "secret", autosave.secret);
  window.localStorage.setItem(PREFIX + "usedGuesses", JSON.stringify(autosave.usedGuesses));
  window.localStorage.setItem(PREFIX + "hardMode", JSON.stringify(autosave.hardMode));
}

export function loadAutosave() {
  return {
    secret: window.localStorage.getItem(PREFIX + "secret"),
    usedGuesses: JSON.parse(window.localStorage.getItem(PREFIX + "usedGuesses") || "[]"),
    hardMode: JSON.parse(window.localStorage.getItem(PREFIX + "hardMode") || false),
  }
}

// guessCount in range 1 to 6 for victories, 0 for losses. This may come back to bite me in the ass.
export function updateStats(win, guessCount) {
  console.log("updateStats");
  let plays = parseInt(window.localStorage.getItem(PREFIX + "plays") || "0", 10);
  plays++
  let wins = parseInt(window.localStorage.getItem(PREFIX + "wins") || "0", 10);
  let streak = parseInt(window.localStorage.getItem(PREFIX + "streak") || "0", 10);
  let maxStreak = parseInt(window.localStorage.getItem(PREFIX + "maxStreak") || "0", 10);
  if (win) {
    wins++;
    streak++;
    maxStreak = Math.max(streak, maxStreak);
  } else {
    streak = 0;
  }
  let guessDist = JSON.parse(window.localStorage.getItem(PREFIX + "guessDist") || "[0,0,0,0,0,0,0]");
  if (win) {
    guessDist[guessCount]++;
  } else {
    guessDist[0]++;
  }
  window.localStorage.setItem(PREFIX + "plays", plays);
  window.localStorage.setItem(PREFIX + "wins", wins);
  window.localStorage.setItem(PREFIX + "streak", streak);
  window.localStorage.setItem(PREFIX + "maxStreak", maxStreak);
  window.localStorage.setItem(PREFIX + "guessDist", JSON.stringify(guessDist));
}

export function getStats() {
  return {
    plays: parseInt(window.localStorage.getItem(PREFIX + "plays") || "0", 10),
    wins: parseInt(window.localStorage.getItem(PREFIX + "wins") || "0", 10),
    streak: parseInt(window.localStorage.getItem(PREFIX + "streak") || "0", 10),
    maxStreak: parseInt(window.localStorage.getItem(PREFIX + "maxStreak") || "0", 10),
    guessDist: JSON.parse(window.localStorage.getItem(PREFIX + "guessDist") || "[0,0,0,0,0,0,0]"),
  }
}

export function getOption(key) {
  if (options === null) {
    options = JSON.parse(window.localStorage.getItem(PREFIX + "config") || "{}");
  }
  return options[key];
}

export function setOption(key, value) {
  options[key] = value;
  return window.localStorage.setItem(PREFIX + "config", JSON.stringify(options));
}