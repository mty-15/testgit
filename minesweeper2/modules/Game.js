import Board from "./Board.js";
import Timer from "./Timer.js";
import UI from "./UI.js";

export default class Game {
  constructor() {
    this.board = new Board();
    this.timer = new Timer();
    this.ui = new UI();
    this.difficultySettings = {
      easy: { size: 10, mines: 10 },
      medium: { size: 15, mines: 40 },
      hard: { size: 20, mines: 99 },
    };
    this.currentDifficulty = "easy";
    this.gameOver = false;
    this.isPaused = false;
  }

  init() {
    this.ui.init(this);
    this.startNewGame(this.currentDifficulty);
  }

  startNewGame(difficulty) {
    this.currentDifficulty = difficulty;
    this.gameOver = false;
    this.isPaused = false;

    const settings = this.difficultySettings[difficulty];
    this.board.init(settings.size, settings.mines);
    this.timer.reset();
    this.ui.updateGameStatus(this.board.flagsPlaced, settings.mines, 0);
    this.ui.renderBoard(this.board);
  }

  handleCellClick(x, y) {
    if (this.gameOver || this.isPaused) return;

    if (this.board.revealCell(x, y)) {
      // 踩到地雷
      this.gameOver = true;
      this.timer.stop();
      this.board.revealAllMines();
      this.ui.showMessage("游戏结束！你踩到雷了！", "danger");
      return;
    }

    this.ui.updateGameStatus(
      this.board.flagsPlaced,
      this.board.mineCount,
      this.timer.time
    );

    if (this.board.checkWin()) {
      this.gameOver = true;
      this.timer.stop();
      this.ui.showMessage("恭喜你赢了！", "success");
    }
  }

  handleRightClick(x, y) {
    if (this.gameOver || this.isPaused) return;

    this.board.toggleFlag(x, y);
    this.ui.updateGameStatus(
      this.board.flagsPlaced,
      this.board.mineCount,
      this.timer.time
    );
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.timer.stop();
    } else {
      this.timer.start();
    }
    this.ui.updatePauseButton(this.isPaused);
  }
}
