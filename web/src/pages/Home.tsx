import { useEffect, useMemo, useState } from "react";
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
      { label: "双模式", value: "单人 / 多人" },
      { label: "主持方式", value: "AI 受控判题" },
      { label: "首版重点", value: "防卡关体验" },
    ],
    [],
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
      <section className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-950/30">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10 lg:py-12">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-300/70">AI 海龟汤</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-50 sm:text-5xl">
              不是另一个题库，
              <span className="block text-amber-300">而是能顺畅玩完一局的 AI 主持推理 Demo。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              你可以直接单人开局，也可以一键建房邀请朋友一起猜。当前版本优先验证可玩性、稳定性和防卡关体验。
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {introStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-lg font-semibold text-slate-100">快速组局</h2>
            <label className="mt-5 block text-sm text-slate-300">
              你的昵称
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
              />
            </label>
            <label className="mt-4 block text-sm text-slate-300">
              已有房间号
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="输入 6 位房间号"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400"
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
              className="mt-4 w-full rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              加入房间
            </button>
            <div className="mt-6 rounded-lg border border-dashed border-slate-700 p-4 text-sm leading-7 text-slate-400">
              单人模式适合自己推理，多人模式适合共享问答记录和同步 AI 回答。
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">题库大厅</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-100">选择一题开始</h2>
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
        {isLoading ? (
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
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
