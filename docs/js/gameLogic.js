import isWordValid from "words";

export class GameState {
  CHAR_COUNT = 5;
  MAX_TURNS = 7;
  ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZĲ";
  constructor(boardRef, keyboardRef) {
    this.usedGuesses = [];
    this.bestGuess = Array.from(Array(this.CHAR_COUNT), _ => ".");
    this.lettersGuessed = Object.fromEntries(
      ...Array.from(ALPHABET, v => [v, -1])
    );
    this.clues = [];
    this.board = boardRef;
    this.kb = keyboardRef;
    this.currentGuess = "";
  }

  hitKey(key) {
    switch (key) {
      case "delete":
        this.currentGuess = this.currentGuess.substring(0, this.currentGuess.length - 1);
        return null;
      case "submit":
        if (this.currentGuess.length !== this.CHAR_COUNT) {
          return Error("not enough letters");
        }
        const result = this.submitGuess();
        if (result === null) {
          return Error("invalid word");
        }
        return result;
      case ";":
      case ":":
        if (this.currentGuess.length < this.CHAR_COUNT) {
          this.currentGuess = this.currentGuess + "Ĳ";
          return null;
        }
        return Error("too many letters");
      default:
        if (this.currentGuess.length < this.CHAR_COUNT) {
          key = key.toUpperCase();
          if (this.ALPHABET.contains(key)) {
            this.currentGuess = this.currentGuess + "Ĳ";
            return null;
          }
          return Error("not in alphabet");
        }
        return Error("too many letters");
    }
  }

  updateRow(row) {
    for (let c = 0; c < this.CHAR_COUNT; c++) {
      let tile = this.board.children[row].children[c];
      tile.classList.remove("hit", "graze", "miss");
      if (this.clues.length <= row) {
        if (this.clues.length === row) {
          tile.innerText = c < this.currentGuess.length ? this.currentGuess.at(c) : "."
        } else {
          tile.innerText = "";
        }
      } else {
        tile.innerText = this.usedGuesses[row].at(c);
        tile.classList.add(
          [
            "miss", "graze", "hit"
          ][this.clues[row].at(c)]
        );
      }
    }
  }

  loadAutoSave(autosave) {
    this.secret = autosave.secret;
    this.usedGuesses = autosave.usedGuesses;
    this.clues = Array.from(usedGuesses, guess => this.generateClues(guess));
    // [TODO] this.bestGuess = 
    // [TODO] this.lettersGuessed = 
    this.currentGuess = "";
    for (let i = 0; i < this.MAX_TURNS; i++) {
      this.updateRow(row);
    }
    // [TODO] re-show endgame popup if game is over
  }

  submitGuess() {
    if (!isWordValid(this.currentGuess)) {
      return null;
    }
    this.usedGuesses.push(this.currentGuess);
    let clues = this.generateClues(this.currentGuess);
    if (this.currentGuess == this.secret) {
      return {
        clues,
        win: true,
        lose: false,
      };
    }
    return {
      clues,
      win: false,
      lose: this.usedGuesses.length == this.MAX_TURNS
    };
  }

  generateClues(guessWord) {
    let guess = [...guessWord];
    let secret = [...this.secret];
    // find green letters
    let clues = Array.from(secret, _ => 0);
    for (let i = 0; i < secret.length; i++) {
      if (guess[i] === secret[i]) {
        this.bestGuess[i] = secret[i];
        if (
          this.lettersGuessed[secret[i]] !== 2
        ) {
          this.lettersGuessed[secret[i]] = 2
        }
        clues[i] = 2;
        guess[i] = null;
        secret[i] = null;
      }
    }
    // find yellow letters
    for (let i = 0; i < secret.length - 1; i++) {
      if (guess[i] === null) continue;
      for (let j = i + 1; j < secret.length; j++) {
        if (guess[i] === secret[j]) {
          clues[i] = 1;
          guess[i] = null;
          secret[i] = null;
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
    }
  }
}
