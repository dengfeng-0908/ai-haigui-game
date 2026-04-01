import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { StoryReveal } from "../components/StoryReveal";
import { revealStory } from "../services/api";
import type { TResultNavigationState, TStoryReveal } from "../types";

export function Result() {
  const { storyId = "" } = useParams();
  const location = useLocation();
  const state = (location.state || null) as TResultNavigationState | null;
  const [story, setStory] = useState<TStoryReveal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void revealStory(storyId)
      .then(setStory)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "加载结果失败");
      });
  }, [storyId]);

  if (!story) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-slate-300">
        {error || "正在揭晓汤底..."}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 transition hover:text-slate-200">
          ← 返回大厅
        </Link>
        <div className="rounded-full border border-slate-800 px-4 py-2 text-sm text-slate-300">
          {state?.mode === "multi" ? "多人结算" : "单人结算"}
        </div>
      </div>

      <StoryReveal story={story} />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">判定结果</p>
          <p className={`mt-3 text-lg font-semibold ${state?.solved ? "text-emerald-300" : "text-amber-300"}`}>
            {state?.solved ? "你们成功还原了真相" : "本局以揭晓汤底结束"}
          </p>
          {state?.feedback ? (
            <p className="mt-3 text-sm leading-6 text-slate-300">{state.feedback}</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">过程数据</p>
          <p className="mt-3 text-sm text-slate-300">
            提问数：<span className="font-semibold text-slate-100">{state?.messages.length ?? 0}</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            提示次数：
            <span className="font-semibold text-slate-100"> {state?.hintUsedCount ?? 0}</span>
          </p>
          {state?.playerCount ? (
            <p className="mt-2 text-sm text-slate-300">
              参与人数：<span className="font-semibold text-slate-100">{state.playerCount}</span>
            </p>
          ) : null}
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">下一步</p>
          <Link
            to="/"
            className="mt-3 inline-flex rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            再来一局
          </Link>
        </div>
      </section>
    </main>
  );
}
