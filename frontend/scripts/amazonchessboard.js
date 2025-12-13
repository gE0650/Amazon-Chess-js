/*import './amazonchessboardaction.js';

const template = document.getElementById('squareTemplate');
const container = document.getElementById('amazonchessboard');
const API_URL = 'http://localhost:3100/amazon';

const params = new URLSearchParams(window.location.search);
const fileID = params.get('fileid') || 'default';*/

/*buildBoard();
loadBoard();*/

/*async function loadBoard() {
  try {
    const res = await fetch(`${API_URL}/search/${fileID}`);
    if (res.ok) {
      const board = await res.json();
      renderPieces(board.pieces);
    } else if (res.status === 404) {
      const createRes = await fetch(`${API_URL}/create/${fileID}`, {method:'POST'});
      if (createRes.ok) {
        const res2 = await fetch(`${API_URL}/search/${fileID}`);
        if (res2.ok) {
          const board = await res2.json();
          renderPieces(board.pieces);
        }
      }
    }
  } catch (e) {
    console.error('加载Amazon棋盘失败', e);
  }
}*/

/*function buildBoard() {
  for (let r=0;r<10;r++) {
    for (let c=0;c<10;c++) {
      const clone = template.content.cloneNode(true);
      const sq = clone.querySelector('.square');
      sq.dataset.row = r;
      sq.dataset.col = c;
      sq.dataset.color = (r + c) % 2 === 0 ? 'dark' : 'light';
      container.appendChild(clone);
    }
  }
}*/

/*function renderPieces(pieces) {
  pieces.forEach(p => {
    const cell = container.querySelector(`.square[data-row="${p.row}"][data-col="${p.col}"] .piece`);
    if (!cell) return;
    cell.dataset.piece = p.piece;
    cell.dataset.color = p.color;
    cell.textContent = symbolFor(p.piece, p.color);
  });
}*/

function symbolFor(piece, color) {
  // simple text; could swap to Unicode or images later
  const base = piece;
  return color === 'white' ? base : base.toLowerCase();
}
