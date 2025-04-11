export default class Board {
  constructor() {
    this.size = 0;
    this.mineCount = 0;
    this.grid = [];
    this.flagsPlaced = 0;
    this.cellsRevealed = 0;
  }

  init(size, mineCount) {
    this.size = size;
    this.mineCount = mineCount;
    this.flagsPlaced = 0;
    this.cellsRevealed = 0;
    this.createGrid();
    this.placeMines();
    this.calculateAdjacentMines();
  }

  createGrid() {
    this.grid = [];
    for (let i = 0; i < this.size; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.grid[i][j] = {
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
      const x = Math.floor(Math.random() * this.size);
      const y = Math.floor(Math.random() * this.size);

      if (!this.grid[x][y].isMine) {
        this.grid[x][y].isMine = true;
        minesPlaced++;
      }
    }
  }

  calculateAdjacentMines() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (!this.grid[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (
                ni >= 0 &&
                ni < this.size &&
                nj >= 0 &&
                nj < this.size &&
                this.grid[ni][nj].isMine
              ) {
                count++;
              }
            }
          }
          this.grid[i][j].adjacentMines = count;
        }
      }
    }
  }

  revealCell(x, y) {
    const cell = this.grid[x][y];

    if (cell.isRevealed || cell.isFlagged) return false;

    cell.isRevealed = true;
    this.cellsRevealed++;

    if (cell.isMine) return true;

    if (cell.adjacentMines === 0) {
      // 自动展开空白区域
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const ni = x + di;
          const nj = y + dj;
          if (
            ni >= 0 &&
            ni < this.size &&
            nj >= 0 &&
            nj < this.size &&
            !(di === 0 && dj === 0)
          ) {
            this.revealCell(ni, nj);
          }
        }
      }
    }

    return false;
  }

  toggleFlag(x, y) {
    const cell = this.grid[x][y];

    if (cell.isRevealed) return;

    if (cell.isFlagged) {
      cell.isFlagged = false;
      this.flagsPlaced--;
    } else if (this.flagsPlaced < this.mineCount) {
      cell.isFlagged = true;
      this.flagsPlaced++;
    }
  }

  revealAllMines() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j].isMine) {
          this.grid[i][j].isRevealed = true;
        }
      }
    }
  }

  checkWin() {
    return this.cellsRevealed === this.size * this.size - this.mineCount;
  }
}
