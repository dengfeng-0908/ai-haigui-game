# 部署说明

本文档按当前仓库的真实结构编写：

- 前端目录：`web/`
- 后端目录：`server/`

推荐部署方式：

- 前端：Vercel
- 后端：Railway

## 一、部署前检查

部署前先在本地完成以下检查：

### 前端

```bash
cd web
npm run build
```

### 后端

```bash
cd server
npx tsc --noEmit
```

还应确认：

- `server/.env` 本地可正常调用 DeepSeek
- 单人模式可玩
- 多人房间可创建、可加入、可同步

## 二、前端部署到 Vercel

### 1. 导入仓库

在 Vercel 中导入 GitHub 仓库后，注意设置：

- `Root Directory`：`web`
- `Framework Preset`：`Vite`

### 2. 前端环境变量

在 Vercel 的项目环境变量中配置：

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

推荐填写：

- `VITE_API_BASE_URL=https://你的后端域名/api`
- `VITE_SOCKET_URL=https://你的后端域名`

说明：

- 本地开发时前端依赖 Vite 代理
- 线上环境没有这层代理，必须显式配置后端公网地址

### 3. 部署完成后检查

前端线上页面至少应检查：

- 首页是否可打开
- 题库是否正常加载
- 单人模式是否能发送问题
- 多人模式是否能创建房间

## 三、后端部署到 Railway

### 1. 创建服务

在 Railway 中从 GitHub 仓库创建新服务。

由于当前项目是前后端分目录结构，后端服务应指向 `server/` 目录。

如果平台支持设置 Root Directory，请填写：

- `server`

### 2. 后端环境变量

在 Railway 中配置：

- `PORT=3001`
- `DEEPSEEK_API_KEY=你的 DeepSeek Key`
- `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- `DEEPSEEK_MODEL=deepseek-chat`
- `CORS_ORIGIN=https://你的前端域名`

如果有多个前端域名，可用英文逗号分隔：

```text
https://你的正式域名,https://你的预览域名
```

### 3. 后端联通性检查

部署后先直接访问：

```text
https://你的后端域名/api/test
```

应返回：

```json
{
  "ok": true,
  "service": "ai-haigui-game-server"
}
```

再检查：

```text
https://你的后端域名/api/stories
```

如果这里异常，优先看：

- Railway 日志
- 环境变量是否保存
- Root Directory 是否正确

## 四、前后端接通顺序

推荐顺序如下：

1. 先部署后端
2. 拿到后端公网地址
3. 再去 Vercel 配置 `VITE_API_BASE_URL` 和 `VITE_SOCKET_URL`
4. 重新部署前端
5. 做线上联调

## 五、上线后最少验收清单

- 首页可访问
- 题库可加载
- 单人模式可提问
- AI 有返回
- 提示按钮可用
- 结果页可揭晓
- 多人可创建房间
- 多人可加入房间
- 多人消息可同步

## 六、常见问题

### 1. 前端能打开，但题库加载失败

优先检查：

- `VITE_API_BASE_URL` 是否正确
- 后端是否真的在线
- 后端 `CORS_ORIGIN` 是否包含前端域名

### 2. 单人模式正常，但多人模式连不上

优先检查：

- `VITE_SOCKET_URL` 是否配置为后端公网域名
- 平台是否支持 WebSocket
- 后端日志里是否有 Socket 连接报错

### 3. 后端启动了，但 AI 调用失败

优先检查：

- `DEEPSEEK_API_KEY` 是否正确
- 账户余额是否可用
- `DEEPSEEK_BASE_URL` 与 `DEEPSEEK_MODEL` 是否填写正确

### 4. 线上前端还是在请求本地地址

说明你没有正确配置生产环境变量，或者前端没有重新部署。

## 七、建议你部署时截图保存的内容

为了后续打卡和复盘，建议保留这些截图：

- Vercel 项目配置页
- Railway 环境变量页
- 前端部署成功页
- 后端 `/api/test` 成功页
- 单人模式线上联调成功页
- 多人房间线上成功页
