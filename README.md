# Achess & Amazon Chess Variant

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

