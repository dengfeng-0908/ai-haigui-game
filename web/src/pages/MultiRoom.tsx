import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Socket } from "socket.io-client";

import { ChatBox } from "../components/ChatBox";
import { ConfirmedFacts } from "../components/ConfirmedFacts";
import { HintPanel } from "../components/HintPanel";
import { RoomHeader } from "../components/RoomHeader";
import { getRoom } from "../services/api";
import { createRoomSocket } from "../services/socket";
import type { TMessage, TRoomSnapshot } from "../types";

function createSystemMessage(content: string): TMessage {
  return {
    id: crypto.randomUUID(),
    role: "system",
    content,
    timestamp: Date.now(),
  };
}

export function MultiRoom() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [room, setRoom] = useState<TRoomSnapshot | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [guessValue, setGuessValue] = useState("");
  const [joiningError, setJoiningError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const playerName = useMemo(() => {
    if (typeof window === "undefined") {
      return "游客";
    }

    return window.localStorage.getItem("haigui-player-name") || "游客";
  }, []);

  useEffect(() => {
    const socket = createRoomSocket();
    socketRef.current = socket;

    void getRoom(roomId)
      .then((snapshot) => {
        setRoom(snapshot);
      })
      .catch((roomError) => {
        setJoiningError(roomError instanceof Error ? roomError.message : "房间不存在");
      })
      .finally(() => {
        setIsLoading(false);
      });

    socket.connect();

    socket.on("connect", () => {
      socket.emit("room:join", {
        roomId,
        playerName,
      });
    });

    socket.on("room:state", (snapshot: TRoomSnapshot) => {
      setRoom(snapshot);
    });

    socket.on("room:error", (payload: { message: string }) => {
      setRoom((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, createSystemMessage(payload.message)],
            }
          : current,
      );
    });

    socket.on(
      "room:finished",
      (payload: {
        storyId: string;
        storyTitle: string;
        messages: TMessage[];
        hintUsedCount: number;
        solved: boolean;
        feedback: string;
        playerCount: number;
      }) => {
        navigate(`/result/${payload.storyId}`, {
          state: {
            mode: "multi",
            storyTitle: payload.storyTitle,
            messages: payload.messages,
            hintUsedCount: payload.hintUsedCount,
            solved: payload.solved,
            feedback: payload.feedback,
            playerCount: payload.playerCount,
          },
        });
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [navigate, playerName, roomId]);

  function emit(eventName: string, payload: Record<string, unknown>) {
    socketRef.current?.emit(eventName, payload);
  }

  function handleSend() {
    const question = inputValue.trim();
    if (!question) {
      return;
    }

    setInputValue("");
    emit("room:ask", {
      roomId,
      question,
      playerName,
    });
  }

  function handleHint() {
    emit("room:hint", {
      roomId,
    });
  }

  function handleSubmitGuess() {
    const guess = guessValue.trim();
    if (!guess) {
      return;
    }

    setGuessValue("");
    emit("room:submit", {
      roomId,
      guess,
    });
  }

  function handleGiveUp() {
    emit("room:giveup", {
      roomId,
    });
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-slate-300">正在连接房间...</main>
    );
  }

  if (!room) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-rose-300">
        {joiningError || "房间不存在"}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 transition hover:text-slate-200">
          ← 返回大厅
        </Link>
        <button
          type="button"
          onClick={handleGiveUp}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
        >
          全员放弃并揭晓
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.55fr]">
        <section className="space-y-4">
          <RoomHeader roomId={room.id} playerCount={room.players.length} />
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">多人模式</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-100">{room.story.title}</h1>
            <div className="mt-6 rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">汤面</p>
              <p className="mt-3 text-base leading-8 text-slate-200">{room.story.surface}</p>
            </div>
            <div className="mt-6 h-[640px]">
              <ChatBox
                messages={room.messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                isSending={room.isProcessing}
                placeholder="把你的问题发到房间里"
              />
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <HintPanel
            hintUsedCount={room.hintUsedCount}
            onRequestHint={handleHint}
            disabled={room.isProcessing}
          />
          <ConfirmedFacts facts={room.confirmedFacts} />
          <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">提交最终推理</p>
            <textarea
              value={guessValue}
              onChange={(event) => setGuessValue(event.target.value)}
              rows={5}
              placeholder="把你们讨论出的完整真相写出来"
              className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleSubmitGuess}
              className="mt-3 w-full rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              提交最终推理
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
