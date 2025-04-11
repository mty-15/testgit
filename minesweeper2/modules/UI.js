export default class UI {
  constructor() {
    this.game = null;
    this.boardElement = document.getElementById("board");
    this.minesCountElement = document.getElementById("mines-count");
    this.timerElement = document.getElementById("timer");
    this.messageElement = document.getElementById("game-message");
    this.pauseButton = document.getElementById("pause");
  }

  init(game) {
    this.game = game;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 难度选择按钮
    document.getElementById("easy").addEventListener("click", () => {
      this.game.startNewGame("easy");
    });
    document.getElementById("medium").addEventListener("click", () => {
      this.game.startNewGame("medium");
    });
    document.getElementById("hard").addEventListener("click", () => {
      this.game.startNewGame("hard");
    });

    // 暂停按钮
    this.pauseButton.addEventListener("click", () => {
      this.game.togglePause();
    });
  }

  renderBoard(board) {
    this.boardElement.innerHTML = "";
    this.boardElement.style.gridTemplateColumns = `repeat(${board.size}, 1fr)`;

    for (let i = 0; i < board.size; i++) {
      for (let j = 0; j < board.size; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = i;
        cell.dataset.y = j;

        cell.addEventListener("click", (e) => {
          this.game.handleCellClick(
            parseInt(e.target.dataset.x),
            parseInt(e.target.dataset.y)
          );
          this.updateBoard(board);
        });

        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.game.handleRightClick(
            parseInt(e.target.dataset.x),
            parseInt(e.target.dataset.y)
          );
          this.updateBoard(board);
        });

        // 添加悬停效果
        cell.addEventListener("mouseover", () => {
          cell.classList.add("hover");
        });

        cell.addEventListener("mouseout", () => {
          cell.classList.remove("hover");
        });

        this.boardElement.appendChild(cell);
      }
    }
  }

  updateBoard(board) {
    const cells = this.boardElement.querySelectorAll(".cell");
    cells.forEach((cell) => {
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const boardCell = board.grid[x][y];

      cell.className = "cell";

      if (boardCell.isRevealed) {
        cell.classList.add("revealed");
        if (boardCell.isMine) {
          cell.classList.add("mine");
        } else if (boardCell.adjacentMines > 0) {
          cell.textContent = boardCell.adjacentMines;
          cell.classList.add(`adjacent-${boardCell.adjacentMines}`);
        }
      } else if (boardCell.isFlagged) {
        cell.classList.add("flagged");
      }
    });
  }

  updateGameStatus(flagsPlaced, totalMines, time) {
    this.minesCountElement.textContent = totalMines - flagsPlaced;
    this.timerElement.textContent = time;
  }

  updatePauseButton(isPaused) {
    this.pauseButton.textContent = isPaused ? "继续" : "暂停";
  }

  showMessage(message, type) {
    this.messageElement.textContent = message;
    this.messageElement.className = `game-message ${type}`;
  }

  hideMessage() {
    this.messageElement.className = "game-message";
  }
}
