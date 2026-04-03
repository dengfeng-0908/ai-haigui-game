# AI海龟汤游戏开发指令

更新日期：2026-03-28

## 1. 文件定位

本文件用于约束后续 Agent 在本仓库中的开发行为。任何新进入项目的 Agent，都应先读本文件，再继续恢复上下文或写代码。

---

## 2. 阅读顺序

进入项目后，按以下顺序阅读：

1. [AGENTS.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/AGENTS.md)
2. [PROJECT_STATUS.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PROJECT_STATUS.md)
3. [工作交接.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/工作交接.md)
4. [NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md)
5. [RESEARCH.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/RESEARCH.md)
6. [PRD.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PRD.md)
7. [TECH_DESIGN.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TECH_DESIGN.md)

不要跳过 `PROJECT_STATUS.md`、`工作交接.md`、`NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md`、`PRD.md` 和 `TECH_DESIGN.md` 直接改代码。

---

## 3. 项目概述

这是一个面向 `Web` 的 AI 海龟汤游戏 Demo，当前已经不是纯文档阶段，而是有真实前后端代码。

当前目标：

- 做出可玩的最小版本
- 支持 `单人模式`
- 支持 `多人模式`
- AI 担任主持人
- 提供基础防卡关体验

当前不是要做：

- 商业化社区
- 大型内容平台
- 长期持久化系统

---

## 4. 真实仓库结构

后续开发必须以当前真实结构为准，而不是按旧模板脑补目录。

```text
web/
  src/
    App.tsx
    components/
    pages/
    services/
    types/

server/
  index.ts
  data/
  prompts/
  services/
```

说明：

- 前端代码只在 `web/` 下维护
- 后端代码只在 `server/` 下维护
- 不要再创建根目录 `src/`
- 不要把前后端文件混放

---

## 5. 当前阶段边界

### 必须优先保证

- 首页可进入游戏
- 单人模式完整闭环
- 多人房间最小闭环
- AI 问答链路真实可用
- 结果页可揭晓
- 防卡关提示有效

### 当前不做

- 登录系统
- 排行榜
- 数据库持久化
- 用户投稿 / UGC
- 公开社区
- 复杂社交
- 语音输入
- 语音房
- 管理后台

如果新增需求超出这些边界，应先更新文档，不要直接扩功能。

---

## 6. 技术约束

### 前端

- 使用 React + TypeScript + Vite
- 使用函数式组件 + Hooks
- 使用 Tailwind CSS
- 路由使用 React Router
- 多人通信使用 Socket.IO Client

### 后端

- 使用 Node.js + Express
- 多人同步使用 Socket.IO
- 房间状态保存在内存中
- API Key 只能通过环境变量读取

### AI 接入

- 首选 DeepSeek
- 首版采用 `模型优先 + 服务端轻约束`
- 不要把主持逻辑做成完全自由聊天

---

## 7. 当前实现事实

后续开发必须建立在这些“已存在现实”上：

- 路由已存在：
  - `/`
  - `/single/:storyId`
  - `/multi/room/:roomId`
  - `/result/:storyId`
- HTTP API 已存在：
  - `/api/stories`
  - `/api/stories/:storyId`
  - `/api/game/ask`
  - `/api/chat`
  - `/api/game/hint`
  - `/api/game/submit`
  - `/api/game/reveal`
  - `/api/rooms`
  - `/api/rooms/:roomId`
- Socket 事件已存在：
  - `room:join`
  - `room:ask`
  - `room:hint`
  - `room:submit`
  - `room:giveup`
  - `room:state`
  - `room:error`
  - `room:finished`

如果要调整这些接口，必须同步更新前后端和文档。

---

## 8. 代码规范

### 命名

- 组件名使用 `PascalCase`
- 函数名使用 `camelCase`
- 常量使用 `UPPER_SNAKE_CASE`
- 类型定义使用 `T` 前缀

### 编码风格

- 优先写清晰代码，不做过度抽象
- 尽量复用已有组件和服务模块
- 不要为了“架构好看”强行拆目录
- 复杂逻辑允许写简短注释
- 先保证类型正确和行为稳定，再谈封装层次

### 状态管理

- 页面局部状态优先 `useState`
- 当前阶段不引入额外状态管理库
- 不要为了 Demo 先上 Redux/Zustand

---

## 9. UI 设计要求

- 整体风格：神秘、悬疑、简洁
- 主背景保持深色系
- 强调色使用金色或暖高亮
- 保持统一圆角与阴影语言
- 必须兼容移动端

注意：

- 不要把页面做成通用聊天机器人壳子
- 不要过度堆装饰
- 单人页和多人页保持同一视觉语言

---

## 10. 业务规则

### AI 回答规则

- 最终判定只允许 `yes / no / irrelevant`
- 前端展示文本统一收敛为 `是 / 否 / 无关` 及少量防卡关文案
- 禁止长篇解释
- 禁止直接剧透汤底
- 禁止明显前后矛盾

### 防卡关规则

- 提供显式提示按钮
- 连续无关提问时，服务端必须给稳定兜底提醒
- 已确认信息只展示安全事实
- 防卡关目标是让玩家继续玩，不是直接给答案

### 多人模式规则

- 所有玩家共享同一道题
- 所有玩家共享一个 AI 主持人
- 所有消息在房间内同步
- Demo 阶段房间只保存在内存中

---

## 11. 开发顺序

如果继续迭代，按以下优先级推进：

1. 修正真实可玩性问题
2. 修正 AI 稳定性问题
3. 修正多人同步问题
4. 修正移动端体验问题
5. 最后再做视觉细节

不要跳回去重写基础架构。

---

## 12. 禁止事项

- 不要跳过文档直接大改架构
- 不要引入数据库
- 不要引入复杂鉴权
- 不要把提示系统完全交给模型临场发挥
- 不要把 API Key 写入代码或提交到仓库
- 不要为了“看起来完整”提前加无关模块
- 不要新增根目录 `src/`
- 不要修改接口后不更新文档

---

## 13. 运行与联调

### 前端启动

```bash
cd web
npm run dev
```

### 后端启动

```bash
cd server
npm run start
```

开发调试也可以：

```bash
cd server
npm run dev
```

### 环境变量

- 后端模板：`server/.env.example`
- 前端模板：`web/.env.example`

注意：

- 只在本地 `server/.env` 填入 `DEEPSEEK_API_KEY`
- 不要在任何文档、代码、截图、日志中回显真实 Key

### 本地接口测试

在当前 Windows 环境下，如果命令行命中了系统代理，本地 `localhost` 请求可能异常。命令行联调时优先使用：

```bash
curl.exe --proxy "" http://127.0.0.1:3001/api/test
```

---

## 14. 测试要求

每次完成核心改动，至少检查：

- 单人模式是否能问答一整局
- 多人模式是否能创建房间并同步
- 提示和连续卡关兜底是否生效
- 结果页数据是否正确
- 移动端布局是否正常
- `web` 构建是否通过
- `server` TypeScript 检查是否通过

首版仍以手动测试为主。

---

## 15. 决策原则

遇到分歧时按以下顺序决策：

1. 先保证可玩
2. 再保证稳定
3. 再保证实现简单
4. 最后才考虑扩展性和“更高级的写法”

如果一个方案更优雅，但会拖慢 Demo 落地，优先更直接的方案。

---

## 16. 当前共识

本项目当前共识是：

- 先做 Demo，不追求大而全
- 先做双模式闭环，不先做社区
- AI 判题以模型为主，但要加服务端归一化
- 防卡关是首版重点，不是可选项
- 所有开发都围绕“用户能不能顺利玩完一局”展开
