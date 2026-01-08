const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/chessboards.json");

function Readchessboards() {
  try {
    if (!fs.existsSync(dataPath)) return [];
    const data = fs.readFileSync(dataPath, "utf-8");
    const parsed = JSON.parse(data || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('读取棋盘出错', err);
    return [];
  }
}

function WriteChessboard(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  //null: 全写进去
  //2: 缩进2格
}

function Initialboard(fileID) {
  // 1. 先定义初始的棋子位置
  const initialPieces = [
    {col:0, row:3, user:1},
    {col:0, row:6, user:1},
    {col:3, row:0, user:1},
    {col:3, row:9, user:1},
    {col:6, row:0, user:0},
    {col:6, row:9, user:0},
    {col:9, row:3, user:0},
    {col:9, row:6, user:0},
  ];

  // 2. 返回完整的对象
  return {
    id: fileID,
    currentPlayer: 1,
    status: "playing",
    winner: null,
    pieces: initialPieces,
    moves: [],
    // 关键修改：初始化时存入“第 0 步”快照
    history: [
      {
        pieces: JSON.parse(JSON.stringify(initialPieces)), // 深拷贝初始棋子
        blocks: [],                                       // 初始障碍物为空
        currentPlayer: 1,                                 // 初始是白方回合
        status: "playing",
        winner: null
      }
    ]
  };
}

exports.Addchessboard = (req, res) => {
  const fileID = req.params.fileid;
  const boards = Readchessboards();
  const newboard = Initialboard(fileID);
  boards.push(newboard);
  WriteChessboard(boards);
  console.log('add file succeed');
  res.status(201).json(newboard);
};
