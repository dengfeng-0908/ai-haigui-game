import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GameCard } from "../components/GameCard";
import { createRoom, getStories } from "../services/api";
import type { TStoryPreview } from "../types";

function getStoredNickname() {
  if (typeof window === "undefined") {
    return "游客";
  }

  return window.localStorage.getItem("haigui-player-name") || "游客";
}

export function Home() {
  const navigate = useNavigate();
  const libraryRef = useRef<HTMLElement | null>(null);
  const joinInputRef = useRef<HTMLInputElement | null>(null);
  const [stories, setStories] = useState<TStoryPreview[]>([]);
  const [nickname, setNickname] = useState(getStoredNickname);
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [creatingRoomId, setCreatingRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getStories()
      .then(setStories)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "题库加载失败");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("haigui-player-name", nickname.trim() || "游客");
  }, [nickname]);

  const introStats = useMemo(
    () => [
      { label: "当前题数", value: `${stories.length || 0} 道` },
      { label: "双模式", value: "单人 / 多人" },
      { label: "主持方式", value: "AI 受控判题" },
      { label: "首版重点", value: "防卡关体验" },
    ],
    [stories.length],
  );

  async function handleCreateRoom(storyId: string) {
    setCreatingRoomId(storyId);
    setError(null);

    try {
      const { roomId } = await createRoom(storyId);
      navigate(`/multi/room/${roomId}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "创建房间失败");
    } finally {
      setCreatingRoomId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-800/90 bg-slate-950/80 shadow-2xl shadow-slate-950/30">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_75%_15%,rgba(251,191,36,0.14),transparent_28%)]"
        />
        <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1.25fr_0.85fr] lg:px-10 lg:py-12">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-300/70">AI 海龟汤</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-50 sm:text-5xl">
              不是另一个题库，
              <span className="block text-amber-300">而是能顺畅玩完一局的 AI 主持推理 Demo。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              你可以直接单人开局，也可以一键建房邀请朋友一起猜。当前版本优先验证可玩性、稳定性和防卡关体验。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                进入单人题库
              </button>
              <button
                type="button"
                onClick={() => joinInputRef.current?.focus()}
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-400 hover:text-sky-300"
              >
                输入房间号加入多人
              </button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {introStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/20"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-300/70">单人模式</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-50">先看汤面，再缩小问题范围</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  适合自己慢慢推理。页面会保留 AI 回答、提示和已确认事实，尽量减少卡关和重复问法。
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-sky-300/70">多人模式</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-50">共享同一道题和同一条消息流</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  适合房间协作。所有玩家共享 AI 主持、提示和结算结果，重点是把讨论线索同步出来。
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="text-lg font-semibold text-slate-100">快速组局</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                先设置昵称，再输入房间号进入现有房间。要创建新房间，直接在下方题库卡片里点击“创建房间”。
              </p>
              <label className="mt-5 block text-sm text-slate-300">
                你的昵称
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
                />
              </label>
              <label className="mt-4 block text-sm text-slate-300">
                已有房间号
                <input
                  ref={joinInputRef}
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="输入 6 位房间号"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!joinCode.trim()) {
                    return;
                  }

                  navigate(`/multi/room/${joinCode.trim().toUpperCase()}`);
                }}
                disabled={!joinCode.trim()}
                className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                加入房间
              </button>
            </div>
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-5 text-sm leading-7 text-slate-400">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">玩法提示</p>
              <ul className="mt-3 space-y-2">
                <li>只问能被回答为“是 / 否 / 无关”的问题。</li>
                <li>先确认人物状态、时间线和关键动作，再猜动机。</li>
                <li>遇到卡关时直接点提示，不要在无关方向上硬耗。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={libraryRef}
        className="mt-10 rounded-[28px] border border-slate-800 bg-slate-900/55 p-6 shadow-xl shadow-slate-950/20"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">题库大厅</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-100">选择一题开始</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              当前共 {stories.length || 0} 道题。单人和多人都从这里进入。
            </p>
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
            正在加载题库...
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <GameCard
                key={story.id}
                story={story}
                onSingleStart={(id) => navigate(`/single/${id}`)}
                onMultiStart={handleCreateRoom}
              />
            ))}
          </div>
        )}
        {creatingRoomId ? (
          <p className="mt-4 text-sm text-slate-400">正在为题目 {creatingRoomId} 创建房间...</p>
        ) : null}
      </section>
    </main>
  );
}
