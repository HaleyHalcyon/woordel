const PREFIX = "WDL_";
// just do everything in local timezone i can’t be assed
let now = new Date();
let daysSinceUnixEpoch = new BigInt(
  Math.floor(now - new Date(0)) / (new Date(1970, 0, 2) - new Date(1970, 0, 1))
);

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
  const nowString = `${now.getFullYear()}${("0" + now.getMonth() + 1).slice(-2)}${("0" + now.getDate()).slice(-2)}`;
  const lastPlayed = window.localStorage.getItem(PREFIX + "lastPlayed", "00000000");
  console.debug("nowString", nowString, "lastPlayed", lastPlayed);
  if (nowString !== lastPlayed) {
    window.localStorage.setItem(PREFIX + "lastPlayed", nowString);
    return false;
  }
  return true;
}

export function saveAutosave(secret, usedGuesses) {
  window.localStorage.setItem(PREFIX + "secret", secret);
  window.localStorage.setItem(PREFIX + "usedGuesses", usedGuesses);
}

export function loadAutosave() {
  return {
    secret: window.localStorage.getItem(PREFIX + "secret"),
    usedGuesses: window.localStorage.getItem(PREFIX + "usedGuesses"),
  }
}
