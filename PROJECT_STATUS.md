# PROJECT_STATUS

更新日期：2026-04-03 22:50

## 1. 项目一句话

一个面向 `Web` 的 AI 海龟汤游戏 Demo，支持 `单人模式 + 多人模式`，由 DeepSeek 驱动 AI 主持，当前优先验证可玩性、稳定性和防卡关体验。

---

## 2. 当前阶段

- 阶段：`首次上线完成`
- 状态：`GitHub + Railway + Vercel 已打通`
- 当前目标：进入 `线上试玩 / 体验修正 / 视觉优化 / 打卡材料补完` 阶段

---

## 3. 当前可用入口

- GitHub 仓库：`https://github.com/dengfeng-0908/ai-haigui-game`
- 前端线上地址：`https://ai-haigui-game.vercel.app`
- 后端线上地址：`https://ai-haigui-game-production-ffc1.up.railway.app`
- 后端健康检查：`https://ai-haigui-game-production-ffc1.up.railway.app/api/test`

说明：

- 访问线上前端时，不需要本机启动后端
- 本地开发时，前端 dev 环境默认仍会连接本机后端

---

## 4. 当前已完成能力

- 单人模式：可进入题目、提问、获取 AI 回答、请求提示、提交最终推理、放弃揭晓
- 多人模式：可创建房间、加入房间、同步消息、共享提示、提交最终推理、统一揭晓
- AI 主持：DeepSeek 已接入服务端代理，回答经过服务端归一化
- 防卡关：已实现提示按钮、连续无关问题兜底提醒、已确认信息区
- 结果页：可展示完整汤底与本局信息

---

## 5. 本轮已完成

- 初始化本地 Git 仓库并推送到 GitHub
- 创建 GitHub 仓库：`dengfeng-0908/ai-haigui-game`
- 部署 Railway 后端，服务根目录配置为 `server/`
- 在 Railway 配置生产环境变量：
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_BASE_URL`
  - `DEEPSEEK_MODEL`
  - `CORS_ORIGIN`
- 生成 Railway 公网域名并验证：
  - `GET /api/test` 正常
  - `POST /api/game/ask` 正常
- 部署 Vercel 前端，项目根目录配置为 `web/`
- 在 Vercel 配置环境变量：
  - `VITE_API_BASE_URL=https://ai-haigui-game-production-ffc1.up.railway.app/api`
  - `VITE_SOCKET_URL=https://ai-haigui-game-production-ffc1.up.railway.app`
- 回填 Railway 的 `CORS_ORIGIN`：
  - `http://localhost:5173`
  - `https://ai-haigui-game.vercel.app`
- 线上验证首页可正常拉取题库并渲染

---

## 6. 当前验证结论

已验证：

- 本地 `web` 构建通过
- 本地 `server` TypeScript 检查通过
- 线上后端健康检查通过
- 线上 DeepSeek 基础问答链路通过
- 线上首页题库加载通过
- 线上后端对 Vercel 域名的 CORS 预检通过

尚未完整验证：

- 线上单人模式完整一局闭环
- 线上多人模式双端联机实测
- 线上移动端体验
- 结果页和提示层级的完整人工走查

---

## 7. 当前风险与注意事项

- UI 仍处于 `MVP 功能型界面`，视觉完成度不高，这不是部署故障，而是迭代优先级结果
- Railway / Vercel 的关键部署配置目前主要保存在平台界面，不在仓库中
- 如果后续更换前端正式域名，必须同步更新 Railway 的 `CORS_ORIGIN`
- 不要把真实 `DEEPSEEK_API_KEY` 写进代码、文档、截图或 Git 提交

---

## 8. 下次优先级

1. 做一次完整线上试玩，分别覆盖单人模式和多人模式
2. 按 [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md) 记录线上问题
3. 修正真实可玩性问题和线上交互问题
4. 再进入视觉优化，而不是先大改架构
5. 如需长期维护，再考虑把部署配置进一步固化为文档或配置文件

补充：

- 下一位 Agent 的详细执行计划见 [NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md)

---

## 9. 下一位 Agent 最短上手路径

先读：

1. [AGENTS.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/AGENTS.md)
2. [PROJECT_STATUS.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PROJECT_STATUS.md)
3. [工作交接.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/工作交接.md)
4. [NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md)
5. [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md)
6. [DEPLOYMENT.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/DEPLOYMENT.md)

常用命令：

```bash
cd server
npm run dev
```

```bash
cd web
npm run dev
```

```bash
cd web
npm run build
```

```bash
cd server
npx tsc --noEmit
```
