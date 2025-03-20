const PREFIX = "WDL_";
// just do everything in local timezone i can’t be assed
let now = new Date();
let daysSinceUnixEpoch = BigInt(
  Math.floor((now - new Date(0)) / (new Date(1970, 0, 2) - new Date(1970, 0, 1)))
);
console.debug("today is ", daysSinceUnixEpoch, " since 1970-01-01");

export function firstTime() {
  const lastPlayed = window.localStorage.getItem(PREFIX + "lastPlayed", null);
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
  console.debug("nowString", nowString, "lastPlayed", lastPlayed);
  return nowString === lastPlayed;
}

export function saveAutosave(secret, usedGuesses) {
  window.localStorage.setItem(PREFIX + "dsue", Number(daysSinceUnixEpoch));
  window.localStorage.setItem(PREFIX + "secret", secret);
  window.localStorage.setItem(PREFIX + "usedGuesses", JSON.stringify(usedGuesses));
}

export function loadAutosave() {
  return {
    secret: window.localStorage.getItem(PREFIX + "secret"),
    usedGuesses: JSON.parse(window.localStorage.getItem(PREFIX + "usedGuesses", "[]")),
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
