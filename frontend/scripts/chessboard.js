import './chessboardaction.js';
//模块化脚本, 不用考虑多个scripts变量重名
const Template = document.getElementById("chessboxtemplate");
const Container = document.getElementById("chessboard");
const API_URL = "http://localhost:3000";
const params = new URLSearchParams(window.location.search);
const FileID = params.get('fileid') || 'default';

Buildboard();
Loadborad();

async function Loadborad() {
    try {
        const res = await fetch(`${API_URL}/search/${FileID}`);
        if(res.ok) {
            const board = await res.json();
            //res只有头和流, 下载&解析需要时间
            Renderpieces(board.pieces);//Backend API
        }
        else if(res.status === 404) {
            const res2 = await fetch(`${API_URL}/create/${FileID}`
                , {method:'POST'});
            if(res2.ok) {
                const board = await res2.json();
                Renderpieces(board.pieces);//Backend API
            }
        }
    } catch(e) {
        console.error('加载棋盘失败', e);
    }
}

function Buildboard() {
    for(let col = 0; col < 10; col++) {
        for(let row = 0; row < 10; row++) {
            const clone = Template.content.cloneNode(true);
            //Template是元素, content是其内部结构
            //若无cloneNode, 得到引用而非复制
            const square = clone.querySelector('.square');
            //clone是DocumentFragment, 不是元素
            square.dataset.row = row;
            square.dataset.col = col;
            square.dataset.color = (row + col) % 2 ? 'dark' : 'light';
            Container.appendChild(square);
        }
    }
}

function Renderpieces(pieces) {
    pieces.forEach(p => {
        const piece = Container.querySelector(`.square[data-row="${p.row}"][data-col="${p.col}"] .piece`);
        if(!piece) {
            console.error('渲染棋子出错');
            return;
        }
        //console.log('成功, 即将渲染')
        piece.dataset.user = p.user;
    });
    Setboard(pieces, []);
}