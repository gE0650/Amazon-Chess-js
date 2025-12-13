import { GetAmazons, GetBlockers } from './chessboard.js';

const Board = document.getElementById('chessboard'); // getElementById 不用加点

let highlights = [];     // 存高亮格子, 而非坐标
let selectedpiece = null; // amazons 中的一个对象
let movemode = false;
let blockmode = false;

function Getpieceat(col, row) {
    return GetAmazons().find(p => p.row === row && p.col === col);
}

function Isblockedat(col, row) {
    return GetBlockers().some(p => p.row === row && p.col === col);
}

// ===== UI 工具函数 =====
function Clearhighlights() {
    highlights.forEach(elem => {
        elem.classList.remove('highlight');
    });
    highlights = [];
}

function Getmoves(col, row) { //返回坐标
    // 可以走到的位置, 棋子 & 障碍均适用
    const moves = [];
    const dirs = [
        [1, 1], [1, 0], [1, -1],[0, 1], [0, -1],[-1, 1], [-1, 0], [-1, -1]
    ];

    dirs.forEach(([dc, dr]) => {
        for (let i = 1; i < 10; i++) {
            const cr = row + i * dr;
            const cc = col + i * dc;
            if (cr < 0 || cr >= 10 || cc < 0 || cc >= 10) break;
            if (Getpieceat(cc, cr) || Isblockedat(cc, cr)) break;
            moves.push([cc, cr]);
        }
    });

    return moves;
}

Board.addEventListener('click', (e) => {
    const square = e.target.closest('.square');
    if (!square) return;

    const row = parseInt(square.dataset.row, 10);
    const col = parseInt(square.dataset.col, 10);
    console.log(`检测到点击: ${row}, ${col}`);

    if (blockmode) {
        if (!square.classList.contains('highlight')) return;
        square.classList.add('blocker');
        Clearhighlights();
        blockmode = false;
        selectedpiece = null;
        return;
    }

    if (movemode) {
        if (!square.classList.contains('highlight')) return;

        selectedpiece.col = col;
        selectedpiece.row = row;

        Clearhighlights();
        square.classList.add('highlight');
        highlights.push(square);

        movemode = false;
        blockmode = true;

        const moves = Getmoves(col, row);
        moves.forEach(([nc, nr]) => {
            const nextsquare = Board.querySelector(
                `.square[data-col="${nc}"][data-row="${nr}"]`
            );
            nextsquare.classList.add('highlight');
            highlights.push(nextsquare);
        });
        return;
    }

    const target = Getpieceat(col, row);
    if (target) {
        Clearhighlights();
        selectedpiece = target;
        movemode = true;

        const moves = Getmoves(col, row);
        moves.forEach(([nc, nr]) => {
            const nextsquare = Board.querySelector(
                `.square[data-col="${nc}"][data-row="${nr}"]`
            );
            nextsquare.classList.add('highlight');
            highlights.push(nextsquare);
        });
    } else {
        Clearhighlights();
        selectedpiece = null;
        movemode = false;
        blockmode = false;
    }
});
