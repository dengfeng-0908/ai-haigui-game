type TConfirmedFactsProps = {
  facts: string[];
};

export function ConfirmedFacts({ facts }: TConfirmedFactsProps) {
  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">已确认信息</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            这里只保留被 AI 主持确认过、可安全复盘的事实，方便你快速回看关键线索。
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {facts.length} 条
        </span>
      </div>
      {facts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-400">
          暂时还没有明确事实。优先确认人物状态、关键动作和触发结果的新信息。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {facts.map((fact, index) => (
            <li
              key={fact}
              className="flex gap-3 rounded-2xl border border-emerald-500/15 bg-slate-950/80 px-4 py-3 text-sm text-slate-200"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-300">
                {index + 1}
              </span>
              {fact}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
