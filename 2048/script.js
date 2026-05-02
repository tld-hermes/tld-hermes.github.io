// 2048 Game — Fixed implementation
const SIZE = 4;
let board, score, bestScore, gameOver, won;

// DOM refs
const boardEl = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best-score');
const finalScoreEl = document.getElementById('final-score');
const overlay = document.getElementById('game-over-overlay');
const gitHashEl = document.getElementById('git-hash');

let touchStartX = 0, touchStartY = 0;

function init() {
  startNewGame();
  document.getElementById('new-game').addEventListener('click', startNewGame);
  document.getElementById('try-again').addEventListener('click', startNewGame);
  document.addEventListener('keydown', onKey);
  boardEl.addEventListener('touchstart', onTouchStart, { passive: true });
  boardEl.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('resize', layoutBoard);
}

function layoutBoard() {
  // Keep square: height = width (synchronous)
  const w = boardEl.offsetWidth;
  if (w > 0) boardEl.style.height = w + 'px';

  // Position near bottom on next frame (browser needs to reflow)
  requestAnimationFrame(() => {
    boardEl.style.marginTop = '0px';
    const vh = window.innerHeight;
    const boardBottom = boardEl.getBoundingClientRect().bottom;
    const targetBottom = vh - 80;
    const diff = targetBottom - boardBottom;
    if (diff > 0) {
      boardEl.style.marginTop = diff + 'px';
    }
  });
}

function startNewGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  score = 0;
  gameOver = false;
  won = false;
  addRandomTile();
  addRandomTile();
  updateScore();
  render();
  overlay.classList.add('hidden');
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  boardEl.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (board[r][c] !== 0) {
        const tile = document.createElement('div');
        const val = board[r][c];
        tile.className = 'tile tile-' + val;
        tile.textContent = val;
        cell.appendChild(tile);
      }
      boardEl.appendChild(cell);
    }
  }
  // Keep square + position near bottom
  layoutBoard();
}

function onKey(e) {
  if (gameOver || won) return;
  const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  const dir = map[e.key];
  if (dir) { e.preventDefault(); move(dir); }
}

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e) {
  if (gameOver || won) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  let dir;
  if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left';
  else dir = dy > 0 ? 'down' : 'up';
  move(dir);
}

function slide(row) {
  let arr = row.filter(v => v !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < SIZE) arr.push(0);
  return arr;
}

function move(dir) {
  let moved = false;

  for (let i = 0; i < SIZE; i++) {
    if (dir === 'left') {
      const before = board[i].join(',');
      board[i] = slide(board[i]);
      if (board[i].join(',') !== before) moved = true;
    } else if (dir === 'right') {
      const rev = [...board[i]].reverse();
      const before = rev.join(',');
      const after = slide(rev);
      if (after.join(',') !== before) moved = true;
      board[i] = after.reverse();
    } else if (dir === 'up') {
      const col = board.map(r => r[i]);
      const before = col.join(',');
      const after = slide(col);
      if (after.join(',') !== before) moved = true;
      for (let r = 0; r < SIZE; r++) board[r][i] = after[r];
    } else if (dir === 'down') {
      const col = board.map(r => r[i]).reverse();
      const before = col.join(',');
      const after = slide(col);
      if (after.join(',') !== before) moved = true;
      const unrev = after.reverse();
      for (let r = 0; r < SIZE; r++) board[r][i] = unrev[r];
    }
  }

  if (!moved) return;

  addRandomTile();
  render();
  updateScore();

  // Win check
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] === 2048) { won = true; setTimeout(() => alert('🎉 You win!'), 100); return; }

  // Game over check
  if (isGameOver()) {
    gameOver = true;
    finalScoreEl.textContent = score;
    overlay.classList.remove('hidden');
  }
}

function isGameOver() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  return true;
}

function updateScore() {
  scoreEl.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('best-2048', bestScore);
    bestEl.textContent = bestScore;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bestScore = parseInt(localStorage.getItem('best-2048') || '0', 10);
  bestEl.textContent = bestScore;
  init();
});
