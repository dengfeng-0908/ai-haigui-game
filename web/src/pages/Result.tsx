import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { StoryReveal } from "../components/StoryReveal";
import { revealStory } from "../services/api";
import type { TResultNavigationState, TStoryReveal } from "../types";

type TReviewTag = {
  label: string;
  toneClass: string;
  hint: string;
};

type TPlayerSpotlight = {
  title: string;
  name: string;
  detail: string;
  toneClass: string;
};

function buildReviewTags(state: TResultNavigationState | null, questionCount: number): TReviewTag[] {
  if (!state) {
    return [];
  }

  const tags: TReviewTag[] = [];
  const isMulti = state.mode === "multi" && (state.playerCount ?? 0) > 1;

  if (state.solved) {
    if (questionCount <= 6) {
      tags.push({
        label: "快速破局",
        toneClass: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
        hint: "较少轮次就贴近真相，节奏很干净。",
      });
    } else {
      tags.push({
        label: "稳扎稳打",
        toneClass: "border-sky-400/25 bg-sky-400/10 text-sky-200",
        hint: "通过持续追问逐步收拢信息。",
      });
    }
  } else {
    tags.push({
      label: "留有余地",
      toneClass: "border-amber-400/25 bg-amber-400/10 text-amber-100",
      hint: "这一局还差一点收束，但已经摸到关键方向。",
    });
  }

  if (isMulti) {
    tags.push({
      label: "协作推进",
      toneClass: "border-violet-400/25 bg-violet-400/10 text-violet-100",
      hint: "多人共同推进，让信息拼图更快成形。",
    });
  } else if (state.hintUsedCount > 0) {
    tags.push({
      label: "借力前进",
      toneClass: "border-amber-400/25 bg-amber-400/10 text-amber-100",
      hint: "提示帮助你把方向拉回到有效信息上。",
    });
  }

  return tags.slice(0, 2);
}

function buildRoundSummary(state: TResultNavigationState | null, questionCount: number, answerCount: number) {
  if (!state) {
    return "直接进入结果页时，系统会退化为默认展示，但仍可完整查看汤底与复盘内容。";
  }

  if (state.solved) {
    if (questionCount <= 6) {
      return `本局用 ${questionCount} 次提问完成破局，节奏很紧凑。`;
    }

    return `本局通过 ${questionCount} 次提问和 ${answerCount} 次 AI 回答完成收束，信息链路比较完整。`;
  }

  return `本局进行了 ${questionCount} 次提问和 ${answerCount} 次 AI 回答，已经接近真相，但还差最后一次收束。`;
}

function buildPlayerSpotlights(state: TResultNavigationState | null): TPlayerSpotlight[] {
  if (!state || state.mode !== "multi" || (state.playerCount ?? 0) < 2) {
    return [];
  }

  const activity = new Map<string, { host: number; discussion: number }>();
  state.messages.forEach((message) => {
    if (message.role !== "user" || !message.playerName) {
      return;
    }

    const current = activity.get(message.playerName) ?? { host: 0, discussion: 0 };
    if ((message.channel ?? "host") === "discussion") {
      current.discussion += 1;
    } else {
      current.host += 1;
    }
    activity.set(message.playerName, current);
  });

  const sortedPlayers = Array.from(activity.entries()).sort((left, right) => {
    const leftScore = left[1].host * 2 + left[1].discussion;
    const rightScore = right[1].host * 2 + right[1].discussion;
    return rightScore - leftScore;
  });

  const spotlights: TPlayerSpotlight[] = [];
  const leadPlayer = sortedPlayers[0];
  if (leadPlayer) {
    spotlights.push({
      title: "主推进者",
      name: leadPlayer[0],
      detail: `发起了 ${leadPlayer[1].host} 次主持提问，并补了 ${leadPlayer[1].discussion} 条队内讨论。`,
      toneClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    });
  }

  if (
    state.finalProposerName &&
    state.finalProposerName !== leadPlayer?.[0]
  ) {
    spotlights.push({
      title: "收束提交者",
      name: state.finalProposerName,
      detail: "在房间信息基本稳定后发起了最终推理收束。",
      toneClass: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    });
  } else if (state.finalProposerName) {
    spotlights.push({
      title: "完成收束",
      name: state.finalProposerName,
      detail: "既负责推进，也按下了这局的最终判定。",
      toneClass: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    });
  }

  return spotlights.slice(0, 2);
}

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

  const questionCount = state?.messages.filter((message) => message.role === "user").length ?? 0;
  const answerCount = state?.messages.filter((message) => message.role === "assistant").length ?? 0;
  const modeLabel = state?.mode === "multi" ? "多人结算" : "单人结算";
  const reviewTags = buildReviewTags(state, questionCount);
  const roundSummary = buildRoundSummary(state, questionCount, answerCount);
  const playerSpotlights = buildPlayerSpotlights(state);
  const highlightedClues = state?.highlightedClues ?? [];
  const solvedTitle = state?.solved
    ? state?.mode === "multi"
      ? "你们成功还原了真相"
      : "你成功还原了真相"
    : "本局以揭晓汤底结束";

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
          {modeLabel}
        </div>
      </div>

      <StoryReveal story={story} />

      <section className="mt-6 rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-400/5 p-5 shadow-lg shadow-slate-950/30 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">本局结算</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-100">{solvedTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{roundSummary}</p>
            {state?.feedback ? (
              <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm leading-7 text-slate-200">
                {state.feedback}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">本局状态</p>
            <p className={`mt-2 font-semibold ${state?.solved ? "text-emerald-300" : "text-amber-300"}`}>
              {state?.solved ? "已破解" : "已揭晓"}
            </p>
            <p className="mt-2 text-slate-400">AI 主持已完成最终判定与真相展示。</p>
          </div>
        </div>

        {reviewTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {reviewTags.map((tag) => (
              <div key={tag.label} className={`rounded-full border px-4 py-2 text-sm ${tag.toneClass}`}>
                <span className="font-semibold">{tag.label}</span>
                <span className="ml-2 text-xs opacity-80">{tag.hint}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {!state ? (
        <section className="mt-6 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
          当前是直接打开结果页，因此过程数据会退化为默认值，但仍可正常查看完整汤底、关键事实和提示回顾。
        </section>
      ) : null}

      {playerSpotlights.length > 0 || highlightedClues.length > 0 ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {playerSpotlights.length > 0 ? (
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">房间角色</p>
              <div className="mt-4 space-y-3">
                {playerSpotlights.map((spotlight) => (
                  <div
                    key={`${spotlight.title}-${spotlight.name}`}
                    className={`rounded-2xl border px-4 py-4 ${spotlight.toneClass}`}
                  >
                    <p className="text-xs uppercase tracking-[0.22em] opacity-75">
                      {spotlight.title}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{spotlight.name}</p>
                    <p className="mt-2 text-sm leading-6 opacity-80">{spotlight.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {highlightedClues.length > 0 ? (
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">高光线索</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    这是本局被玩家手动收录的关键问题和关键回复，适合回头复盘哪一步真正推动了真相落地。
                  </p>
                </div>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                  {highlightedClues.length} 条
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {highlightedClues.slice(0, 4).map((clue, index) => (
                  <div
                    key={clue.messageId}
                    className="rounded-2xl border border-amber-400/10 bg-slate-950/80 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-100">
                        {index + 1}
                      </span>
                      <span className="text-xs text-slate-500">
                        {clue.sourceRole === "assistant"
                          ? "主持回复"
                          : clue.channel === "discussion"
                            ? "队友讨论"
                            : "关键提问"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-100">{clue.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">判定结果</p>
          <p className={`mt-3 text-lg font-semibold ${state?.solved ? "text-emerald-300" : "text-amber-300"}`}>
            {state?.solved ? "已成功收束" : "已完成揭晓"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{roundSummary}</p>
        </div>
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">过程数据</p>
          <p className="mt-3 text-sm text-slate-300">
            提问数：<span className="font-semibold text-slate-100">{questionCount}</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            AI 回答：<span className="font-semibold text-slate-100">{answerCount}</span>
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
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">下一步</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">可以换一道题继续，也可以回头复盘哪些问题最有效、哪些提示最有帮助。</p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            再来一局
          </Link>
        </div>
      </section>
    </main>
  );
}
