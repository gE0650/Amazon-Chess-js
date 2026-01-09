# Amazon Chess 

## 目录结构
- `README.md`: 本文档
- `package.json`: 安装依赖
- `package-lock.json`: 依赖版本
- `frontend/`: 前端静态资源 (HTML, CSS, JS)
  - `index.html`: 主页面
  - `pages/`: 棋盘页面
  - `scripts/`: 前端js脚本
  - `styles/`: CSS
- `backend/`: Node.js 服务端逻辑及 API 路由
  - `server.js`: 服务器
  - `routers/`: 路由
  - `controllers/`: 控制器
  - `data/`: 棋盘数据

## 安装依赖
```bash
npm install
```

## 添加API_key
若需启用 PVE (DeepSeek AI) 模式，请在 `backend/server.js` 中配置您的 API Key

## 运行后端
启动服务（端口 3000）：
```bash
node backend/server.js
```

## 前端访问
使用浏览器打开：
```
http://localhost:3000/index.html
```


