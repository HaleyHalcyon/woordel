import * as save from "./save.js";
import {chooseDailyWord} from "./words.js";
import {GameState} from "./gameLogic.js";
document.addEventListener("DOMContentLoaded", async () => {
  const dayNumber = save.getDaysSinceUnixEpoch();
  const dayZero = BigInt(20166);

  const insertToast = message => {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerText = message;
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
    document.body.appendChild(toast);
  }
  
  const showGameOver = (result) => {
    const m = document.getElementById("gameOver");
    m.querySelectorAll("h3 .inlineTile").forEach((v, k) => {
      v.innerText = gameState.secret.at(k);
    });
    const sharable = gameState.exportSharable(dayNumber - dayZero) + "\n" + window.location;
    console.log(sharable);
    m.querySelector("textarea").value = sharable;
    m.querySelector("#btnShare").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(sharable);
        alert("Gekopieerd naar het klembord... Ga nu verder en deel!");
      } catch (error) {
        alert("Sorry, er is iets misgegaan bĳ het kopiëren van de resultaten naar het klembord.");
      }
    });
    // stats
    const stats = save.getStats();
    m.querySelector("#playCount").innerText = `${stats.plays}×`
    m.querySelector("#winRate").innerText = `${((stats.wins / stats.plays) * 100).toPrecision(3)}`
    m.querySelector("#streak").innerText = `${stats.streak}`
    m.querySelector("#maxStreak").innerText = `${stats.maxStreak}`
    let maxMeter = stats.guessDist.reduce((acc, now) => Math.max(acc, now), 1);
    for (let i = 0; i < 7; i++) {
      // the offsets are pretty fucked up here
      let meter = document.querySelector(`#scoreBar > :nth-child(${i + 2}) .barBG`);
      meter.querySelector(".barFG").style.flexGrow = stats.guessDist[i === 6 ? 0 : i + 1];
      meter.querySelector(".barSpacer").style.flexGrow = maxMeter - stats.guessDist[i === 6 ? 0 : i + 1];
    }
    // next word
    const nextWordleTimer = () => {
      const tomorrow = new Date();
      tomorrow.setHours(0);
      tomorrow.setMinutes(0);
      tomorrow.setSeconds(0);
      tomorrow.setMilliseconds(0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const now = new Date();
      // the timezone offset is in minutes, the timestamp is in milliseconds
      const timeTillTomorrow = new Date(tomorrow - now + (now.getTimezoneOffset() * 60000));
      document.querySelector("#nextWordle").innerText = `Volgende Woordle: ${timeTillTomorrow.getHours()}:${timeTillTomorrow.getMinutes().toString(10).padStart(2, "0")}:${timeTillTomorrow.getSeconds().toString(10).padStart(2, "0")}`;
      setTimeout(nextWordleTimer, timeTillTomorrow.getMilliseconds() < 10 ? 1000 : timeTillTomorrow.getMilliseconds());
    }
    nextWordleTimer();
    m.showModal();
  }

  
  const afterHitKey = async result => {
    // This may return null (no error), Error (error), or Object (guess result).
    console.log(result);
    if (result === null) return;
    if (result instanceof Promise) {
      await result;
    }
    if (result instanceof Error) {
      console.error(result);
      insertToast(result.message);
      return;
    }
    if (result.win) {
      insertToast("Gefeliciteerd!");
      setTimeout(() => {showGameOver(result)}, 2000);
    } else if (result.lose) {
      insertToast("Helaas!");
      setTimeout(() => {showGameOver(result)}, 2000);
    }
  }
  
  const gameState = new GameState(
    document.getElementById("board"),
    document.getElementById("keyboard"),
  );

  if (save.firstTime()) {
    document.getElementById("instructions").showModal();
  }
  if (save.hasPlayedToday()) {
    const loadedResult = gameState.loadAutosave(
      save.loadAutosave(),
    );
    if (loadedResult.win || loadedResult.lose) {
      showGameOver(loadedResult);
    }
  } else {
    const secret = chooseDailyWord(dayNumber);
    console.debug("secret is", secret);
    gameState.loadAutosave({
      secret: secret,
      usedGuesses: [],
    });
    save.saveAutosave(secret, []);
  }
  document.body.addEventListener("keydown", async e => {
    afterHitKey(await gameState.hitKey(e.key));
    return false;
  });
  Array.from(document.querySelectorAll("#keyboard button")).forEach(el => {
    let key = el.dataset["key"];
    el.addEventListener("click", async () => {
      afterHitKey(await gameState.hitKey(key));
    });
  });
  
  document.getElementById("btnInstructions").addEventListener(
    "click", (event) => {
      document.getElementById("instructions").showModal();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  );
  document.getElementById("btnSettings").addEventListener(
    "click", (event) => {
      document.getElementById("settings").showModal();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  );
  document.getElementById("game").style.display = "";
});
