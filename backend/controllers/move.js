const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/chessboards.json");

function readChessboards() {
	try {
		if (!fs.existsSync(dataPath)) return [];
		const data = fs.readFileSync(dataPath, "utf-8");
		const parsed = JSON.parse(data || "[]");
		return Array.isArray(parsed) ? parsed : [];
	} catch (err) {
		console.error("读取棋盘出错", err);
		return [];
	}
}

function writeChessboards(data) {
	fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function inBounds(col, row) {
	return col >= 0 && col < 10 && row >= 0 && row < 10;
}

function isLineMove(from, to) {
	const dr = to.row - from.row;
	const dc = to.col - from.col;
	if (dr === 0 && dc === 0) return false;
	if (dr === 0) return true; // 同行
	if (dc === 0) return true; // 同列
	return Math.abs(dr) === Math.abs(dc); // 斜线
}

function pathClear(from, to, pieces, blocks) {
	const dr = to.row - from.row;
	const dc = to.col - from.col;
	const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
	const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

	let r = from.row + stepR;
	let c = from.col + stepC;

	const occupied = new Set();
	pieces.forEach((p) => occupied.add(`${p.col},${p.row}`));
	(blocks || []).forEach((b) => occupied.add(`${b.col},${b.row}`));

	// 途中不允许有子/障碍，终点不允许被占据
	while (r !== to.row || c !== to.col) {
		if (occupied.has(`${c},${r}`)) return false;
		r += stepR;
		c += stepC;
	}
	// 终点占据检查
	if (occupied.has(`${to.col},${to.row}`)) return false;
	return true;
}

function canPlayerMove(player, pieces, blocks) {
    const playerPieces = pieces.filter(p => p.user === player);
    const dirs = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]];
    const occupied = new Set();
    pieces.forEach(p => occupied.add(`${p.col},${p.row}`));
    (blocks || []).forEach(b => occupied.add(`${b.col},${b.row}`));

    for (const piece of playerPieces) {
        for (const [dc, dr] of dirs) {
            const nc = piece.col + dc, nr = piece.row + dr;
            if (inBounds(nc, nr) && !occupied.has(`${nc},${nr}`)) return true;
        }
    }
    return false;
}

exports.Movepiece = (req, res) => {
	const fileID = req.params.fileid || "default";
	const { piece, newrow, newcol } = req.body || {};

	if (
		!piece ||
		typeof piece.col !== "number" ||
		typeof piece.row !== "number" ||
		typeof newcol !== "number" ||
		typeof newrow !== "number"
	) {
		return res.status(400).json({ success: false, message: "参数不完整" });
	}

	if (!inBounds(piece.col, piece.row) || !inBounds(newcol, newrow)) {
		return res.status(400).json({ success: false, message: "坐标越界" });
	}

	const boards = readChessboards();
	const board = boards.find((b) => b.id === fileID);
	if (!board) {
		return res.status(404).json({ success: false, message: "棋盘不存在" });
	}

	if (board.status === "finished") {
        return res.status(400).json({ success: false, message: "游戏已结束，不可移动" });
    }
	
	const pieces = Array.isArray(board.pieces) ? board.pieces : [];
	const blocks = Array.isArray(board.blocks) ? board.blocks : [];

	const idx = pieces.findIndex(
		(p) => p.col === piece.col && p.row === piece.row
	);
	if (idx === -1) {
		return res.status(400).json({ success: false, message: "未找到该棋子" });
	}

	if (pieces[idx].user !== board.currentPlayer) {
        return res.status(403).json({ success: false, message: "不是你的回合" });
    }

	const from = { col: piece.col, row: piece.row };
	const to = { col: newcol, row: newrow };

	if (!isLineMove(from, to)) {
		return res.status(400).json({ success: false, message: "非法走法" });
	}

	if (!pathClear(from, to, pieces, blocks)) {
		return res.status(400).json({ success: false, message: "路径被阻挡" });
	}

	// 更新棋子位置
	pieces[idx] = { ...pieces[idx], col: newcol, row: newrow };

	// 记录走子
	const moves = Array.isArray(board.moves) ? board.moves : [];
	moves.push({ from, to, ts: Date.now() });
	board.pieces = pieces;
	board.moves = moves;

	// blocks 目前前端未落子提交，这里保持为空或现有
	writeChessboards(boards);

	return res.json({ success: true, pieces, blocks: blocks || [] });
};

// 放置障碍物（射箭）接口
exports.PlaceBlock = (req, res) => {
    const fileID = req.params.fileid || "default";
    const { col, row } = req.body;

    if (typeof col !== "number" || typeof row !== "number") {
        return res.status(400).json({ success: false, message: "坐标无效" });
    }

    const boards = readChessboards();
    const board = boards.find((b) => b.id === fileID);
    if (!board) return res.status(404).json({ success: false, message: "棋盘不存在" });

    const pieces = board.pieces || [];
    const blocks = board.blocks || [];

    // 检查目标点是否为空
    const isOccupied = [...pieces, ...blocks].some(p => p.col === col && p.row === row);
    if (isOccupied || !inBounds(col, row)) {
        return res.status(400).json({ success: false, message: "该位置不可放置障碍" });
    }

    blocks.push({ col, row });
    board.blocks = blocks;
    board.moves = board.moves || [];
    board.moves.push({ type: 'block', to: { col, row }, ts: Date.now() });

	board.currentPlayer = board.currentPlayer === 1 ? 0 : 1;

    writeChessboards(boards);

	const nextPlayer = board.currentPlayer === 1 ? 0 : 1;
	const canNextPlayerMove = canPlayerMove(nextPlayer, pieces, blocks);
    // 检查当前人（自己）在这一箭之后还能不能动
    const canCurrentPlayerMove = canPlayerMove(board.currentPlayer, pieces, blocks);
    
    let winner = null;

    if (!canNextPlayerMove) {
        // 情况 A: 对手被围死，当前玩家获胜
        winner = board.currentPlayer;
        board.status = "finished";
		board.winner = winner;
    } else if (!canCurrentPlayerMove) {
        // 情况 B: 自己把自己围死了（自杀），对手获胜
        winner = nextPlayer;
        board.status = "finished";
		board.winner = winner;
    }
	writeChessboards(boards);

    return res.json({ 
        success: true, 
        pieces: board.pieces, 
        blocks: board.blocks, 
        currentPlayer: board.currentPlayer,
		winner: winner
    });
};