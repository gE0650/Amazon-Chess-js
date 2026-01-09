import { GetAmazons, GetBlockers, Setboard, FileID, GetCurrentPlayer, API_URL, winner, currentMode } from './chessboard.js';

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

async function PlaceBlock(col, row) {
    try {
        // 路径对应 router 里的 /block/:fileid
        const response = await fetch(`${API_URL}/move/block/${FileID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ col, row }),
        });
        
        const data = await response.json();
        if (data.success) {
            // 同步后端返回的最新的 pieces 和 blocks 到本地变量
            Setboard(data.pieces, data.blocks, data.currentPlayer);

            if (data.winner !== null && data.winner !== undefined) {
                setTimeout(() => {
                    alert(`游戏结束！玩家 ${data.winner === 1 ? '1 (红)' : '0 (蓝)'} 获胜！`);
                }, 100);
            }

            return true;
        } else {
            alert(data.message); // 弹出“位置已被占用”等错误
            return false;
        }
    } catch (e) {
        console.error('射箭同步失败', e);
        return false;
    }
}

async function Movepiece(piece, newcol, newrow) {
    try {
        const response = await fetch(`${API_URL}/move/${FileID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                piece: {
                    row: piece.row,
                    col: piece.col,
                },
                newrow: newrow,
                newcol: newcol,
            }),
        });
        const data = await response.json();
        if(data.success) {
            Setboard(data.pieces, data.blocks, data.currentPlayer);
        }
        else {
            console.error('渲染棋盘出错');
        }
    } catch(e) {
        console.error('请求移动出错');
    }
}

Board.addEventListener('click', async (e) => {
    if (winner !== null && winner !== undefined) {
        console.log("游戏已结束，操作已锁定");
        return;
    }

    if (currentMode === 'pve' && GetCurrentPlayer() === 0) {
        console.warn("AI 正在思考中，请稍后...");
        return; 
    }

    const square = e.target.closest('.square');
    if (!square) return;

    const row = parseInt(square.dataset.row, 10);
    const col = parseInt(square.dataset.col, 10);
    console.log(`检测到点击: ${row}, ${col}`);

    

    if (blockmode) {
        if (!square.classList.contains('highlight')) return;

        const success = await PlaceBlock(col, row);

        if (success) {
            // 3. 后端同步成功后，更新 UI 表现
            square.classList.add('blocker');
        
            // 4. 重置状态，准备进入下一个玩家的回合
            Clearhighlights();
            blockmode = false;
            selectedpiece = null;
            
            console.log("射箭成功，回合结束");
            
            // 建议：在这里调用一个全局渲染函数（如 RenderAll），
            // 确保棋盘上所有棋子和障碍物的位置与后端返回的数据完全一致。
        } else {
            console.error("射箭失败，请重试");
        }
        return;
    }

    if (movemode) {
        if (!square.classList.contains('highlight')) return;

        const newCol = col;
        const newRow = row;
        await Movepiece(selectedpiece, newCol, newRow);

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
    if (target.user !== GetCurrentPlayer()) {
        console.warn("这不是你的棋子，请等待对方行动");
        return;
    }
    
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

document.getElementById('undo-btn').onclick = async () => {
    try {
        const response = await fetch(`${API_URL}/move/undo/${FileID}`, {
            method: 'POST'
        });
        const result = await response.json();

        if (result.success) {
            // 使用后端返回的数据重新渲染棋盘
            Setboard(result.pieces, result.blocks, result.currentPlayer);
            // 重置前端交互状态
            selectedpiece = null;
            movemode = false;
            Clearhighlights();
            console.log("悔棋成功");
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("悔棋请求失败:", error);
    }
};