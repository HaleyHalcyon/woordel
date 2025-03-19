import * as save from "./save.js";
import {chooseDailyWord} from "./words.js";
import {GameState} from "./game.js";
document.addEventListener("DOMContentLoaded", async () => {
  // todo: set everything up
  const gameState = new GameState(
    document.getElementById("board"),
    document.getElementById("keyboard"),
  );
  if (save.firstTime()) {
    document.getElementById("instructions").showModal();
  }
  if (save.hasPlayedToday()) {
    gameState.loadAutosave(
      save.loadAutosave(),
    );
  } else {
    gameState.loadAutosave({
      secret: chooseDailyWord(),
      usedGuesses: [],
    });
  }
  document.body.addEventListener("keypress", e => {
    gameState.hitKey(e.key);
  });
  Array.from(document.querySelectorAll("#keyboard button")).forEach(el => {
    let key = (
      el.innerText === "⌫" ? "Backspace" :
      el.innerText === "✔" ? "Enter" : el.innerText
    );
    el.addEventListener("click", () => {
      gameState.hitKey(key);
    });
  });
  
  document.getElementById("btnInstructions").addEventListener(
    "click", () => {
      document.getElementById("instructions").showModal();
    }
  );
  document.getElementById("btnSettings").addEventListener(
    "click", () => {
      document.getElementById("settings").showModal();
    }
  );
  document.getElementById("game").style.display = "";
});
