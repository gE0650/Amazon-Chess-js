//模块化脚本, 不用考虑多个scripts变量重名
const Board = document.getElementById('chessboard'); //getelementbyid不用加点

let amazons = [];
//存后端返回的棋子数组, 需改正
let blockers = [];
//存障碍物坐标
let highlights = [];
//存高亮格子, 而非坐标
//highlight 属性是加给格子而非棋子的
let selectedpiece = null;
//一个坐标, 是amazons中一个对象
let movemode = false;
let blockmode = false;

window.Setboard = function(pieces, blocks) {
  //定义了一个能从其他script调用的Setboard函数
  amazons = pieces || [];
  blockers = blocks || [];
  return;
};
//这种定义需要加分号

function Getpieceat(col, row) {
  return amazons.find(p => p.row === row && p.col === col);
  //find: 返回第一个元素, 若无则undifined(false)
}

function Isblockedat(col, row) {
  return blockers.some(p => p.row === row && p.col === col);
  //some: 类似find, 但返回bool值而非对象
}

function Clearhighlights() {
  highlights.forEach(elem => {
    elem.classList.remove('highlight');
  });
  highlights = [];
}

function Getmoves(col, row) {
  //可以走到的位置, 棋子&障碍均适用
  const moves = []; //const: 不能赋值, 但可修改
  const dirs = [
    [1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]
  ];
  dirs.forEach(([dc, dr]) => {
    //箭头函数: 多变量/解构必须加()
    for(let i = 1; i < 10; i++) {
      const cr = row + i * dr, cc = col + i * dc;
      if(cr < 0 || cr >= 10 || cc < 0 || cc >= 10) break;
      if(Getpieceat(cc, cr) || Isblockedat(cc, cr)) break;
      moves.push([cc, cr]);
    }
  });
  return moves;
}

Board.addEventListener('click', (e) => {
  const square = e.target.closest('.square');
  if(!square) return;
  //e: 事件对象
  //e.target: 点击的东西(可能是piece或square)
  //.closest: 树上最近的父节点
  const row = parseInt(square.dataset.row, 10);
  const col = parseInt(square.dataset.col, 10);
  console.log(`检测到点击棋子: ${row}, ${col}`);
  //dataset: 也能访问, 但返回字符串
  //parseInt: (origin, base);

  if(blockmode) {
    if(!square.classList.contains('highlight')) return; //点错了
    blockers.push([col, row]);
    square.classList.add('blocker');
    Clearhighlights();
    blockmode = false;
    selectedpiece = null;
    //这里需要写后端接口
    //乐观更新, 故这里才写
    return;
  }

  if(movemode) {
    if(!square.classList.contains('highlight')) return;
    const pieceElem = square.querySelector('.piece');
    if(!pieceElem) {
      console.error('移动失败：目的地没棋子占位');
      return;
    }
    //这里需渲染
    selectedpiece.col = col;
    selectedpiece.row = row;
    Clearhighlights();
    //pieceElem.classList.add('highlight');
    square.classList.add('highlight');
    //highlights.push(pieceElem);
    highlights.push(square);
    
    movemode = false;
    blockmode = true;

    const moves = Getmoves(col, row);
    moves.forEach(([nc, nr]) => {
      const nextsquare = Board.querySelector(`.square[data-col="${nc}"][data-row="${nr}"]`);
        nextsquare.classList.add('highlight');
        highlights.push(nextsquare);
        //console.log(`${nc}, ${nr} 处棋子高亮`);
    });
    //这里需要写后端接口
    return;
  }

  //正常模式
  const target = Getpieceat(col, row);
  if(target) {
    Clearhighlights();
    selectedpiece = target;
    console.log(`选中了${col}, ${row}处棋子`);
    movemode = true;
    const moves = Getmoves(col, row);
    moves.forEach(([nc, nr]) => {
      const nextsquare = Board.querySelector(`.square[data-col="${nc}"][data-row="${nr}"]`);
        nextsquare.classList.add('highlight');
        highlights.push(nextsquare);
    });
  }
  else {
    Clearhighlights();
    selectedpiece = null;
    movemode = false;
    blockmode = false;
  }
  return;
});