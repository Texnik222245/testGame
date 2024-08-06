// ai.js

// Алгоритм Minimax с альфа-бета усечением.
function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
  const scores = {
    X: 10,
    O: -10,
    tie: 0
  };
  
  let result = checkWinner(board);
  if (result !== null) {
    return scores[result];
  }
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, false, alpha, beta);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) {
          break;  // Усечение: нет необходимости проверять дальнейшие ходы.
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, true, alpha, beta);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) {
          break;  // Усечение: нет необходимости проверять дальнейшие ходы.
        }
      }
    }
    return bestScore;
  }
}

// Метод для нахождения лучшего хода для ИИ или блокировки противника.
function findBestMove(board, blockOpponent = false) {
  const center = 4;
  // Если центр свободен, ИИ предпочтет занять центр.
  if (board[center] === '') {
    return center;
  }

  // Если необходимо заблокировать противника, пытаемся найти лучший блокирующий ход.
  if (blockOpponent) {
    let bestMove = findBestMove(board);
    if (bestMove !== undefined) {
      return bestMove;
    }
  }

  // Оцените ходы и выберите лучший.
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'X';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// Метод для проверки, есть ли победитель на текущем игровом поле.
function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  // Проверяем все выигрышные линии.
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  // Если есть пустые ячейки, игра продолжается.
  if (board.includes('')) {
    return null;
  }
  // Если нет пустых ячеек и нет победителя, это ничья.
  return 'tie';
}

// Метод для оценки позиции на основе всех линий.
function evaluate(board) {
  const scores = {
    X: 10,
    O: -10,
    tie: 0
  };

  let score = 0;

  // Оценка всех линий.
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] === board[b] && board[b] === board[c]) {
      if (board[a] === 'X') {
        score += 10;
      } else if (board[a] === 'O') {
        score -= 10;
      }
    }
  }
  
  return score;
}

// Экспортируем функции для использования в основном скрипте.
window.minimax = minimax;
window.findBestMove = findBestMove;
window.checkWinner = checkWinner;
window.evaluate = evaluate;
