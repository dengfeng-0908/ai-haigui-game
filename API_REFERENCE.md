# API 参考

本文档基于当前实际代码整理，后端入口在 [server/index.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/server/index.ts)。

后端默认本地地址：

```text
http://localhost:3001
```

## 一、HTTP API

### 1. `GET /api/test`

用于检测服务是否启动。

响应示例：

```json
{
  "ok": true,
  "service": "ai-haigui-game-server"
}
```

### 2. `GET /api/stories`

获取题库公开列表。

响应字段：

- `id`
- `title`
- `difficulty`
- `tags`
- `surface`

### 3. `GET /api/stories/:storyId`

获取单道题的公开信息。

不会返回 `bottom`。

### 4. `POST /api/game/ask`

单人模式提问接口。

请求体：

```json
{
  "storyId": "S002",
  "question": "是因为他够不到按钮吗？",
  "messages": [
    {
      "role": "user",
      "content": "和天气有关吗？"
    },
    {
      "role": "assistant",
      "content": "无关"
    }
  ],
  "invalidQuestionCount": 1
}
```

响应体：

```json
{
  "answer": "yes",
  "displayText": "是",
  "confirmedFacts": ["男人身材矮"],
  "invalidQuestionCount": 0
}
```

说明：

- `answer` 只会是 `yes / no / irrelevant`
- `displayText` 是前端实际展示文案
- `confirmedFacts` 来自服务端安全归一化后的事实
- `invalidQuestionCount` 用于连续卡关统计

### 5. `POST /api/chat`

兼容接口，当前行为与 `/api/game/ask` 一致。

### 6. `POST /api/game/hint`

请求一条预设提示。

请求体：

```json
{
  "storyId": "S002",
  "hintUsedCount": 1
}
```

响应体：

```json
{
  "hint": "他平时和雨天的差别是什么？",
  "hintUsedCount": 2,
  "remaining": 1
}
```

### 7. `POST /api/game/submit`

提交最终推理。

请求体：

```json
{
  "storyId": "S002",
  "guess": "男人个子矮，平时够不到 20 楼按钮，下雨天用伞按。"
}
```

响应体：

```json
{
  "solved": true,
  "feedback": "完全正确，抓住了核心反转。"
}
```

### 8. `POST /api/game/reveal`

揭晓完整题目内容。

请求体：

```json
{
  "storyId": "S002"
}
```

响应体包含：

- `id`
- `title`
- `difficulty`
- `tags`
- `surface`
- `bottom`
- `keyFacts`
- `hints`

### 9. `POST /api/rooms`

创建多人房间。

请求体：

```json
{
  "storyId": "S002"
}
```

响应体：

```json
{
  "roomId": "ABC123"
}
```

### 10. `GET /api/rooms/:roomId`

获取房间快照。

响应字段包括：

- `id`
- `story`
- `players`
- `messages`
- `hintUsedCount`
- `confirmedFacts`
- `invalidQuestionCount`
- `status`
- `isProcessing`

## 二、Socket 事件

前端封装位于 [web/src/services/socket.ts](D:/OneDrive/Vibe%20Coding/海龟汤游戏/web/src/services/socket.ts)。

## 客户端发送

### 1. `room:join`

```json
{
  "roomId": "ABC123",
  "playerName": "小王"
}
```

### 2. `room:ask`

```json
{
  "roomId": "ABC123",
  "question": "是因为他个子矮吗？",
  "playerName": "小王"
}
```

### 3. `room:hint`

```json
{
  "roomId": "ABC123"
}
```

### 4. `room:submit`

```json
{
  "roomId": "ABC123",
  "guess": "完整推理内容"
}
```

### 5. `room:giveup`

```json
{
  "roomId": "ABC123"
}
```

## 服务端广播

### 1. `room:state`

广播最新房间状态。前端据此刷新消息、玩家列表、提示次数和进行状态。

### 2. `room:error`

错误提示。

示例：

```json
{
  "message": "AI 正在处理上一条问题"
}
```

### 3. `room:finished`

房间结算事件。

示例字段：

- `storyId`
- `storyTitle`
- `messages`
- `hintUsedCount`
- `solved`
- `feedback`
- `playerCount`

## 三、错误语义

当前后端错误处理以简单明确为主：

- 参数缺失：`400`
- 故事或房间不存在：`404`
- AI 调用失败或服务异常：`500`

常见错误文案包括：

- `缺少 storyId 或 question`
- `故事不存在`
- `房间不存在`
- `AI 回复失败，请稍后再试`
- `提交推理失败`

## 四、联调建议

本地命令行如果命中了系统代理，访问 `localhost` 可能异常。可优先使用：

```bash
curl.exe --proxy "" http://127.0.0.1:3001/api/test
```

如果多人模式异常，优先检查：

- `/api/rooms`
- `/api/rooms/:roomId`
- `/socket.io`

这三条链路是否都通。
