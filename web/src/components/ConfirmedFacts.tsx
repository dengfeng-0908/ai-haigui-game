type TConfirmedFactsProps = {
  facts: string[];
};

export function ConfirmedFacts({ facts }: TConfirmedFactsProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">已确认信息</p>
      {facts.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-slate-400">
          暂时还没有明确事实。尽量避免重复问法，先缩小问题范围。
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {facts.map((fact) => (
            <li
              key={fact}
              className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-200"
            >
              {fact}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
