// 模块化脚本, 不用考虑多个 scripts 变量重名
import './chessboardaction.js';
const Template = document.getElementById("chessboxtemplate");
const Container = document.getElementById("chessboard");
export const API_URL = "http://localhost:3000";
const params = new URLSearchParams(window.location.search);
export const FileID = params.get('fileid') || 'default';

let amazons = [];   // 存后端返回的pieces数组
let blockers = [];  // 存障碍物坐标
let currentPlayer = 1; // 默认为玩家 1
export let winner = null;

//给actions用的函数
export function Setboard(pieces, blocks = [], newPlayer, serverWinner = null) {
    amazons = pieces || [];
    blockers = blocks || [];
    if (newPlayer !== undefined) currentPlayer = newPlayer; // 更新当前回合
    winner = serverWinner;
    RenderAll(); // 只要数据变了，就重新渲染 UI
}

export function GetCurrentPlayer() {
    return currentPlayer;
}

export function GetAmazons() {
    return amazons;
}

export function GetBlockers() {
    return blockers;
}

Buildboard();
Loadboard();

async function Loadboard() {
    try {
        const res = await fetch(`${API_URL}/search/${FileID}`);
        if (res.ok) {
            const board = await res.json();
            Setboard(board.pieces, board.blocks, board.currentPlayer, board.winner);
        } else if (res.status === 404) {
            const res2 = await fetch(
                `${API_URL}/create/${FileID}`,{ method: 'POST' }
            );
            if (res2.ok) {
                const board = await res2.json();
                //Renderpieces(board.pieces);
                Setboard(board.pieces, board.blocks, board.currentPlayer, board.winner);
            }
        }
    } catch (e) {
        console.error('加载棋盘失败', e);
    }
}


function Buildboard() {
    for (let col = 0; col < 10; col++) {
        for (let row = 0; row < 10; row++) {
            const clone = Template.content.cloneNode(true);
            // Template 是元素, content 是其内部结构
            const square = clone.querySelector('.square');
            square.dataset.row = row;
            square.dataset.col = col;
            square.dataset.color = (row + col) % 2 ? 'dark' : 'light';
            Container.appendChild(square);
        }
    }
}


function Renderpieces(pieces) {
    pieces.forEach(p => {
        const piece = Container.querySelector(
            `.square[data-row="${p.row}"][data-col="${p.col}"] .piece`
        );
        if (!piece) {
            console.error('渲染棋子出错');
            return;
        }
        piece.dataset.user = p.user;
    });

    // 渲染完成后，同步数据给 action 层
    Setboard(pieces, []);
}

export function RenderAll() {
    // 1. 获取所有格子
    const allSquares = Container.querySelectorAll('.square');

    allSquares.forEach(square => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const pieceElem = square.querySelector('.piece');

        // 2. 清除当前格子的状态
        pieceElem.dataset.user = ""; // 移除棋子
        square.classList.remove('blocker'); // 移除障碍样式

        // 3. 检查是否应有棋子
        const p = amazons.find(a => a.row === row && a.col === col);
        if (p) {
            pieceElem.dataset.user = p.user;
        }

        // 4. 检查是否应有障碍物
        const b = blockers.find(blk => blk.row === row && blk.col === col);
        if (b) {
            square.classList.add('blocker');
        }
    });

    // 在 RenderAll 函数的最后面添加
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        if (winner !== null && winner !== undefined) {
            statusBar.textContent = `游戏结束！获胜者：玩家 ${winner === 1 ? '1 (红)' : '0 (蓝)'}`;
            statusBar.style.color = "red";
        } else {
            statusBar.textContent = `当前回合：玩家 ${currentPlayer === 1 ? '1 (红)' : '0 (蓝)'}`;
            statusBar.style.color = "black";
        }
    }
}