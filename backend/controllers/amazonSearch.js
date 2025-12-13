const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/amazonchessboards.json");

function readBoards() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf-8");
  try { return JSON.parse(raw); } catch { return []; }
}

exports.getAmazonBoard = (req, res) => {
  const fileID = req.params.fileid;
  const boards = readBoards();
  const board = boards.find(b => b.id === fileID);
  if (board) return res.json(board);
  return res.status(404).json({found:false});
};

exports.listAmazonBoards = (_req, res) => {
  const boards = readBoards().map(b => ({id:b.id, pieceCount:b.pieces.length}));
  res.json(boards);
};
