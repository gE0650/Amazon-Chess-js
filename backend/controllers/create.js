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
}

function Initialboard(fileID, mode) {
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

  return {
    id: fileID,
    mode: mode,
    currentPlayer: 1,
    status: "playing",
    winner: null,
    pieces: initialPieces,
    moves: [],
    // 关键修改：初始化时存入“第 0 步”快照
    history: [
      {
        pieces: JSON.parse(JSON.stringify(initialPieces)), // 拷贝而非引用
        blocks: [],
        currentPlayer: 1,
        status: "playing",
        winner: null
      }
    ]
  };
}

exports.Addchessboard = (req, res) => {
  const fileID = req.params.fileid;
  const mode = req.query.mode || "pvp";
  const boards = Readchessboards();
  const newboard = Initialboard(fileID, mode);
  boards.push(newboard);
  WriteChessboard(boards);
  console.log('add file succeed');
  res.status(201).json(newboard);
};
