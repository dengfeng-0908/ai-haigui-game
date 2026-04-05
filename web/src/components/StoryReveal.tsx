import type { TStoryReveal } from "../types";

type TStoryRevealProps = {
  story: TStoryReveal;
};

export function StoryReveal({ story }: TStoryRevealProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-glow">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
      <div className="absolute -right-14 top-0 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">汤底揭晓</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold text-slate-100 sm:text-4xl">{story.title}</h1>
        <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
          {story.difficulty}
        </span>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">{story.surface}</p>
      {story.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {story.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-6 rounded-[24px] border border-amber-400/25 bg-gradient-to-br from-amber-400/10 via-slate-950/90 to-slate-950 p-5 shadow-inner shadow-amber-950/20">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">最终真相</p>
        <p className="mt-4 border-l-2 border-amber-300/50 pl-4 text-base leading-8 text-slate-100 sm:text-lg">
          {story.bottom}
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
          <h2 className="text-sm font-semibold text-slate-100">关键事实</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {story.keyFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
          <h2 className="text-sm font-semibold text-slate-100">提示回顾</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {story.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
