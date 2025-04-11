class Minesweeper {
  constructor() {
    this.boardSize = 10;
    this.mineCount = 10;
    this.board = [];
    this.cellsRevealed = 0;
    this.gameOver = false;
    this.timer = 0;
    this.timerInterval = null;
    this.flagsPlaced = 0;

    this.difficultySettings = {
      easy: { size: 10, mines: 10 },
      medium: { size: 15, mines: 40 },
      hard: { size: 20, mines: 99 },
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startNewGame("easy");
  }

  setupEventListeners() {
    document
      .getElementById("easy")
      .addEventListener("click", () => this.startNewGame("easy"));
    document
      .getElementById("medium")
      .addEventListener("click", () => this.startNewGame("medium"));
    document
      .getElementById("hard")
      .addEventListener("click", () => this.startNewGame("hard"));
  }

  startNewGame(difficulty) {
    clearInterval(this.timerInterval);
    this.gameOver = false;
    this.timer = 0;
    this.flagsPlaced = 0;
    this.cellsRevealed = 0;

    const settings = this.difficultySettings[difficulty];
    this.boardSize = settings.size;
    this.mineCount = settings.mines;

    this.updateMinesCount();
    this.updateTimer();
    this.generateBoard();
    this.placeMines();
    this.renderBoard();
  }

  generateBoard() {
    this.board = [];
    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        };
      }
    }
  }

  placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < this.mineCount) {
      const x = Math.floor(Math.random() * this.boardSize);
      const y = Math.floor(Math.random() * this.boardSize);

      if (!this.board[x][y].isMine) {
        this.board[x][y].isMine = true;
        minesPlaced++;
      }
    }
    this.calculateAdjacentMines();
  }

  calculateAdjacentMines() {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (!this.board[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (
                ni >= 0 &&
                ni < this.boardSize &&
                nj >= 0 &&
                nj < this.boardSize &&
                this.board[ni][nj].isMine
              ) {
                count++;
              }
            }
          }
          this.board[i][j].adjacentMines = count;
        }
      }
    }
  }

  renderBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = i;
        cell.dataset.y = j;

        cell.addEventListener("click", (e) => this.handleCellClick(e));
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.handleRightClick(e);
        });

        boardElement.appendChild(cell);
      }
    }
  }

  handleCellClick(e) {
    if (this.gameOver) return;

    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const cell = this.board[x][y];

    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
      this.gameOver = true;
      this.revealAllMines();
      alert("游戏结束！你踩到雷了！");
      return;
    }

    this.revealCell(x, y);

    if (
      this.cellsRevealed ===
      this.boardSize * this.boardSize - this.mineCount
    ) {
      this.gameOver = true;
      clearInterval(this.timerInterval);
      alert("恭喜你赢了！");
    }
  }

  handleRightClick(e) {
    if (this.gameOver) return;

    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const cell = this.board[x][y];

    if (cell.isRevealed) return;

    if (!cell.isFlagged && this.flagsPlaced < this.mineCount) {
      cell.isFlagged = true;
      this.flagsPlaced++;
      e.target.classList.add("flagged");
    } else if (cell.isFlagged) {
      cell.isFlagged = false;
      this.flagsPlaced--;
      e.target.classList.remove("flagged");
    }

    this.updateMinesCount();
  }

  revealCell(x, y) {
    if (
      x < 0 ||
      x >= this.boardSize ||
      y < 0 ||
      y >= this.boardSize ||
      this.board[x][y].isRevealed ||
      this.board[x][y].isFlagged
    ) {
      return;
    }

    const cell = this.board[x][y];
    cell.isRevealed = true;
    this.cellsRevealed++;

    const cellElement = document.querySelector(
      `.cell[data-x="${x}"][data-y="${y}"]`
    );
    cellElement.classList.add("revealed");

    if (cell.adjacentMines > 0) {
      cellElement.textContent = cell.adjacentMines;
      cellElement.classList.add(`adjacent-${cell.adjacentMines}`);
    } else {
      // 如果是空白格子，自动展开相邻格子
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di !== 0 || dj !== 0) {
            this.revealCell(x + di, y + dj);
          }
        }
      }
    }

    if (this.cellsRevealed === 1) {
      this.startTimer();
    }
  }

  revealAllMines() {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j].isMine) {
          const cellElement = document.querySelector(
            `.cell[data-x="${i}"][data-y="${j}"]`
          );
          cellElement.classList.add("mine");
        }
      }
    }
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    document.getElementById("timer").textContent = `时间: ${this.timer}`;
  }

  updateMinesCount() {
    document.getElementById("mines-count").textContent = `剩余雷数: ${
      this.mineCount - this.flagsPlaced
    }`;
  }
}

// 初始化游戏
document.addEventListener("DOMContentLoaded", () => {
  new Minesweeper();
});
