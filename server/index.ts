import "dotenv/config";

import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import {
  getStoryById,
  STORIES,
  toStoryPreview,
} from "./data/stories.js";
import { askStoryQuestion, submitFinalGuess } from "./services/ai.js";
import {
  addPlayer,
  createRoom,
  finishRoom,
  getRoom,
  incrementHint,
  pushMessage,
  removePlayer,
  setInvalidQuestionCount,
  setRoomProcessing,
  updateFacts,
} from "./services/roomManager.js";

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN.split(","),
    credentials: true,
  },
});

app.use(
  cors({
    origin: CORS_ORIGIN.split(","),
    credentials: true,
  }),
);
app.use(express.json());

function createMessage(
  role: "user" | "assistant" | "system",
  content: string,
  playerName?: string,
) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
    playerName,
  };
}

app.get("/api/test", (_request, response) => {
  response.json({
    ok: true,
    service: "ai-haigui-game-server",
  });
});

app.get("/api/stories", (_request, response) => {
  response.json(STORIES.map(toStoryPreview));
});

app.get("/api/stories/:storyId", (request, response) => {
  const story = getStoryById(request.params.storyId);
  if (!story) {
    response.status(404).send("故事不存在");
    return;
  }

  response.json(toStoryPreview(story));
});

const askHandler = async (
  storyId: string,
  question: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  invalidQuestionCount: number,
) => {
  const story = getStoryById(storyId);
  if (!story) {
    throw new Error("故事不存在");
  }

  return askStoryQuestion({
    story,
    question,
    messages,
    invalidQuestionCount,
  });
};

app.post("/api/game/ask", async (request, response) => {
  try {
    const payload = request.body as {
      storyId?: string;
      question?: string;
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
      invalidQuestionCount?: number;
    };

    if (!payload.storyId || !payload.question) {
      response.status(400).send("缺少 storyId 或 question");
      return;
    }

    const result = await askHandler(
      payload.storyId,
      payload.question,
      payload.messages ?? [],
      payload.invalidQuestionCount ?? 0,
    );

    response.json(result);
  } catch (error) {
    response.status(500).send(error instanceof Error ? error.message : "AI 判题失败");
  }
});

app.post("/api/chat", async (request, response) => {
  try {
    const payload = request.body as {
      storyId?: string;
      question?: string;
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
      invalidQuestionCount?: number;
    };

    if (!payload.storyId || !payload.question) {
      response.status(400).send("缺少 storyId 或 question");
      return;
    }

    const result = await askHandler(
      payload.storyId,
      payload.question,
      payload.messages ?? [],
      payload.invalidQuestionCount ?? 0,
    );

    response.json(result);
  } catch (error) {
    response.status(500).send(error instanceof Error ? error.message : "AI 对话失败");
  }
});

app.post("/api/game/hint", (request, response) => {
  const payload = request.body as { storyId?: string; hintUsedCount?: number };
  const story = payload.storyId ? getStoryById(payload.storyId) : null;
  if (!story) {
    response.status(404).send("故事不存在");
    return;
  }

  const hintUsedCount = payload.hintUsedCount ?? 0;
  const hint = story.hints[hintUsedCount] ?? null;

  response.json({
    hint,
    hintUsedCount: hint ? hintUsedCount + 1 : hintUsedCount,
    remaining: Math.max(story.hints.length - hintUsedCount - (hint ? 1 : 0), 0),
  });
});

app.post("/api/game/submit", async (request, response) => {
  try {
    const payload = request.body as { storyId?: string; guess?: string };
    const story = payload.storyId ? getStoryById(payload.storyId) : null;
    if (!story || !payload.guess) {
      response.status(400).send("缺少 storyId 或 guess");
      return;
    }

    const result = await submitFinalGuess({
      story,
      guess: payload.guess,
    });

    response.json(result);
  } catch (error) {
    response.status(500).send(error instanceof Error ? error.message : "提交推理失败");
  }
});

app.post("/api/game/reveal", (request, response) => {
  const payload = request.body as { storyId?: string };
  const story = payload.storyId ? getStoryById(payload.storyId) : null;
  if (!story) {
    response.status(404).send("故事不存在");
    return;
  }

  response.json(story);
});

app.post("/api/rooms", (request, response) => {
  try {
    const payload = request.body as { storyId?: string };
    if (!payload.storyId) {
      response.status(400).send("缺少 storyId");
      return;
    }

    const room = createRoom(payload.storyId);
    response.status(201).json({ roomId: room.id });
  } catch (error) {
    response.status(500).send(error instanceof Error ? error.message : "创建房间失败");
  }
});

app.get("/api/rooms/:roomId", (request, response) => {
  const room = getRoom(request.params.roomId);
  if (!room) {
    response.status(404).send("房间不存在");
    return;
  }

  response.json(room);
});

io.on("connection", (socket) => {
  socket.on("room:join", (payload: { roomId?: string; playerName?: string }) => {
    if (!payload.roomId) {
      socket.emit("room:error", { message: "缺少房间号" });
      return;
    }

    const room = addPlayer(payload.roomId, {
      id: socket.id,
      name: payload.playerName?.trim() || "游客",
    });
    if (!room) {
      socket.emit("room:error", { message: "房间不存在" });
      return;
    }

    socket.data.roomId = payload.roomId;
    socket.join(payload.roomId);
    io.to(payload.roomId).emit("room:state", room);
  });

  socket.on(
    "room:ask",
    async (payload: { roomId?: string; question?: string; playerName?: string }) => {
      if (!payload.roomId || !payload.question) {
        socket.emit("room:error", { message: "问题不能为空" });
        return;
      }

      const room = getRoom(payload.roomId);
      if (!room) {
        socket.emit("room:error", { message: "房间不存在" });
        return;
      }
      if (room.status === "finished") {
        socket.emit("room:error", { message: "本局已结束" });
        return;
      }
      if (room.isProcessing) {
        socket.emit("room:error", { message: "AI 正在处理上一条问题" });
        return;
      }

      setRoomProcessing(room.id, true);
      pushMessage(
        room.id,
        createMessage("user", payload.question, payload.playerName || "游客"),
      );
      io.to(room.id).emit("room:state", getRoom(room.id));

      try {
        const result = await askStoryQuestion({
          story: getStoryById(room.storyId)!,
          question: payload.question,
          messages: room.messages
            .filter(
              (
                message,
              ): message is typeof message & { role: "user" | "assistant" } =>
                message.role === "user" || message.role === "assistant",
            )
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
          invalidQuestionCount: room.invalidQuestionCount,
        });

        pushMessage(room.id, createMessage("assistant", result.displayText));
        updateFacts(room.id, result.confirmedFacts);
        setInvalidQuestionCount(room.id, result.invalidQuestionCount);
      } catch (error) {
        pushMessage(
          room.id,
          createMessage(
            "system",
            error instanceof Error ? error.message : "AI 回复失败，请稍后再试",
          ),
        );
      } finally {
        setRoomProcessing(room.id, false);
        io.to(room.id).emit("room:state", getRoom(room.id));
      }
    },
  );

  socket.on("room:hint", (payload: { roomId?: string }) => {
    if (!payload.roomId) {
      socket.emit("room:error", { message: "缺少房间号" });
      return;
    }

    const room = getRoom(payload.roomId);
    const story = room ? getStoryById(room.storyId) : null;
    if (!room || !story) {
      socket.emit("room:error", { message: "房间不存在" });
      return;
    }

    const hint = story.hints[room.hintUsedCount];
    if (!hint) {
      socket.emit("room:error", { message: "已经没有更多提示了" });
      return;
    }

    incrementHint(room.id);
    pushMessage(
      room.id,
      createMessage("system", `提示 ${room.hintUsedCount}：${hint}`),
    );
    io.to(room.id).emit("room:state", getRoom(room.id));
  });

  socket.on("room:submit", async (payload: { roomId?: string; guess?: string }) => {
    if (!payload.roomId || !payload.guess) {
      socket.emit("room:error", { message: "缺少推理内容" });
      return;
    }

    const room = getRoom(payload.roomId);
    const story = room ? getStoryById(room.storyId) : null;
    if (!room || !story) {
      socket.emit("room:error", { message: "房间不存在" });
      return;
    }

    try {
      const result = await submitFinalGuess({
        story,
        guess: payload.guess,
      });

      if (!result.solved) {
        pushMessage(room.id, createMessage("system", result.feedback));
        io.to(room.id).emit("room:state", getRoom(room.id));
        return;
      }

      finishRoom(room.id);
      io.to(room.id).emit("room:finished", {
        storyId: room.story.id,
        storyTitle: room.story.title,
        messages: room.messages,
        hintUsedCount: room.hintUsedCount,
        solved: true,
        feedback: result.feedback,
        playerCount: room.players.length,
      });
    } catch (error) {
      socket.emit("room:error", {
        message: error instanceof Error ? error.message : "提交推理失败",
      });
    }
  });

  socket.on("room:giveup", (payload: { roomId?: string }) => {
    if (!payload.roomId) {
      socket.emit("room:error", { message: "缺少房间号" });
      return;
    }

    const room = getRoom(payload.roomId);
    if (!room) {
      socket.emit("room:error", { message: "房间不存在" });
      return;
    }

    finishRoom(room.id);
    io.to(room.id).emit("room:finished", {
      storyId: room.story.id,
      storyTitle: room.story.title,
      messages: room.messages,
      hintUsedCount: room.hintUsedCount,
      solved: false,
      feedback: "本局已放弃，直接进入揭晓阶段。",
      playerCount: room.players.length,
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) {
      return;
    }

    const room = removePlayer(roomId, socket.id);
    if (room) {
      io.to(roomId).emit("room:state", room);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`AI 海龟汤后端已启动：http://localhost:${PORT}`);
});
