import type { TStoryPreview } from "../types";

type TGameCardProps = {
  story: TStoryPreview;
  onSingleStart: (storyId: string) => void;
  onMultiStart: (storyId: string) => void;
};

const DIFFICULTY_LABEL: Record<TStoryPreview["difficulty"], string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const DIFFICULTY_STYLES: Record<TStoryPreview["difficulty"], string> = {
  easy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  medium: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  hard: "border-rose-500/25 bg-rose-500/10 text-rose-300",
};

export function GameCard({
  story,
  onSingleStart,
  onMultiStart,
}: TGameCardProps) {
  return (
    <article className="group rounded-[24px] border border-slate-800/90 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/25 transition duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${DIFFICULTY_STYLES[story.difficulty]}`}
          >
            {DIFFICULTY_LABEL[story.difficulty]}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-100">{story.title}</h3>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs text-slate-300">
          #{story.id}
        </span>
      </div>
      <p className="mt-4 line-clamp-4 min-h-[96px] text-sm leading-7 text-slate-300">
        {story.surface}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {story.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 text-xs text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-6 text-slate-400">
        单人适合自己慢慢缩小范围，多人适合共享问答记录和一起推理。
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSingleStart(story.id)}
          className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          单人推理
        </button>
        <button
          type="button"
          onClick={() => onMultiStart(story.id)}
          className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
        >
          创建房间
        </button>
      </div>
    </article>
  );
}
