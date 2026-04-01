import type { TStoryReveal } from "../types";

type TStoryRevealProps = {
  story: TStoryReveal;
};

export function StoryReveal({ story }: TStoryRevealProps) {
  return (
    <section className="rounded-lg border border-amber-400/20 bg-slate-900/85 p-6 shadow-glow">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">汤底揭晓</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-100">{story.title}</h1>
      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/80 p-5">
        <p className="text-sm leading-8 text-slate-200">{story.bottom}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
          <h2 className="text-sm font-semibold text-slate-100">关键事实</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {story.keyFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
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
