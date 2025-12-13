// 模块化脚本, 不用考虑多个 scripts 变量重名
import './chessboardaction.js';
const Template = document.getElementById("chessboxtemplate");
const Container = document.getElementById("chessboard");
const API_URL = "http://localhost:3000";
const params = new URLSearchParams(window.location.search);
const FileID = params.get('fileid') || 'default';

let amazons = [];   // 存后端返回的pieces数组
let blockers = [];  // 存障碍物坐标

//给actions用的函数
export function Setboard(pieces, blocks = []) {
    amazons = pieces || [];
    blockers = blocks || [];
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
            Renderpieces(board.pieces);
        } else if (res.status === 404) {
            const res2 = await fetch(
                `${API_URL}/create/${FileID}`,{ method: 'POST' }
            );
            if (res2.ok) {
                const board = await res2.json();
                Renderpieces(board.pieces);
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
