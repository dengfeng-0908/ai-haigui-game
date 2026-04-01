# AI海龟汤游戏技术设计

更新日期：2026-03-28

## 1. 设计目标

基于 [PRD.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PRD.md)，当前要交付的是一个真实可玩的 `Web Demo`，并且已经按 `web/ + server/` 双目录结构落地。

本阶段目标：

- 支持 `单人模式`
- 支持 `多人模式`
- AI 作为主持人完成判题
- 提供基础防卡关能力
- 保持实现简单，优先完成可玩闭环

---

## 2. 当前实现概览

当前仓库不是纯文档状态，而是已经有最小可运行实现：

- 前端：`web/`
- 后端：`server/`
- 单人流程：已接通
- 多人房间流程：已接通
- DeepSeek：已接通服务端代理
- 防卡关：已实现 `提示按钮 + 连续无关兜底提醒 + 已确认信息区`

---

## 3. 技术栈

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

- 首选：DeepSeek
- 默认模型：`deepseek-chat`
- 接入方式：服务端代理调用，API Key 只保存在 `server/.env`

---

## 4. 总体架构

整体架构为：

`React SPA + Express/Socket.IO 服务 + DeepSeek API`

职责划分如下：

### 前端负责

- 页面路由与展示
- 单人提问与结果跳转
- 多人房间接入与消息同步
- 提示按钮与已确认信息展示
- 结果页揭晓与局内数据回显

### 后端负责

- 题库读取
- DeepSeek 请求代理
- AI 输出归一化
- 防卡关服务端兜底
- 房间状态管理
- Socket 广播同步

### 模型负责

- 根据汤底判断 `yes / no / irrelevant`
- 判断最终推理是否足够还原真相
- 在结构化输出内返回可公开的已确认事实

---

## 5. 实际项目结构

当前真实结构如下：

```text
web/
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  src/
    App.tsx
    main.tsx
    index.css
    assets/
    components/
      ChatBox.tsx
      ConfirmedFacts.tsx
      GameCard.tsx
      HintPanel.tsx
      Message.tsx
      RoomHeader.tsx
      StoryReveal.tsx
    pages/
      Home.tsx
      MultiRoom.tsx
      Result.tsx
      SingleGame.tsx
    services/
      api.ts
      socket.ts
    types/
      game.ts
      index.ts
      message.ts
      story.ts

server/
  .env.example
  index.ts
  package.json
  tsconfig.json
  data/
    stories.ts
  prompts/
    hostPrompt.ts
  services/
    ai.ts
    roomManager.ts
```

说明：

- 当前没有 `context/`、`hooks/`、`routes/` 目录，实际实现以页面本地状态和服务模块为主
- Demo 阶段不引入数据库
- 房间状态只保存在服务端内存中

---

## 6. 前端设计

### 6.1 路由

当前路由定义在 [web/src/App.tsx](D:/OneDrive/Vibe%20Coding/海龟汤游戏/web/src/App.tsx)：

- `/`：首页
- `/single/:storyId`：单人模式
- `/multi/room/:roomId`：多人房间
- `/result/:storyId`：结果页

### 6.2 页面职责

#### 首页 `Home.tsx`

- 展示规则简介
- 展示题目卡片
- 提供单人开始入口
- 提供创建多人房间入口

#### 单人页 `SingleGame.tsx`

- 拉取题目公开信息
- 渲染汤面与消息列表
- 调用 `/api/game/ask`
- 调用 `/api/game/hint`
- 调用 `/api/game/submit`
- 维护本地消息、提示数、连续无效提问数、已确认信息

#### 多人页 `MultiRoom.tsx`

- 先通过 `GET /api/rooms/:roomId` 获取房间快照
- 再通过 Socket.IO 加入房间
- 发送 `room:ask / room:hint / room:submit / room:giveup`
- 接收 `room:state / room:error / room:finished`

#### 结果页 `Result.tsx`

- 调用 `/api/game/reveal`
- 展示完整汤底
- 展示本局消息、提示数、成功/放弃结果

---

## 7. 后端设计

### 7.1 HTTP API

当前后端入口是 [server/index.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/index.ts)，实际接口如下：

- `GET /api/test`
- `GET /api/stories`
- `GET /api/stories/:storyId`
- `POST /api/game/ask`
- `POST /api/chat`
- `POST /api/game/hint`
- `POST /api/game/submit`
- `POST /api/game/reveal`
- `POST /api/rooms`
- `GET /api/rooms/:roomId`

说明：

- `/api/chat` 是为兼容教程或旧调用保留的别名接口
- 单人模式主要使用 HTTP
- 多人模式使用 `HTTP + Socket.IO` 组合

### 7.2 Socket 事件

当前多人模式实际事件：

- 客户端发送：
  - `room:join`
  - `room:ask`
  - `room:hint`
  - `room:submit`
  - `room:giveup`

- 服务端广播：
  - `room:state`
  - `room:error`
  - `room:finished`

### 7.3 房间状态

房间状态定义在 [server/services/roomManager.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/services/roomManager.ts)。

核心字段包括：

- `id`
- `storyId`
- `story`
- `players`
- `messages`
- `hintUsedCount`
- `confirmedFacts`
- `invalidQuestionCount`
- `status`
- `isProcessing`

---

## 8. 数据模型

### 8.1 Story

定义在 [server/data/stories.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/data/stories.ts)：

```ts
type TStory = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  surface: string;
  bottom: string;
  keyFacts: string[];
  hints: string[];
};
```

### 8.2 Message

前后端都使用统一思路：

```ts
type TMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  playerName?: string;
};
```

### 8.3 AskResponse

当前 `/api/game/ask` 返回：

```ts
type TAskResponse = {
  answer: "yes" | "no" | "irrelevant";
  displayText: string;
  confirmedFacts: string[];
  invalidQuestionCount: number;
};
```

---

## 9. AI 判题设计

### 9.1 当前策略

首版采用：

`模型优先 + 服务端轻约束`

也就是说：

- 判定本身依赖 DeepSeek
- 但最终展示文本、confirmedFacts 和防卡关提醒，由服务端再做一次归一化

这样做的原因是：

- 纯模型输出不稳定
- 海龟汤产品对“不能剧透、不能跑偏、不能太啰嗦”很敏感
- Demo 阶段优先稳定性，而不是完全自由

### 9.2 Host Prompt

Prompt 定义在 [server/prompts/hostPrompt.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/prompts/hostPrompt.ts)。

当前要求模型只输出 JSON，并包含：

- `answer`
- `displayText`
- `confirmedFacts`
- `shouldNudge`

但服务端不会完全信任这些字段，而是再做兜底。

### 9.3 服务端归一化

归一化逻辑在 [server/services/ai.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/services/ai.ts)。

当前做了 3 层约束：

1. `answer` 只接受 `yes / no / irrelevant`
2. `displayText` 由服务端统一收敛为：
   - `是`
   - `否`
   - `无关`
   - `无关。换个方向再试试。`
   - `无关。换个方向试试：<预设提示>`
3. `confirmedFacts` 只会映射回题库里的 `keyFacts`，防止模型自由扩写

### 9.4 最终推理判定

`submitFinalGuess` 仍然由模型判定，但要求：

- 只判断是否抓住主要事实与核心反转
- 反馈必须是一句短话
- 不直接复述整段汤底

---

## 10. 防卡关设计

### 10.1 主动提示

`POST /api/game/hint` 从故事的 `hints[]` 中按顺序返回提示。

### 10.2 连续无关兜底

当前服务端策略：

- 第 1 次连续无关：返回 `无关`
- 第 2 次连续无关：返回 `无关。换个方向再试试。`
- 第 3 次及以后：返回 `无关。换个方向试试：<预设提示>`

这样做的目的不是直接给答案，而是让玩家继续玩得下去。

### 10.3 已确认信息

当前 `confirmedFacts` 不是自由摘要，而是从 `keyFacts` 中筛回的安全事实，用于前端 `ConfirmedFacts` 组件展示。

---

## 11. 运行方式

### 11.1 前端

```bash
cd web
npm run dev
```

### 11.2 后端

```bash
cd server
npm run start
```

开发时也可以：

```bash
cd server
npm run dev
```

### 11.3 环境变量

后端使用 [server/.env.example](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/.env.example) 作为模板，关键变量包括：

- `PORT`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`
- `CORS_ORIGIN`

前端可通过 [web/.env.example](D:/OneDrive/Vibe%20Coding/海龟汤游戏/web/.env.example) 配置 `VITE_API_BASE_URL`。

---

## 12. 当前结论

当前实现已经满足首版 Demo 的技术目标：

- 结构清晰
- 双模式闭环已打通
- DeepSeek 已真实接入
- 防卡关已有稳定兜底
- 不依赖数据库

后续如果继续演进，优先级建议是：

1. 补多人联机手测
2. 优化题库质量和提示层级
3. 再考虑视觉细节和留存能力
