const fs = require("fs");
const path = require("path");
const axios = require('axios');

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

function validateAIMove(board, aiAction) {
    const { piece, move, arrow } = aiAction;
    const pieces = board.pieces;
    const blocks = board.blocks;

    // 1. 基本坐标范围校验
    const isOutOfBounds = (c, r) => c < 0 || c > 9 || r < 0 || r > 9;
    if (isOutOfBounds(move.col, move.row) || isOutOfBounds(arrow.col, arrow.row)) return false;

    // 2. 验证移动是否合法 (复用你原本写在前端或后端的校验函数)
    // 假设你已经有 isLineMove(from, to) 和 pathClear(from, to, pieces, blocks)
    if (!isLineMove(piece, move) || !pathClear(piece, move, pieces, blocks)) {
        console.error("AI 尝试了非法的棋子移动");
        return false;
    }

    // 3. 验证射箭是否合法
    // 注意：此时棋子已经到了 move 位置，校验射箭路径时要考虑新位置
    const tempPieces = pieces.map(p => 
        (p.col === piece.col && p.row === piece.row) ? { ...p, col: move.col, row: move.row } : p
    );
    if (!isLineMove(move, arrow) || !pathClear(move, arrow, tempPieces, blocks)) {
        console.error("AI 尝试了非法的射箭");
        return false;
    }

    return true;
}

function generateRandomValidMove(board) {
    const aiPieces = board.pieces.filter(p => p.user === 0);
    // 随机打乱棋子顺序
    aiPieces.sort(() => Math.random() - 0.5);

    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

    for (let piece of aiPieces) {
        for (let d of dirs) {
            for (let dist = 1; dist < 10; dist++) {
                const move = { col: piece.col + d[0]*dist, row: piece.row + d[1]*dist };
                if (!inBounds(move.col, move.row)) break;
                
                // 检查移动路径
                if (pathClear(piece, move, board.pieces, board.blocks)) {
                    // 尝试在移动后射箭（简单尝试向四周射1步）
                    for (let ad of dirs) {
                        const arrow = { col: move.col + ad[0], row: move.row + ad[1] };
                        if (inBounds(arrow.col, arrow.row)) {
                            // 临时更新棋子位置来验证射箭路径
                            const tempPieces = board.pieces.map(p => 
                                (p.col === piece.col && p.row === piece.row) ? { ...p, ...move } : p
                            );
                            if (pathClear(move, arrow, tempPieces, board.blocks)) {
                                return { piece: {col: piece.col, row: piece.row}, move, arrow };
                            }
                        }
                    }
                } else break;
            }
        }
    }
    return null;
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
exports.PlaceBlock = async (req, res) => {
    const fileID = req.params.fileid || "default";
    const { col, row } = req.body;

    if (typeof col !== "number" || typeof row !== "number") {
        return res.status(400).json({ success: false, message: "坐标无效" });
    }

    const boards = readChessboards();
    const board = boards.find((b) => b.id === fileID);
    if (!board) return res.status(404).json({ success: false, message: "棋盘不存在" });

	board.pieces = board.pieces || [];
    board.blocks = board.blocks || [];
    board.history = board.history || [];

	const pieces = board.pieces; // 定义 pieces 变量
    const blocks = board.blocks; // 定义 blocks 变量

    // 检查目标点是否为空
    const isOccupied = [...pieces, ...blocks].some(p => p.col === col && p.row === row);
    if (isOccupied || !inBounds(col, row)) {
		board.history.pop();
        return res.status(400).json({ success: false, message: "该位置不可放置障碍" });
    }

	board.history = board.history || [];
    const snapshot = {
        pieces: JSON.parse(JSON.stringify(board.pieces)),
        blocks: JSON.parse(JSON.stringify(board.blocks)),
        currentPlayer: board.currentPlayer, // 保持为当前正在射箭的人
        status: board.status,
        winner: board.winner
    };
    board.history.push(snapshot);


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
	
	
	if (board.mode === 'pve' && board.currentPlayer === 0 && board.status !== "finished") {
        
		console.log("正在请求 DeepSeek AI 决策...");
        let aiAction = null;
    	let isValid = false;
    	let attempts = 0;
    	const MAX_ATTEMPTS = 2; // 如果失败尝试重试一次

    	while (attempts < MAX_ATTEMPTS && !isValid) {
    	    attempts++;
    	    aiAction = await getDeepSeekMove(board);
			
    	    // 增加对 aiAction 为空的安全检查
    	    if (aiAction && aiAction.piece && aiAction.move && aiAction.arrow) {
    	        isValid = validateAIMove(board, aiAction);
    	    }
        
    	    if (!isValid && attempts < MAX_ATTEMPTS) {
    	        console.warn(`第 ${attempts} 次尝试失败，正在重试...`);
    	    }
    	}

    	// 执行阶段
    	if (isValid) {
    	    const pIdx = board.pieces.findIndex(p => 
    	        p.col === aiAction.piece.col && p.row === aiAction.piece.row && p.user === 0
    	    );
     	    if (pIdx !== -1) {
    	        board.pieces[pIdx].col = aiAction.move.col;
    	        board.pieces[pIdx].row = aiAction.move.row;
    	        board.blocks.push({ col: aiAction.arrow.col, row: aiAction.arrow.row });
    	        board.currentPlayer = 1; // 只有成功才切回玩家
    	        console.log("AI 走子完成");
    	    }
    	} else {
    	    // --- 核心保底：如果AI实在不行，随机走一步 ---
    	    console.error("AI 决策多次失败，执行随机保底移动");
    	    const fallback = generateRandomValidMove(board);
    	    if (fallback) {
    	        const pIdx = board.pieces.findIndex(p => 
    	            p.col === fallback.piece.col && p.row === fallback.piece.row
    	        );
    	        board.pieces[pIdx].col = fallback.move.col;
   	            board.pieces[pIdx].row = fallback.move.row;
    	        board.blocks.push(fallback.arrow);
    	        board.currentPlayer = 1;
    	    }
    	} 

		
    }

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

exports.UndoMove = (req, res) => {
    const fileID = req.params.fileid;
    const boards = readChessboards();
    const board = boards.find(c => c.id === fileID);

    if (!board || !board.history || board.history.length <= 1) {
        return res.status(400).json({ success: false, message: "已经回到游戏开始了" });
    }

	const lastMove = board.moves[board.moves.length - 1];
    if (lastMove && lastMove.type !== 'block') {
        return res.status(400).json({ 
            success: false, 
            message: "请先完成当前回合的射箭操作后再悔棋" 
        });
    }
	
    // 弹出最近的一次快照
    board.history.pop();

	const prevState = board.history[board.history.length - 1];
    
    // 使用 JSON 拷贝防止引用干扰
    board.pieces = JSON.parse(JSON.stringify(prevState.pieces));
    board.blocks = JSON.parse(JSON.stringify(prevState.blocks));
    board.currentPlayer = prevState.currentPlayer;
    board.status = prevState.status || "playing";
    board.winner = prevState.winner || null;

    writeChessboards(boards);
    res.json({ 
        success: true, 
        pieces: board.pieces, 
        blocks: board.blocks, 
        currentPlayer: board.currentPlayer 
    });
};



async function getDeepSeekMove(board) {
    const API_KEY = "sk-377ebb2cc7704949915e4a1ad86327ed"; // 替换为你的 API Key
    
    // 1. 准备棋盘描述：只提供坐标，减少 Token 消耗
    const playerPieces = board.pieces.filter(p => p.user === 1).map(p => `(${p.col},${p.row})`).join(' ');
    const aiPieces = board.pieces.filter(p => p.user === 0).map(p => `(${p.col},${p.row})`).join(' ');
    const blocks = board.blocks.map(b => `(${b.col},${b.row})`).join(' ');

	const prompt = `
	# Role
	You are a precision Game of the Amazons engine. 

	# Current State (10x10 Grid)
	- Your pieces (Player 0): ${aiPieces}
	- Opponent (Player 1): ${playerPieces}
	- Blocked cells: ${blocks}

	# Strict Rules
	1. Move: Select one of your pieces and move it in a straight line (horizontal, vertical, or diagonal).
	2. Shoot: From the new position, shoot an arrow in a straight line to an empty cell.
	3. Path Obstruction: Neither the move path nor the arrow path can jump over or land on an occupied cell (pieces or blocks).
	4. No Pass: You MUST move and shoot.

	# Logical Validation Steps (Mental Sandbox)
	Step 1: Identify all 4 of your pieces.
	Step 2: For each piece, list 3 possible valid moves.
	Step 3: Check if the path to the destination is CLEAR of ${aiPieces}, ${playerPieces}, and ${blocks}.
	Step 4: From the destination, verify a clear shooting path to a cell that is NOT the piece's original or new position.

	# Execution Quality
	- Coordinate check: abs(delta_row) == abs(delta_col) for diagonal moves.
	- Collision check: Ensure no "jumping" over obstacles.

	# Output Format (JSON ONLY)
	{
	  "piece": {"col": x, "row": y},
	  "move": {"col": x, "row": y},
	  "arrow": {"col": x, "row": y}
	}
	`;

    try {
		/*const model = board.blocks.length < 25 ? "deepseek-chat" : "deepseek-reasoner";*/
		const model = "deepseek-chat";
        const response = await axios.post("https://api.deepseek.com/chat/completions", {
			
            model: model, 
            messages: [
                { 
                    role: "user", 
                    content: prompt // Reasoner 模型建议将所有规则和数据都放在 user 消息中
                }
            ],
			temperature: 0.1,
			max_tokens: model === "deepseek-reasoner" ? 1500 : 500 // 给Reasoner留够思考空间
            // 2. 注意：Reasoner 模型目前可能不支持 response_format: { type: "json_object" }
            // 建议去掉该配置，改为在 prompt 中强行要求 JSON，或者增加后处理逻辑
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
			timeout: 60000
        });

        // 3. 解析逻辑
        let content = response.data.choices[0].message.content;
        
        // 如果模型返回的内容包含了 ```json ... ``` 标签，需要清洗掉
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
        
    } catch (error) {
        console.error("DeepSeek Reasoner 调用失败:", error.message);
        return null;
    }
}