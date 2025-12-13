const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/chessboards.json");

function Readchessboards() {
  if(!fs.existsSync(dataPath)) {
    console.log('文件路径错误');
    return [];
  }
  const data = fs.readFileSync(dataPath, "utf-8");
  try {
    return JSON.parse(data);
  }
  catch { //可能Json损坏
    console.log('文件路径对了, 但找不到文件');
    return [];
  }
}

exports.Getchessboard = (req, res) => {
  const fileID = req.params.fileid;
  const chessboards = Readchessboards();
  const chessboard = chessboards.find(c => c.id === fileID);
  if(chessboard) res.json(chessboard);
  //equal to
  //res.setHeader("Content-Type", "application/json");
  //res.send(JSON.stringify(chessboard));

  else res.status(404).json({});
};
// export需要加;

exports.Listchessboards = (req, res) => {
  const chessboards = Readchessboards();
  res.json(chessboards);
};