import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Socket } from "socket.io-client";

import { ChatBox } from "../components/ChatBox";
import { ConfirmedFacts } from "../components/ConfirmedFacts";
import { HighlightsPanel } from "../components/HighlightsPanel";
import { HintPanel } from "../components/HintPanel";
import { RoomHeader } from "../components/RoomHeader";
import { getRoom } from "../services/api";
import { createRoomSocket } from "../services/socket";
import { DIFFICULTY_LABEL, DIFFICULTY_STYLES } from "../storyMeta";
import { getSingleGameGuide } from "../storyGuides";
import type { TMessage, TRoomSnapshot } from "../types";

type TMessageView = "all" | "host" | "discussion";
type TComposerMode = "host" | "discussion";

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
  const [socketPlayerId, setSocketPlayerId] = useState<string | null>(null);
  const [messageView, setMessageView] = useState<TMessageView>("all");
  const [composerMode, setComposerMode] = useState<TComposerMode>("host");
  const [inputValue, setInputValue] = useState("");
  const [guessValue, setGuessValue] = useState("");
  const [joiningError, setJoiningError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const questionCount = useMemo(
    () =>
      room?.messages.filter(
        (message) =>
          message.role === "user" && (message.channel ?? "host") === "host",
      ).length ?? 0,
    [room],
  );
  const answerCount = useMemo(
    () =>
      room?.messages.filter(
        (message) =>
          message.role === "assistant" && (message.channel ?? "host") === "host",
      ).length ?? 0,
    [room],
  );
  const discussionCount = useMemo(
    () =>
      room?.messages.filter(
        (message) =>
          message.role === "user" && (message.channel ?? "host") === "discussion",
      ).length ?? 0,
    [room],
  );
  const roomGuide = useMemo(
    () => (room ? getSingleGameGuide(room.story.id) : null),
    [room],
  );
  const visibleMessages = useMemo(() => {
    if (!room) {
      return [];
    }

    return room.messages.filter((message) => {
      const channel = message.channel ?? "host";

      if (message.role === "system") {
        return messageView !== "discussion";
      }

      if (message.role === "assistant") {
        return messageView !== "discussion";
      }

      if (messageView === "all") {
        return true;
      }

      return channel === messageView;
    });
  }, [messageView, room]);

  const playerName = useMemo(() => {
    if (typeof window === "undefined") {
      return "游客";
    }

    return window.localStorage.getItem("haigui-player-name") || "游客";
  }, []);

  const highlightedMessageIds = useMemo(
    () => room?.highlightedClues.map((item) => item.messageId) ?? [],
    [room],
  );
  const currentProposal = room?.finalProposal ?? null;
  const hasApprovedCurrentProposal = useMemo(() => {
    if (!currentProposal || !socketPlayerId) {
      return false;
    }

    return currentProposal.approvals.includes(socketPlayerId);
  }, [currentProposal, socketPlayerId]);
  const isProposalAuthor = useMemo(() => {
    if (!currentProposal || !socketPlayerId) {
      return false;
    }

    return currentProposal.proposerId === socketPlayerId;
  }, [currentProposal, socketPlayerId]);
  const isSendingToHost = composerMode === "host" && Boolean(room?.isProcessing);

  useEffect(() => {
    const socket = createRoomSocket();
    socketRef.current = socket;
    let disposed = false;

    socket.on("connect", () => {
      setSocketPlayerId(socket.id ?? null);
      socket.emit("room:join", {
        roomId,
        playerName,
      });
    });

    socket.on("disconnect", () => {
      if (!disposed) {
        setSocketPlayerId(null);
      }
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
        finalProposerName?: string;
        highlightedClues?: TRoomSnapshot["highlightedClues"];
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
            finalProposerName: payload.finalProposerName,
            highlightedClues: payload.highlightedClues ?? [],
          },
        });
      },
    );

    void getRoom(roomId)
      .then((snapshot) => {
        if (disposed) {
          return;
        }

        setRoom(snapshot);
        socket.connect();
      })
      .catch((roomError) => {
        if (disposed) {
          return;
        }

        setJoiningError(roomError instanceof Error ? roomError.message : "房间不存在");
      })
      .finally(() => {
        if (!disposed) {
          setIsLoading(false);
        }
      });

    return () => {
      disposed = true;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [navigate, playerName, roomId]);

  function emit(eventName: string, payload: Record<string, unknown>) {
    socketRef.current?.emit(eventName, payload);
  }

  function handleSend() {
    const question = inputValue.trim();
    if (!question || !room || room.status === "finished") {
      return;
    }
    if (composerMode === "host" && room.isProcessing) {
      return;
    }

    setInputValue("");
    emit("room:ask", {
      roomId,
      question,
      playerName,
      channel: composerMode,
    });
  }

  function handleHint() {
    if (!room || room.isProcessing || room.status === "finished") {
      return;
    }

    emit("room:hint", {
      roomId,
    });
  }

  function handleSubmitGuess() {
    const guess = guessValue.trim();
    if (!guess || !room || room.status === "finished" || room.isProcessing) {
      return;
    }

    setGuessValue("");
    emit("room:submit", {
      roomId,
      guess,
      playerName,
    });
  }

  function handleApproveProposal() {
    if (!room || room.status === "finished" || room.isProcessing || !room.finalProposal) {
      return;
    }

    emit("room:submit", {
      roomId,
      action: "approve",
    });
  }

  function handleToggleHighlight(message: TMessage) {
    if (!room || message.role === "system" || room.status === "finished") {
      return;
    }

    emit("room:highlight", {
      roomId,
      messageId: message.id,
      playerName,
    });
  }

  function handleGiveUp() {
    if (!room || room.status === "finished") {
      return;
    }

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
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">
          <p className="text-sm uppercase tracking-[0.25em] text-rose-200/80">房间连接失败</p>
          <p className="mt-3 text-base">{joiningError || "房间不存在"}</p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-xl border border-rose-300/30 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10"
          >
            返回大厅重新进入
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-sm text-slate-400 transition hover:text-slate-200">
          ← 返回大厅
        </Link>
        <button
          type="button"
          onClick={handleGiveUp}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
        >
          全员放弃并揭晓
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <section className="space-y-4">
          <RoomHeader roomId={room.id} players={room.players} />
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/25">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">多人模式</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-100">{room.story.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${DIFFICULTY_STYLES[room.story.difficulty]}`}
              >
                {DIFFICULTY_LABEL[room.story.difficulty]}
              </span>
              {room.story.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              这里的每个问题、每条提示和每次结算，都会同步给房间里的所有玩家。
            </p>
            <div className="relative mt-6 overflow-hidden rounded-[24px] border border-amber-400/25 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.03)]">
              <div className="absolute inset-y-4 left-4 w-px bg-gradient-to-b from-transparent via-amber-300/70 to-transparent" />
              <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-300/75">核心汤面</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-50">
                    全房间都围绕这句题面推进
                  </h2>
                </div>
                {roomGuide ? (
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                    当前切入：{roomGuide.title}
                  </span>
                ) : null}
              </div>
              <p className="relative mt-5 pl-6 text-xl font-semibold leading-10 text-slate-50 sm:text-[1.75rem]">
                {room.story.surface}
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">主持提问</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{questionCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI 回复</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{answerCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">队友讨论</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{discussionCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">已确认事实</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">
                  {room.confirmedFacts.length}
                </p>
              </div>
            </div>
            <div className="mt-5 min-h-[420px] sm:min-h-[560px]">
              <ChatBox
                title="共享消息区"
                description="主持问答和队友讨论都留在同一页里，但现在可以按频道筛选，避免闲聊混进判定链路。"
                messages={visibleMessages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                isSending={isSendingToHost}
                disabled={room.status === "finished"}
                placeholder={
                  composerMode === "host"
                    ? "把你的问题发给 AI 主持"
                    : "先和队友讨论思路、补全假设或提醒重复方向"
                }
                emptyState={
                  messageView === "discussion"
                    ? "队友讨论会单独出现在这里，先把方向聊清楚，再把关键问题送给主持人。"
                    : messageView === "host"
                      ? "主持问答会集中出现在这里，便于回看真正进入判定的线索链。"
                      : "先由任意一位玩家开问，大家共享同一条消息流和同一个 AI 主持。"
                }
                currentPlayerName={playerName}
                composerLabel={
                  composerMode === "host" ? "向共享 AI 主持提问" : "与队友讨论"
                }
                composerHint={
                  composerMode === "host"
                    ? "这里的输入会同步给全房间并直接送去判定。先和队友对齐方向，再把问题发给主持人。"
                    : "讨论消息不会送给 AI，用来整理已知事实、提醒重复方向和打磨最终推理。"
                }
                sendLabel={composerMode === "host" ? "发送问题" : "发送讨论"}
                highlightedMessageIds={highlightedMessageIds}
                onToggleHighlight={handleToggleHighlight}
                headerAccessory={
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "全部" },
                      { value: "host", label: "主持问答" },
                      { value: "discussion", label: "队友讨论" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMessageView(option.value as TMessageView)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          messageView === option.value
                            ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                            : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500 hover:text-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                }
                composerAccessory={
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        value: "host",
                        label: "问主持",
                        hint: "进入 AI 判定",
                      },
                      {
                        value: "discussion",
                        label: "聊思路",
                        hint: "不送 AI",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setComposerMode(option.value as TComposerMode)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          composerMode === option.value
                            ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-50"
                            : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-slate-100"
                        }`}
                      >
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="mt-1 text-xs opacity-80">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                }
              />
            </div>
          </section>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">协作建议</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">先统一事实，再统一结论</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
              <li>讨论区先整理“已知事实”和“待验证假设”，别把闲聊直接送给主持人。</li>
              <li>看到别人已经问过的方向，就顺着线索继续深挖，不要重复浪费判定机会。</li>
              <li>看到关键一句时直接点“标记”，后来加入的队友能更快追上进度。</li>
            </ul>
          </section>
          <HintPanel
            hintUsedCount={room.hintUsedCount}
            onRequestHint={handleHint}
            disabled={room.isProcessing}
          />
          <HighlightsPanel items={room.highlightedClues} />
          <ConfirmedFacts facts={room.confirmedFacts} />
          <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  最终推理共识
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-100">
                  先发起，再征求同意
                </h3>
              </div>
              {currentProposal ? (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                  {currentProposal.approvals.length}/{currentProposal.requiredApprovals} 已同意
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              任意玩家都可以先写一版完整真相发起提案。达到半数以上同意后，才会正式触发 AI 的最终判定。
            </p>

            {currentProposal ? (
              <div className="mt-4 rounded-2xl border border-amber-400/15 bg-slate-950/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                    发起人：{currentProposal.proposerName}
                  </span>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                    还差{" "}
                    {Math.max(
                      currentProposal.requiredApprovals - currentProposal.approvals.length,
                      0,
                    )}{" "}
                    票
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-100">{currentProposal.guess}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleApproveProposal}
                    disabled={hasApprovedCurrentProposal || room.isProcessing}
                    className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                  >
                    {hasApprovedCurrentProposal ? "你已同意" : "同意并提交"}
                  </button>
                  <p className="text-xs leading-5 text-slate-500">
                    {isProposalAuthor
                      ? "你可以继续修改下方文本并发起新版本，旧提案会被替换。"
                      : "如果你不同意这版推理，直接在下方写新版本即可覆盖当前提案。"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-400">
                还没有待确认的最终推理。建议先把高光线索和已确认事实整理稳定，再发起第一版共识稿。
              </div>
            )}

            <textarea
              value={guessValue}
              onChange={(event) => setGuessValue(event.target.value)}
              rows={5}
              placeholder="把你们讨论出的完整真相写出来，发起一版待确认的最终推理"
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleSubmitGuess}
              disabled={room.isProcessing}
              className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              {currentProposal ? "发起新版本" : "发起最终推理"}
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
