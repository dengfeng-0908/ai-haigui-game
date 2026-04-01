# AI 海龟汤游戏

一个面向 `Web` 的 AI 海龟汤游戏 Demo，支持 `单人模式` 与 `多人模式` 两种入口。玩家通过提问推理汤底，AI 作为主持人给出 `是 / 否 / 无关` 的判断，并在必要时提供基础防卡关引导。

## 当前状态

当前仓库已经具备最小可玩闭环：

- 首页题库大厅
- 单人模式
- 多人房间模式
- 结果页
- DeepSeek 服务端代理
- 分层提示
- 连续无关提问兜底提醒
- 已确认信息区

## 目录结构

```text
web/
  src/
    components/   前端组件
    pages/        页面
    services/     HTTP / Socket 封装
    types/        类型定义

server/
  data/           题库数据
  prompts/        AI Prompt
  services/       AI 服务与房间状态
  index.ts        后端入口
```

## 技术栈

### 前端

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO Client

### 后端

- Node.js
- Express
- Socket.IO
- dotenv

### AI

- DeepSeek

## 本地启动

### 1. 配置后端环境变量

复制 [server/.env.example](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/.env.example) 为 `server/.env`，并填入你自己的 `DEEPSEEK_API_KEY`。

### 2. 启动后端

```bash
cd server
npm install
npm run start
```

开发模式：

```bash
cd server
npm run dev
```

### 3. 启动前端

```bash
cd web
npm install
npm run dev
```

默认情况下：

- 前端开发地址：`http://localhost:5173`
- 后端开发地址：`http://localhost:3001`

`web/vite.config.ts` 已配置开发代理，前端会把 `/api` 和 `/socket.io` 转发到本地后端。

## 环境变量

### 前端

参考 [web/.env.example](D:/OneDrive/Vibe%20Coding/海龟汤游戏/web/.env.example)：

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

### 后端

参考 [server/.env.example](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/.env.example)：

- `PORT`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`
- `CORS_ORIGIN`

## 常用命令

### 前端

```bash
cd web
npm run dev
npm run build
npm run preview
```

### 后端

```bash
cd server
npm run start
npm run dev
npx tsc --noEmit
```

## 主要页面

- `/`：首页与题库大厅
- `/single/:storyId`：单人模式
- `/multi/room/:roomId`：多人房间
- `/result/:storyId`：结果页

## 主要接口

- `GET /api/test`
- `GET /api/stories`
- `GET /api/stories/:storyId`
- `POST /api/game/ask`
- `POST /api/game/hint`
- `POST /api/game/submit`
- `POST /api/game/reveal`
- `POST /api/rooms`
- `GET /api/rooms/:roomId`

更详细说明见 [API_REFERENCE.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/API_REFERENCE.md)。

## 相关文档

- [RESEARCH.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/RESEARCH.md)
- [PRD.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PRD.md)
- [TECH_DESIGN.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TECH_DESIGN.md)
- [AGENTS.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/AGENTS.md)
- [DEPLOYMENT.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/DEPLOYMENT.md)
- [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md)

## 当前已知后续事项

- 完成多人联机手测
- 完成部署上线
- 收集试玩反馈
- 继续优化题库质量和提示层级
