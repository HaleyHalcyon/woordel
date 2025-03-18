import isWordValid from "words";

export class GameState {
  MAX_TURNS = 7;
  ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZĲ";
  constructor(secret) {
    this.secret = secret;
    this.usedGuesses = [];
    this.bestGuess = Array.from(secret, _ => ".");
    this.lettersGuessed = Object.fromEntries(
      ...Array.from(ALPHABET, v => [v, -1])
    );
  }

  submitGuess(guessWord) {
    if (!isWordValid(guessWord)) {
      return null;
    }
    this.usedGuesses.push(guessWord);
    let clues = this.generateClues(guessWord);
    if (guessWord == this.secret) {

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
