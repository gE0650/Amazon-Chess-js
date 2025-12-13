# Achess & Amazon Chess Variant

本项目包含原始基础棋盘服务以及 Amazon Chess (皇后+骑士复合棋子) 网页版扩展，扩展在不修改原有文件的前提下新增了独立后端与前端资源。

## 目录结构新增
- backend/data/amazonchessboards.json: Amazon 变体的棋局数据文件
- backend/controllers/amazonCreate.js / amazonSearch.js: 创建与查询 Amazon 棋局
- backend/routers/amazonCreate.js / amazonSearch.js: 路由定义
- backend/server-amazon.js: 启动同时包含原始与 Amazon 变体接口的服务器 (端口 3100)
- frontend/pages/amazonchessboard.html: Amazon 棋盘页面
- frontend/scripts/amazonchessboard.js / amazonchessboardaction.js: 前端逻辑与交互预留
- frontend/styles/amazonchessboard.css: 样式

## 运行后端
如果尚未安装依赖，请确保安装 express 与 cors：

```bash
npm install express cors
```

启动原始服务（端口 3000）：
```bash
node backend/server.js
```

启动 Amazon 变体服务（端口 3100）：
```bash
node backend/server-amazon.js
```

## API 概览 (Amazon Variant)
- POST /amazon/create/:fileid 创建指定 ID 的棋局（如果不存在）
- GET  /amazon/search/:fileid 获取指定棋局
- GET  /amazon/search/list 列出所有棋局概要

返回示例：
```json
{
  "id": "default",
  "pieces": [{"row":0,"col":3,"piece":"A","color":"white"}, ...],
  "moves": []
}
```

## 前端访问
使用浏览器打开：
```
frontend/pages/amazonchessboard.html?fileid=default
```
将自动请求 `http://localhost:3100/amazon/search/default`，若不存在会自动创建。

## Amazon 棋子说明
Amazon (记作 A) = 皇后全部走法 + 骑士跳跃走法。当前版本仅渲染初始位置，尚未实现走子与规则校验；交互扩展点在 `amazonchessboardaction.js`。

## 下一步可扩展
1. 走子合法性验证与高亮提示
2. 后端记录 moves 序列并更新 pieces
3. 提供撤销/重做接口
4. 国际象棋 + Amazon 组合的胜负判定
5. 使用 WebSocket 推送实时走子

## 注意
为保持“不可修改原有代码”原则，所有新功能均在新增文件中实现；原始服务可继续独立运行。
