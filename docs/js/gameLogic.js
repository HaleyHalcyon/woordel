import { isWordValid } from "./words.js";
import { saveAutosave, updateStats } from "./save.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// index is 1 off to skip "zeroth"
const ordinal = (c) => [
  "eerste", "tweede", "derde", "vierde", "vĳvde"
][c];

export class GameState {
  CHAR_COUNT = 5;
  MAX_TURNS = 6;
  ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZĲ";
  constructor(boardRef, keyboardRef) {
    this.usedGuesses = [];
    this.bestGuess = Array.from(Array(this.CHAR_COUNT), (_) => ".");
    this.lettersGuessed = Object.fromEntries(
      Array.from(this.ALPHABET, (v) => [v, -1])
    );
    this.clues = [];
    this.board = boardRef;
    this.kb = keyboardRef;
    this.currentGuess = "";
    this.animating = false;
    this.gameOver = false;
  }

  setHardMode(isHardMode) {
    this.hardMode = isHardMode;
  }

  gameIsInProgress() {
    return this.usedGuesses.length > 0 && !this.gameOver;
  }

  async hitKey(key) {
    if (this.animating || this.gameOver) return null;
    console.debug(key);
    switch (key) {
      case "Backspace":
        this.currentGuess = this.currentGuess.substring(
          0,
          this.currentGuess.length - 1
        );
        this.updateRow(this.usedGuesses.length);
        return null;
      case "Enter":
        if (this.currentGuess.length !== this.CHAR_COUNT) {
          return Error("Het woord moet 5 letters zĳn.");
        }
        const result = await this.submitGuess();
        if (result instanceof Error) {
          return result;
        }
        await this.updateRowWithAnimation(this.usedGuesses.length - 1);
        return result;
      case ";":
      case ":":
        if (this.currentGuess.length < this.CHAR_COUNT) {
          this.currentGuess = this.currentGuess + "Ĳ";
          this.updateRow(this.usedGuesses.length);
          return null;
        }
        return Error("Het woord moet 5 letters zĳn.");
      default:
        key = key.toUpperCase();
        if (this.ALPHABET.includes(key)) {
          if (this.currentGuess.length >= this.CHAR_COUNT) {
            return Error("Het woord moet 5 letters zĳn.");
          }
          this.currentGuess = this.currentGuess + key;
          this.updateRow(this.usedGuesses.length);
          return null;
        }
        return null; //return Error("Dat is geen letter uit het Nederlandse alfabet.");
    }
  }

  updateRow(row) {
    if (row >= this.MAX_TURNS || this.gameOver) return;
    for (let c = 0; c < this.CHAR_COUNT; c++) {
      let tile = this.board.children[row].children[c];
      tile.classList.remove("hit", "graze", "miss", "filled");
      if (this.clues.length <= row) {
        if (
          this.clues.length === row &&
          this.usedGuesses.at(-1) !== this.secret
        ) {
          if (c < this.currentGuess.length) {
            tile.innerText = this.currentGuess.at(c);
            tile.classList.add("filled");
          } else {
            tile.innerText = this.bestGuess.at(c);
          }
        } else {
          tile.innerText = "";
        }
      } else {
        tile.innerText = this.usedGuesses[row].at(c);
        tile.classList.add(["miss", "graze", "hit"][this.clues[row].at(c)]);
      }
    }
  }

  // Used to show the results of the last guess.
  async updateRowWithAnimation(row) {
    this.animating = true;
    saveAutosave(this.exportAutosave());
    if (this.usedGuesses.at(row) === this.secret || this.usedGuesses.length === this.MAX_TURNS) {
      updateStats(this.usedGuesses.at(row) === this.secret, this.usedGuesses.length);
    }
    for (let c = 0; c < this.CHAR_COUNT; c++) {
      let tile = this.board.children[row].children[c];
      tile.classList.remove("filled");
      tile.classList.add(["miss", "graze", "hit"][this.clues[row].at(c)]);
      let letter = this.usedGuesses.at(row).at(c);
      let key = this.kb.querySelector("button[data-key=" + letter + "]");
      switch (this.clues[row].at(c)) {
        case 2:
          key.classList.remove("miss", "graze");
          key.classList.add("hit");
          break;
        case 1:
          if (key.classList.contains("hit")) break;
          key.classList.remove("miss");
          key.classList.add("graze");
          break;
        case 0:
          if (key.classList.contains("graze") || key.classList.contains("hit")) break;
          key.classList.add("miss");
          break;
        default:
          console.error("updateRowWithAnimation unexpected letterGuessed value");
      }
      await delay(150);
    }
    if (this.usedGuesses.at(row) === this.secret) {
      this.board.children[row].classList.add("answer");
    }
    this.updateRow(row + 1);
    this.animating = false;
    return;
  }

  loadAutosave(autosave) {
    this.secret = autosave.secret;
    this.hardMode = autosave.hardMode || false;
    this.usedGuesses = autosave.usedGuesses || [];
    this.clues = Array.from(this.usedGuesses, (guess) =>
      this.generateClues(guess)
    );
    // this.bestGuess is already done for us above
    console.log("lettersGuessed", this.lettersGuessed);
    for (let i = 0; i < this.clues.length; i++) {
      for (let j = 0; j < this.CHAR_COUNT; j++) {
        if (this.clues[i][j] > this.lettersGuessed[this.usedGuesses[i][j]]) {
          this.lettersGuessed[this.usedGuesses[i][j]] = this.clues[i][j];
        }
      }
    }
    for (let letter of this.ALPHABET) {
      let key = this.kb.querySelector("button[data-key=" + letter + "]");
      switch (this.lettersGuessed[letter]) {
        case 2:
          key.classList.add("hit");
          break;
        case 1:
          key.classList.add("graze");
          break;
        case 0:
          key.classList.add("miss");
          break;
        case -1:
          key.classList.add("empty");
          break;
      }
    }
    this.currentGuess = "";
    for (let i = 0; i < this.MAX_TURNS; i++) {
      this.updateRow(i);
    }
    // [TODO] re-show endgame popup if game is over
    this.gameOver = this.secret === this.usedGuesses.at(-1) || this.usedGuesses.length === this.MAX_TURNS;
    return {
      win: this.secret === this.usedGuesses.at(-1),
      lose: this.usedGuesses.length === this.MAX_TURNS,
    };
  }

  async submitGuess() {
    if (!isWordValid(this.currentGuess)) {
      return Error("Dat woord was niet gevonden.");
    }
    if (this.hardMode) {
      const problems = Array.from(new Array(this.CHAR_COUNT + 1), _ => new Set());
      // check missing hits, already ruled out grazes, and ignored misses
      for (let c = 0; c < this.CHAR_COUNT; c++) {
        const letter = this.currentGuess[c];
        for (let row = 0; row < this.usedGuesses.length; row++) {
          const letterGuess = this.usedGuesses[row][c];
          const letterClue = this.clues[row][c];
          if (letterClue === 1) {
            if (letterGuess == letter) {
              problems[c].add("De letter " + letter + " is niet de " + ordinal(c) + " letter van het Woordel!");
            }
          } else if (letterClue === 2 && letterGuess != letter) {
            problems[c].add("De " + ordinal(c) + " letter van het Woordel is " + letter + "!");
          }
        }
      }
      // check unused grazes and ignored misses
      for (let letter of this.ALPHABET) {
        const v = this.lettersGuessed[letter];
        console.log(letter, v)
        if (v === 0 && this.currentGuess.includes(letter)) {
          problems.at(-1).add("De letter " + letter + " zit niet in het Woordel!");
          continue;
        }
        if (v === 1 && !this.currentGuess.includes(letter)) {
          problems.at(-1).add("De letter " + letter + " moet zitten in het Woordel!")
          continue;
        }
      }
      if (problems.some(v => v.size !== 0)) {
        let problemsList = Array.from(problems, v => Array.from(v));
        let problemsList_1 = problemsList.filter(v => v.length > 0);
        let problemsList_2 = Array.from(problemsList_1, v => {
          return v.toSorted();
        }).flat();
        if (problemsList_2.length === 1) {
          return Error(problemsList_2[0]);
        }
        return Error(
          "* " + problemsList_2.join("\n* ")
        );
      }
    }
    this.usedGuesses.push(this.currentGuess);
    let clues = this.generateClues(this.currentGuess);
    for (let i = 0; i < clues.length; i++) {
      let l = this.usedGuesses.at(-1)[i];
      this.lettersGuessed[l] = Math.max(clues, this.lettersGuessed[l]);
    }
    this.clues.push(clues);
    if (this.currentGuess == this.secret) {
      this.gameOver = true;
      return {
        clues,
        win: true,
        lose: false,
      };
    }
    this.currentGuess = "";
    this.gameOver = this.usedGuesses.length == this.MAX_TURNS;
    return {
      clues,
      win: false,
      lose: this.gameOver,
    };
  }

  generateClues(guessWord) {
    let guess = [...guessWord];
    let secret = [...this.secret];
    // find green letters
    let clues = Array.from(secret, (_) => 0);
    for (let i = 0; i < secret.length; i++) {
      if (guess[i] === secret[i]) {
        this.bestGuess[i] = secret[i];
        if (this.lettersGuessed[secret[i]] !== 2) {
          this.lettersGuessed[secret[i]] = 2;
        }
        clues[i] = 2;
        guess[i] = null;
        secret[i] = null;
      }
    }
    // find yellow letters
    for (let i = 0; i < secret.length; i++) {
      if (guess[i] === null) continue;
      for (let j = 0; j < secret.length; j++) {
        if (guess[i] === secret[j]) {
          clues[i] = 1;
          guess[i] = null;
          secret[j] = null;
          continue;
        }
      }
    }
    return clues;
  }

  exportAutosave() {
    return {
      secret: this.secret,
      usedGuesses: this.usedGuesses,
      hardMode: this.hardMode,
    };
  }

  exportSharable(dayNumber) {
    return `Woordel #${
      dayNumber
    }: ${
      this.secret === this.usedGuesses.at(-1) ? this.usedGuesses.length : "×"
    }/${
      this.MAX_TURNS
    }${
      this.hardMode ? "*" : ""
    }\n${
      Array.from(this.clues, (row) => {
        return Array.from(row, (clue) => {
          return ["⬛", "🟨", "🟩",][clue];
        }).join("");
      }).join("\n")
    }`;
  }
}
