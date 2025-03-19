import * as save from "./save.js";
document.addEventListener("DOMContentLoaded", async () => {
  // todo: set everything up

  if (save.firstTime()) {
    document.getElementById("instructions").showModal();
  }
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
