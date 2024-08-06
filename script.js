// Начальное состояние игры, включает сетку (grid) и флаг, указывающий, чей ход (myTurn).
let state = {
  grid: _.map(_.range(0, 9), index => {
    return { index, figure: -1 };  // Инициализируем каждую ячейку с индексом и фигурами, которые изначально отсутствуют (-1).
  }),
  myTurn: true  // Изначально ход игрока.
};

// Клонируем начальное состояние для возможности сброса игры.
const appState = _.cloneDeep(state);

// Определяем компонент для отображения одной ячейки игрового поля.
const block = Vue.component('block', {
  name: 'block',

  template: '#block',

  props: {
    figure: {
      type: Number,
      default: -1  // Значение по умолчанию, если фигура не определена.
    }
  },

  computed: {
    // Определяет отображаемую фигуру в зависимости от значения пропса figure.
    fig() {
      return this.figure === 0 ? 'O' : 'X';
    }
  },

  data() {
    return {
      ...state,
      isAIThinking: false,
      gameOver: false,
      gameResult: null
    };
  },

  methods: {
    // Метод анимации для появления ячейки при ее создании.
    enter(el, done) {
      TweenMax.from(el, 1, {
        autoAlpha: 0,
        scale: 0,
        ease: Elastic.easeOut.config(1.25, 0.5),
        onComplete: done
      });
    }
  }
});

// Определяем компонент для отображения окна с сообщением о победе.
const gameResult = Vue.component('game-result', {
  name: 'game-result',
  template: '#game-result',
  props: {
    result: {
      type: String,
      required: true,
      validator: value => ['win', 'lose', 'draw'].includes(value)
    },
    clickHandler: {
      type: Function,
      default: null
    }
  },
  computed: {
    resultMessage() {
      switch(this.result) {
        case 'win': return 'You Win!';
        case 'lose': return 'You Lose!';
        case 'draw': return 'It\'s a Draw!';
      }
    }
  }
});


// Основной экземпляр Vue, управляющий игрой.
const app = new Vue({
  name: 'app',

  el: '#app',

  data() {
    return {
      ...state,  // Состояние игры.
      isAIThinking: false  // Флаг, указывающий, думает ли ИИ.
    };
  },

  components: {
    block,
    'game-result': gameResult
  },

  computed: {
    // Определяет, есть ли победитель.
    winner() {
      const wins = ['012', '036', '345', '147', '258', '678', '048', '246'];
      const grid = this.grid;
      const player = this.myTurn ? 0 : 1;
      const moves = _.reduce(this.grid, (result, value, index) => {
        if (value.figure === player) {
          result.push(index);  // Собираем индексы, где стоит фигура игрока.
        }
        return result;
      }, []);

      // Проверяем, есть ли выигрышная комбинация.
      return !!_.find(wins, win => {
        const combination = _.map(win.split(''), n => parseInt(n));
        return _.difference(combination, moves).length === 0;
      });
    }
  },

  methods: {
    enterResult(el, done) {
      TweenMax.from(el, 1, {
        autoAlpha: 0,
        scale: 0,
        ease: Elastic.easeOut.config(1.25, 0.5),
        onComplete: done
      });
    },
    // Метод для обработки выбора ячейки.
    select(index) {
      if (this.isAIThinking || !this.myTurn) {
        return;  // Игрок не может выбирать ячейки, если ИИ думает или не его ход.
      }
      const { figure } = this.grid[index];
    
      if (figure > -1) {
        return;  // Ячейка уже занята, ничего не делаем.
      }
    
      // Устанавливаем фигуру игрока (1 или 0) и переключаем ход.
      this.grid[index].figure = this.myTurn ? 1 : 0;
      this.myTurn = !this.myTurn;
    
      // Проверка на победу игрока.
      if (this.winner) {
        this.gameOver = true;
        this.gameResult = 'win';
        return;
      }
      
      // Проверка на ничью
      if (this.grid.every(cell => cell.figure !== -1)) {
        this.gameOver = true;
        this.gameResult = 'draw';
        return;
      }
    
      // Ход ИИ.
      if (!this.myTurn) {
        this.isAIThinking = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.aiMove();  // Выполняем ход ИИ.
            this.isAIThinking = false;
            this.myTurn = true;  // Возвращаем ход игроку.
          }, 500);
        });
      }
    },
    
    // Метод для перезапуска игры.
    restart() {
      this.grid = _.cloneDeep(appState.grid);
      this.myTurn = appState.myTurn;
      this.gameOver = false;
      this.gameResult = null;
    },
    

    // Метод для анимации появления элементов.
    enter(el, done) {
      TweenMax.from(el, 1, {
        autoAlpha: 0,
        scale: 0,
        ease: Elastic.easeOut.config(1.25, 0.5)
      });
    },

    // Метод для анимации выигрыша.
    enterWin(el) {
      TweenMax.from(el, 1, {
        autoAlpha: 0,
        scale: 0,
        ease: Elastic.easeOut.config(1.25, 0.5)
      });
    },

    // Метод для выполнения хода ИИ.
    aiMove() {
      const board = this.grid.map(square => square.figure === -1 ? '' : (square.figure === 0 ? 'O' : 'X'));
      
      // Попробуем найти лучший ход для ИИ.
      let bestMove = this.findBestMove(board);
      if (bestMove !== undefined) {
        this.grid[bestMove].figure = 0;  // ИИ всегда ставит 'O'.
        return;
      }
      
      // Если ИИ не может выиграть, попробуем заблокировать противника.
      const opponentMove = this.findBestMove(board, true);
      if (opponentMove !== undefined) {
        this.grid[opponentMove].figure = 0;
        return;
      }
    
      // Если нет выигрышных или блокирующих ходов, выберите случайный ход.
      bestMove = this.findBestMove(board);
      if (bestMove !== undefined) {
        this.grid[bestMove].figure = 0;
      }
      this.grid[bestMove].figure = 0;  // ИИ ставит 'O'
      
      if (this.checkWinner(this.grid.map(cell => cell.figure === 0 ? 'O' : (cell.figure === 1 ? 'X' : '')))) {
        this.gameOver = true;
        this.gameResult = 'lose';
        return;
      }
  
      // Проверка на победу ИИ
      if (this.checkWinner(this.grid.map(cell => cell.figure === 0 ? 'O' : (cell.figure === 1 ? 'X' : '')))) {
        this.gameOver = true;
        this.gameResult = 'lose';
        return;
      }
      
      // Проверка на ничью
      if (this.grid.every(cell => cell.figure !== -1)) {
        this.gameOver = true;
        this.gameResult = 'draw';
        return;
      }
    },
    
    // Алгоритм Minimax с альфа-бета усечением.
    minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
      const scores = {
        X: 10,
        O: -10,
        tie: 0
      };
      
      let result = this.checkWinner(board);
      if (result !== null) {
        return scores[result];
      }
      
      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === '') {
            board[i] = 'X';
            let score = this.minimax(board, depth + 1, false, alpha, beta);
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
            let score = this.minimax(board, depth + 1, true, alpha, beta);
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
    },
    
    // Метод для нахождения лучшего хода для ИИ или блокировки противника.
    findBestMove(board, blockOpponent = false) {
      const center = 4;
      // Если центр свободен, ИИ предпочтет занять центр.
      if (board[center] === '') {
        return center;
      }
    
      // Если необходимо заблокировать противника, пытаемся найти лучший блокирующий ход.
      if (blockOpponent) {
        let bestMove = this.findBestMove(board);
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
          let score = this.minimax(board, 0, false);
          board[i] = '';
          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
      return move;
    },

    // Метод для проверки, есть ли победитель на текущем игровом поле.
    checkWinner(board) {
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
    },

    // Метод для оценки позиции на основе всех линий.
    evaluate(board) {
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
  }
});