/*const boardEl = document.getElementById('amazonchessboard');
let selectedPiece = null;
let moveMode = false;
let blockMode = false;
let highlightSquares = [];
let boardState = [];
let blockers = [];

// 获取当前棋盘状态（从渲染函数注入）
window.setAmazonBoardState = function(pieces, blocks) {
  boardState = pieces;
  blockers = blocks || []; //若blocks未传则使用空数组
};*/

/*function clearHighlights() {
  highlightSquares.forEach(sq => sq.classList.remove('highlight'));
  highlightSquares = [];
}

function getPieceAt(row, col) {
  return boardState.find(p => p.row === row && p.col === col);
  //find: 数组方法, 返回第一个满足的元素
}
function isBlockerAt(row, col) {
  return blockers.some(b => b.row === row && b.col === col);
  //some: 类似find, 但返回布尔值而非元素
}*/

/*function getAmazonMoves(row, col) { //能走到哪里
  const moves = [];
  const dirs = [
    [1,0],[-1,0],[0,1],[0,-1],
    [1,1],[1,-1],[-1,1],[-1,-1]
  ];
  for (const [dr,dc] of dirs) {
    for (let k=1;k<10;k++) {
      const nr=row+dr*k, nc=col+dc*k;
      if (nr<0||nr>=10||nc<0||nc>=10) break;
      if (getPieceAt(nr,nc) || isBlockerAt(nr,nc)) break;
      moves.push([nr,nc]);
    }
  }
  return moves;
}

function getBlockerMoves(row, col) {
  // 走到row, col的棋子可以放障碍的位置
  const moves = [];
  const dirs = [
    [1,0],[-1,0],[0,1],[0,-1],
    [1,1],[1,-1],[-1,1],[-1,-1]
  ];
  for (const [dr,dc] of dirs) {
    for (let k=1;k<10;k++) {
      const nr=row+dr*k, nc=col+dc*k;
      if (nr<0||nr>=10||nc<0||nc>=10) break;
      if (getPieceAt(nr,nc) || isBlockerAt(nr,nc)) break;
      moves.push([nr,nc]);
    }
  }
  return moves;
}*/

/*boardEl.addEventListener('click', (e) => { //e: 事件对象
  const sq = e.target.closest('.square');
  if (!sq) return;
  const row = parseInt(sq.dataset.row, 10); //10: 进制
  const col = parseInt(sq.dataset.col, 10);

  // 阻挡模式：放置障碍
  if (blockMode) {
    if (!sq.classList.contains('highlight')) return; //不高亮则退出
    blockers.push({row, col});
    sq.classList.add('blocker'); // 在sq上加 class='blocker'
    clearHighlights();
    blockMode = false;
    selectedPiece = null;
    return;
  }

  // 移动模式：棋子移动
  if (moveMode) {
    if (!sq.classList.contains('highlight')) return;
    if (selectedPiece) {
      selectedPiece.row = row;
      selectedPiece.col = col;
      // 重新渲染棋盘（这里只做前端演示，实际应调用后端接口）
      document.querySelectorAll('.piece').forEach(cell => {
        cell.textContent = '';
      });
      boardState.forEach(p => {
        const cell = boardEl.querySelector(`.square[data-row="${p.row}"][data-col="${p.col}"] .piece`);
        if (cell) cell.textContent = 'A';
      });
    }
    clearHighlights();
    moveMode = false;
    blockMode = true;
    // 高亮可放障碍格子
    const blockMoves = getBlockerMoves(row, col);
    blockMoves.forEach(([r,c]) => {
      const sq2 = boardEl.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
      if (sq2) {
        sq2.classList.add('highlight');
        highlightSquares.push(sq2);
      }
    });
    return;
  }

  // 默认：选择棋子
  const piece = getPieceAt(row, col);
  if (piece && piece.piece === 'A') {
    selectedPiece = piece;
    clearHighlights();
    moveMode = true;
    // 高亮可走格子
    const moves = getAmazonMoves(row, col);
    moves.forEach(([r,c]) => {
      const sq2 = boardEl.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
      if (sq2) {
        sq2.classList.add('highlight');
        highlightSquares.push(sq2);
      }
    });
  } else {
    clearHighlights();
    selectedPiece = null;
    moveMode = false;
    blockMode = false;
  }
});*/

// 规则草案：
// Amazon (A): 合并皇后 + 骑士所有走法；不受现阶段其它额外限制。
// 已实现：
// 1. 点击棋子高亮可走格子
// 2. 点击高亮格子移动棋子并高亮障碍格子
// 3. 点击高亮障碍格子放置障碍
// 后续可添加：
// 1. 合法走子校验 2. 吃子与更新 3. moves 序列写入后端 4. 棋局结束判定。
