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

export function GameCard({
  story,
  onSingleStart,
  onMultiStart,
}: TGameCardProps) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">
            {DIFFICULTY_LABEL[story.difficulty]}
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-100">{story.title}</h3>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
          #{story.id}
        </span>
      </div>
      <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-300">
        {story.surface}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {story.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSingleStart(story.id)}
          className="rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          单人开始
        </button>
        <button
          type="button"
          onClick={() => onMultiStart(story.id)}
          className="rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
        >
          多人建房
        </button>
      </div>
    </article>
  );
}
