# 下一位 Agent 执行计划

更新日期：2026-04-03 22:50

## 1. 任务定位

本文件是给下一位接手 Agent 的详细执行计划，目标不是重新理解整个项目，而是直接推进两类工作：

1. 前端升级
2. 补齐教程要求对应的联调、测试、部署与打卡材料

当前阶段已经不是“从零搭项目”，而是“已有线上 Demo，开始做体验修正和交付补完”。

---

## 2. 总目标

下一位 Agent 需要达成的总目标是：

- 保持现有前后端架构不变
- 不引入数据库、鉴权、后台等扩展需求
- 在 `web/` 内完成一轮务实的前端升级
- 在不偏离教程要求的前提下，补齐可打卡、可证明、可验收的材料
- 把项目从“已上线的课程作业”推进到“可试玩、可打卡、可展示的 Demo”

---

## 3. 当前已知事实

### 3.1 已完成

- GitHub 仓库已建立并推送
- Railway 后端已上线
- Vercel 前端已上线
- DeepSeek 生产环境已接通
- 单人模式和多人模式的基础代码已存在
- 当前状态文档、交接文档、部署文档、API 文档、测试清单文档已存在

### 3.2 当前线上入口

- 前端：`https://ai-haigui-game.vercel.app`
- 后端：`https://ai-haigui-game-production-ffc1.up.railway.app`
- 健康检查：`https://ai-haigui-game-production-ffc1.up.railway.app/api/test`

### 3.3 当前重要约束

- 前端只改 `web/`
- 后端只改 `server/`
- 不要大改接口
- 不要引入额外状态管理库
- 不要把 API Key 写进代码或仓库
- 当前优先级是：
  1. 修正可玩性问题
  2. 修正展示和交互问题
  3. 补齐测试和打卡材料
  4. 最后再做视觉细节

---

## 4. 当前存在的问题

## 4.1 功能与数据层问题

### 问题 A：线上首页当前用户可见故事似乎只有 5 个

已知：

- 线上截图中只看到 5 张题目卡片
- 但本地代码中 [server/data/stories.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/data/stories.ts) 目前定义了 6 条故事

这说明至少有一个问题未被确认：

- 线上部署不是最新版本
- 前端渲染前做了过滤
- 某条故事数据结构有异常，导致未显示
- 用户截图截取范围没有包含全部卡片

需要下一位 Agent 优先核查：

1. 直接请求线上 `/api/stories` 看实际返回条数
2. 检查 [web/src/pages/Home.tsx](D:/OneDrive/Vibe%20Coding/海龟汤游戏/web/src/pages/Home.tsx) 是否有 `filter/slice`
3. 检查 Vercel 当前线上版本是否对应当前仓库提交

在这个问题没有核清之前，不要把“5 个故事”直接当成产品设定。

---

## 4.2 前端结构问题

### 问题 B：首页像“功能列表”，不像“产品首页”

当前问题：

- 题库卡片是主体，但顶部引导弱
- 单人/多人主入口不够突出
- 昵称输入、房间号加入和题库浏览之间层级混在一起
- 空白空间较多，但重点内容不够聚焦

结果：

- 首页更像开发中的管理页，而不是一个可以直接开始玩的游戏首页

### 问题 C：单人页面结构割裂

当前问题：

- “汤面”、“聊天区”、“按钮区”像几块独立模块拼起来
- 用户的核心视线路径不够清晰
- 输入区、提示区、结果操作区没有形成统一游戏流程
- 页面留白较大，但信息组织不够强

结果：

- 页面虽然能玩，但像“已实现功能的界面”，不像“围绕推理体验设计的界面”

### 问题 D：多人模式大概率沿用了相同结构问题

虽然本轮没有做系统性多人 UI 审核，但根据当前组件结构和单人页情况，多人页大概率存在相同问题：

- 主信息区和辅助信息区层级弱
- 房间信息、聊天记录、提示、最终推理之间关系不够清楚

---

## 4.3 视觉问题

### 问题 E：视觉风格还停留在 MVP

当前问题：

- 深色是有了，但整体气质还偏“默认深色卡片”
- 页面缺少品牌感、神秘感和悬疑氛围
- 标题区、卡片区、聊天区的视觉语言还不够统一
- 动效、悬停、强调色都偏保守

注意：

- 这不是故障，而是优先级结果
- 不要为了“变好看”直接推翻当前布局和组件体系

---

## 4.4 打卡交付问题

### 问题 F：文档齐了，但“证据材料”还不完整

当前仓库已经有：

- [README.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/README.md)
- [DEPLOYMENT.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/DEPLOYMENT.md)
- [API_REFERENCE.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/API_REFERENCE.md)
- [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md)
- [PLAYTEST_FEEDBACK_TEMPLATE.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PLAYTEST_FEEDBACK_TEMPLATE.md)

但教程真正需要的是：

- 测试记录
- Bug 记录
- Prompt 优化记录
- 部署截图/过程记录
- 朋友试玩反馈
- 项目总结

也就是说，“模板有了”，但“内容还没填满”。

---

## 5. 下一位 Agent 的执行顺序

必须按这个顺序推进，不要跳步：

### 第一阶段：核查线上现状

目标：

- 确认线上版本和本地代码是否一致
- 确认故事数量问题是否真实存在
- 确认单人/多人/结果页是否都能正常打开

要做：

1. 访问线上 `/api/stories`
2. 对照 [server/data/stories.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/data/stories.ts)
3. 对照 [web/src/pages/Home.tsx](D:/OneDrive/Vibe%20Coding/海龟汤游戏/web/src/pages/Home.tsx)
4. 跑一轮线上单人试玩
5. 跑一轮线上多人试玩

产出：

- 明确的“问题清单”
- 填一版 [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md)

---

### 第二阶段：修正真实问题

目标：

- 先把真实错误和不一致修掉
- 不要先做纯视觉优化

优先修：

1. 题库显示数量问题
2. 线上单人流程中断问题
3. 多人房间同步或加入问题
4. 结果页信息显示问题
5. 移动端输入和滚动问题

产出：

- 功能正确性恢复
- Bug 列表与修复记录

---

### 第三阶段：做一轮务实的前端升级

目标：

- 不重构架构
- 不新增复杂功能
- 用最少改动把产品观感提升一档

#### 首页升级目标

要达成：

- 顶部 Hero 更明确
- 单人/多人入口更突出
- 房间加入与题库浏览分区清晰
- 卡片更有层级感

建议做法：

1. 首页拆成三层：
   - 顶部主引导区
   - 中部快捷操作区
   - 下方题库网格
2. 顶部主引导区增加：
   - 一句核心价值描述
   - 明确 CTA
3. 题库区增加：
   - 题目数量信息
   - 难度标签统一样式
   - 更清晰的单人/多人操作

#### 单人页升级目标

要达成：

- 用户视线聚焦在“汤面 -> 提问 -> 回复”
- 提示区和已确认信息区成为真正辅助推理的工具
- 提交最终推理的位置更合理

建议做法：

1. 固定页面结构：
   - 主区：汤面 + 聊天流 + 输入框
   - 侧栏：提示 / 已确认信息 / 最终推理
2. 输入框固定到底部交互区
3. 防卡关提示不要只埋在消息流里
4. 提示按钮做成更有层次的操作卡片

#### 多人页升级目标

要达成：

- 房间信息清楚
- 玩家共享感更强
- 群体协作推理感更明确

建议做法：

1. 强化房间头部信息
2. 显示在线玩家数量和房间号
3. 聊天区和系统提示视觉区分更明显
4. 最终推理入口更适合多人共同使用

#### 视觉升级目标

只做低风险、强收益的升级，不要重做主题系统：

1. 背景从纯色改为：
   - 深海渐变
   - 轻雾层
   - 微弱高光
2. 卡片增加：
   - 更明确的 hover
   - 统一阴影
   - 统一边框语言
3. 标题区增加：
   - 更强的标题排版
   - 更好的副标题可读性
4. 按钮体系统一：
   - 主按钮高亮
   - 次按钮描边
   - 危险按钮单独配色

#### 移动端目标

至少做到：

- 首页单列可读
- 单人页输入区不挤压
- 多人页聊天区可滚动
- 结果页不横向溢出

---

## 6. 打卡任务补完计划

下一位 Agent 不需要帮用户写最终发帖文案，但需要把“能支撑打卡的内容”补齐。

### 教程 Day 16-18 对应要补的内容

#### 1. 测试清单填充

文件：

- [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md)

要补：

- 首页
- 单人模式
- 提示系统
- 结果页
- 多人模式
- 移动端
- 线上验收

#### 2. Bug 记录

建议新增或补充：

- `BUG_LOG.md`

至少记录：

- Bug 现象
- 复现步骤
- 根因
- 修复方法
- 修复结果

#### 3. Prompt 优化记录

建议新增：

- `PROMPT_TUNING.md`

基于 [server/prompts/hostPrompt.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/prompts/hostPrompt.ts) 和相关 AI 逻辑，记录：

- 优化前问题
- 优化后的 Prompt 约束
- 样例问题
- 回答改善结果

#### 4. 题库逐题验证

基于 [server/data/stories.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/data/stories.ts)，补：

- 每个故事的玩法测试结果
- 每个故事的提示质量
- 是否存在误判或剧透风险

建议新增：

- `STORY_QA_REPORT.md`

---

### 教程 Day 19-21 对应要补的内容

#### 5. 部署过程记录

虽然部署已经完成，但还需要补“证据型材料”：

- 构建成功截图
- Railway 部署截图
- Vercel 部署截图
- 线上访问截图
- 环境变量配置说明
- 部署过程遇到的问题与处理方式

建议新增：

- `DEPLOYMENT_REPORT.md`

#### 6. 试玩反馈

已有模板：

- [PLAYTEST_FEEDBACK_TEMPLATE.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PLAYTEST_FEEDBACK_TEMPLATE.md)

需要下一位 Agent 帮用户整理：

- 应该如何收集
- 收集后如何归档

如果用户实际拿到反馈，再帮他整理成：

- `PLAYTEST_REPORT.md`

#### 7. 项目总结材料

用户最终要发打卡总结，但下一位 Agent 可以提前准备“结构化素材”，例如：

- 做了哪些功能
- 遇到什么问题
- 如何解决
- 对 Vibe Coding 的理解
- 下一步想做什么

建议新增：

- `PROJECT_REVIEW_NOTES.md`

这个文件不是最终发帖文案，而是给用户整理思路用的素材池。

---

## 7. 建议新增文档清单

下一位 Agent 可以在本轮中新增这些文档：

- `BUG_LOG.md`
- `PROMPT_TUNING.md`
- `STORY_QA_REPORT.md`
- `DEPLOYMENT_REPORT.md`
- `PLAYTEST_REPORT.md`
- `PROJECT_REVIEW_NOTES.md`

不是必须一次全部完成，但至少优先完成前 4 个。

---

## 8. 验收标准

下一位 Agent 完成本轮后，至少要满足：

### 前端侧

- 首页结构明显改善
- 单人页布局明显改善
- 多人页结构清晰
- 移动端可用性过关
- 故事显示数量问题已确认并修复或被明确解释

### 功能侧

- 单人模式完整可玩
- 多人模式完整可玩
- 结果页完整可用
- 提示和防卡关有效

### 打卡材料侧

- [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md) 至少有一版真实填写内容
- Bug 和修复记录已成文
- Prompt 优化记录已成文
- 部署过程记录已成文

---

## 9. 不该做的事

下一位 Agent 不要做这些：

- 不要重写前后端架构
- 不要先上数据库
- 不要加登录系统
- 不要加排行榜
- 不要加 UGC
- 不要为了“更完整”扩需求
- 不要把时间花在和当前打卡无关的高级封装上

---

## 10. 最短执行入口

先读：

1. [AGENTS.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/AGENTS.md)
2. [PROJECT_STATUS.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/PROJECT_STATUS.md)
3. [工作交接.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/工作交接.md)
4. [NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/NEXT_AGENT_FRONTEND_CHECKIN_PLAN.md)
5. [TEST_CHECKLIST.md](D:/OneDrive/Vibe%20Coding/海龟汤游戏/TEST_CHECKLIST.md)

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
