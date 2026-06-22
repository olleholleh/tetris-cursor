const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL_MS = 800;

const SCORE_BY_LINES = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

const PIECE_DEFINITIONS = {
  I: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  S: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  Z: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  J: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  L: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
};

const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const gameStatusElement = document.getElementById("game-status");
const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

let board = [];
let cells = [];
let currentPiece = null;
let score = 0;
let isGameOver = false;
let dropTimerId = null;
let keyboardInitialized = false;

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function initBoardDOM() {
  boardElement.innerHTML = "";
  cells = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      boardElement.appendChild(cell);
      cells.push(cell);
    }
  }
}

function getCell(row, col) {
  return cells[row * COLS + col];
}

function createPiece(type) {
  const definition = PIECE_DEFINITIONS[type];
  const matrix = definition.matrix.map((row) => [...row]);

  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0,
  };
}

function createRandomPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return createPiece(type);
}

function canMove(piece, dx, dy, matrix) {
  const nextX = piece.x + dx;
  const nextY = piece.y + dy;

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (!matrix[row][col]) {
        continue;
      }

      const boardRow = nextY + row;
      const boardCol = nextX + col;

      if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) {
        return false;
      }

      if (boardRow < 0) {
        continue;
      }

      if (board[boardRow][boardCol]) {
        return false;
      }
    }
  }

  return true;
}

function clearLines() {
  const remainingRows = board.filter(
    (row) => !row.every((cell) => cell !== null)
  );
  const linesCleared = ROWS - remainingRows.length;

  while (remainingRows.length < ROWS) {
    remainingRows.unshift(Array(COLS).fill(null));
  }

  board = remainingRows;
  return linesCleared;
}

function addScore(linesCleared) {
  if (linesCleared <= 0) {
    return;
  }

  score += SCORE_BY_LINES[linesCleared] ?? linesCleared * 100;
}

function trySpawnPiece() {
  currentPiece = createRandomPiece();

  if (!canMove(currentPiece, 0, 0, currentPiece.matrix)) {
    currentPiece = null;
    return false;
  }

  return true;
}

function triggerGameOver() {
  isGameOver = true;
  stopDropTimer();
  updateGameStatusDisplay();
  renderBoard();
}

function lockPiece() {
  if (!currentPiece) {
    return;
  }

  const { matrix, type, x, y } = currentPiece;

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (!matrix[row][col]) {
        continue;
      }

      const boardRow = y + row;
      const boardCol = x + col;

      if (
        boardRow >= 0 &&
        boardRow < ROWS &&
        boardCol >= 0 &&
        boardCol < COLS
      ) {
        board[boardRow][boardCol] = type;
      }
    }
  }

  currentPiece = null;
}

function settlePiece() {
  lockPiece();

  const linesCleared = clearLines();
  if (linesCleared > 0) {
    addScore(linesCleared);
    updateScoreDisplay();
  }

  if (!trySpawnPiece()) {
    triggerGameOver();
    return;
  }

  renderBoard();
}

function dropPiece() {
  if (isGameOver || !currentPiece) {
    return;
  }

  const { matrix } = currentPiece;

  if (canMove(currentPiece, 0, 1, matrix)) {
    currentPiece.y += 1;
    renderBoard();
    return;
  }

  settlePiece();
}

function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotated[col][rows - 1 - row] = matrix[row][col];
    }
  }

  return rotated;
}

function tryMovePiece(dx, dy) {
  if (!currentPiece) {
    return false;
  }

  const { matrix } = currentPiece;

  if (!canMove(currentPiece, dx, dy, matrix)) {
    return false;
  }

  currentPiece.x += dx;
  currentPiece.y += dy;
  renderBoard();
  return true;
}

function rotatePiece() {
  if (!currentPiece) {
    return;
  }

  const rotatedMatrix = rotateMatrix(currentPiece.matrix);

  if (!canMove(currentPiece, 0, 0, rotatedMatrix)) {
    return;
  }

  currentPiece.matrix = rotatedMatrix;
  renderBoard();
}

function softDrop() {
  tryMovePiece(0, 1);
}

function hardDrop() {
  if (isGameOver || !currentPiece) {
    return;
  }

  const { matrix } = currentPiece;

  while (canMove(currentPiece, 0, 1, matrix)) {
    currentPiece.y += 1;
  }

  settlePiece();
}

function startDropTimer() {
  stopDropTimer();
  dropTimerId = setInterval(dropPiece, DROP_INTERVAL_MS);
}

function stopDropTimer() {
  if (dropTimerId !== null) {
    clearInterval(dropTimerId);
    dropTimerId = null;
  }
}

function clearCellStyle(cell) {
  cell.className = "cell";
}

function drawPiece() {
  if (!currentPiece) {
    return;
  }

  const { matrix, type, x, y } = currentPiece;

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (!matrix[row][col]) {
        continue;
      }

      const boardRow = y + row;
      const boardCol = x + col;

      if (
        boardRow < 0 ||
        boardRow >= ROWS ||
        boardCol < 0 ||
        boardCol >= COLS
      ) {
        continue;
      }

      const cell = getCell(boardRow, boardCol);
      cell.className = "cell filled";
      cell.classList.add(`block-${type}`);
    }
  }
}

function renderBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = getCell(row, col);
      clearCellStyle(cell);

      const blockType = board[row][col];
      if (blockType) {
        cell.classList.add("filled", `block-${blockType}`);
      }
    }
  }

  drawPiece();
}

function updateScoreDisplay() {
  scoreElement.textContent = String(score);
}

function updateGameStatusDisplay() {
  if (isGameOver) {
    gameStatusElement.textContent = "게임 오버";
    gameStatusElement.classList.add("is-game-over");
    return;
  }

  gameStatusElement.textContent = "";
  gameStatusElement.classList.remove("is-game-over");
}

function resetGame() {
  stopDropTimer();
  isGameOver = false;
  board = createEmptyBoard();
  score = 0;
  currentPiece = null;
  updateScoreDisplay();
  updateGameStatusDisplay();
  trySpawnPiece();
  renderBoard();
  startDropTimer();
}

function handleStart() {
  resetGame();
}

function handleRestart() {
  resetGame();
}

function handleKeyDown(event) {
  if (isGameOver || !currentPiece) {
    return;
  }

  switch (event.code) {
    case "ArrowLeft":
      event.preventDefault();
      tryMovePiece(-1, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      tryMovePiece(1, 0);
      break;
    case "ArrowDown":
      event.preventDefault();
      softDrop();
      break;
    case "ArrowUp":
      event.preventDefault();
      rotatePiece();
      break;
    case "Space":
      event.preventDefault();
      hardDrop();
      break;
    default:
      break;
  }
}

function initKeyboardControls() {
  if (keyboardInitialized) {
    return;
  }

  document.addEventListener("keydown", handleKeyDown);
  keyboardInitialized = true;
}

startButton.addEventListener("click", handleStart);
restartButton.addEventListener("click", handleRestart);

initBoardDOM();
initKeyboardControls();
resetGame();
