// Helper utilities for Lights Out game logic

export function idx(row, col, size) {
  return row * size + col;
}

export function rc(index, size) {
  return { row: Math.floor(index / size), col: index % size };
}

// Toggle a cell and neighbors
export function toggleAt(board, index, size) {
  const newBoard = [...board];
  const { row, col } = rc(index, size);

  const toggle = (r, c) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      const i = idx(r, c, size);
      newBoard[i] = !newBoard[i];
    }
  };

  toggle(row, col); // self
  toggle(row - 1, col); // up
  toggle(row + 1, col); // down
  toggle(row, col - 1); // left
  toggle(row, col + 1); // right

  return newBoard;
}

// Ensure solvable board by applying random valid toggles to a solved board
export function generateSolvableBoard(size) {
  const total = size * size;
  let board = new Array(total).fill(false); // all lights OFF

  const randomClicks = total + Math.floor(Math.random() * total);

  for (let i = 0; i < randomClicks; i++) {
    const index = Math.floor(Math.random() * total);
    board = toggleAt(board, index, size);
  }

  return { board };
}

export function isSolved(board) {
  return board.every((cell) => cell === false);
}

export function countLights(board) {
  return board.reduce((sum, lit) => sum + (lit ? 1 : 0), 0);
}

// Suggest a helpful next toggle
export function bestHintIndex(board, size) {
  const total = size * size;
  let best = { index: 0, improvement: -Infinity };

  const currentLights = countLights(board);

  for (let i = 0; i < total; i++) {
    const newBoard = toggleAt(board, i, size);
    const newLights = countLights(newBoard);
    const improvement = currentLights - newLights;

    if (improvement > best.improvement) {
      best = { index: i, improvement };
    }
  }

  return best;
}
