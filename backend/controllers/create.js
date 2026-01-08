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
  return {
    id: fileID,
    currentPlayer: 1,
    status: "playing", // 初始状态为进行中
    winner: null,      // 初始无胜者
    pieces: [ //color: 需要和前端一致
      {col:0, row:3, user:1},
      {col:0, row:6, user:1},
      {col:3, row:0, user:1},
      {col:3, row:9, user:1},
      {col:6, row:0, user:0},
      {col:6, row:9, user:0},
      {col:9, row:3, user:0},
      {col:9, row:6, user:0},
    ],
    moves: [],
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
