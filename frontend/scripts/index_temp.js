const API_URL = "http://localhost:3000";

async function loadSaves() {
    // 确保与 HTML 中的 ID 一致
    const previewContainer = document.getElementById("save-list");
    
    if (!previewContainer) {
        console.error("找不到容器");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/search/list`);
        
        if (!response.ok) throw new Error(`服务器错误: ${response.status}`);

        const boards = await response.json();

        // 防御性检查：确保返回的是数组
        if (!Array.isArray(boards)) {
            previewContainer.innerHTML = "<p>数据格式错误</p>";
            return;
        }

        if (boards.length === 0) {
            previewContainer.innerHTML = "<p>暂无存档</p>";
            return;
        }

        previewContainer.innerHTML = ""; // 清空加载中文字

        boards.forEach(board => {
            const card = document.createElement("div");
            card.style = "border: 1px solid #ccc; padding: 10px; margin: 10px; border-radius: 8px; background: #fdfdfd;";
            
            // 简单的预览信息
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>存档: ${board.id}</strong>
                        <p style="margin: 5px 0; font-size: 0.9em; color: #666;">
                            回合: ${board.currentPlayer === 1 ? '白' : '黑'} | 
                            状态: ${board.status === 'finished' ? '已结束' : '进行中'}
                        </p>
                    </div>
                    <button onclick="window.location.href='./pages/chessboard.html?fileid=${board.id}'" 
                            style="padding: 5px 15px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">
                        亚马逊棋, 启动!
                    </button>
                </div>
            `;
            previewContainer.appendChild(card);
        });

    } catch (error) {
        console.error("渲染列表失败:", error);
        previewContainer.innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
    }
}

// 确保 DOM 加载完成后再执行
document.addEventListener("DOMContentLoaded", loadSaves);

document.getElementById('start-new-btn').onclick = () => {
    const input = document.getElementById('new-id-input');
    const modeSelect = document.getElementById('mode-select');
    const newId = input.value.trim();
    const selectedMode = modeSelect.value; // 获取选中的值: "pvp" 或 "pve"
    if (newId) {
        // 跳转时携带新的 fileid，后端 Loadboard 时发现不存在会自动创建
        window.location.href = `./pages/chessboard.html?fileid=${newId}&mode=${selectedMode}`;
    } else {
        alert("请输入一个存档名称");
    }
};