const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/amazonchessboards.json");

function readBoards() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf-8");
  try { return JSON.parse(raw); } catch { return []; }
}

function writeBoards(boards) {
  fs.writeFileSync(dataPath, JSON.stringify(boards, null, 2));
}

function initialBoard(id) {
  // 白方Amazon: (0,3), (0,6), (3,0), (3,9)
  // 黑方Amazon: (6,0), (6,9), (9,3), (9,6)
  return {
    id,
    pieces: [
      {row:0, col:3, piece:"A", color:"white"},
      {row:0, col:6, piece:"A", color:"white"},
      {row:3, col:0, piece:"A", color:"white"},
      {row:3, col:9, piece:"A", color:"white"},
      {row:6, col:0, piece:"A", color:"black"},
      {row:6, col:9, piece:"A", color:"black"},
      {row:9, col:3, piece:"A", color:"black"},
      {row:9, col:6, piece:"A", color:"black"}
    ],
    moves: []
  };
}

exports.createAmazonBoard = (req, res) => {
  const fileID = req.params.fileid;
  let boards = readBoards();
  if (boards.find(b => b.id === fileID)) {
    return res.status(200).json({created:false, reason:"already exists"});
  }
  const board = initialBoard(fileID);
  boards.push(board);
  writeBoards(boards);
  res.status(201).json({created:true, id:fileID});
};
