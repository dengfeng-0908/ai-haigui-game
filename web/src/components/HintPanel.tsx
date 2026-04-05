type THintPanelProps = {
  hintUsedCount: number;
  onRequestHint: () => void;
  disabled?: boolean;
  totalHints?: number;
};

export function HintPanel({
  hintUsedCount,
  onRequestHint,
  disabled = false,
  totalHints = 3,
}: THintPanelProps) {
  const visibleHintCount = Math.max(totalHints, hintUsedCount, 1);
  const remainingHintCount = Math.max(visibleHintCount - hintUsedCount, 0);
  const stageLabels = Array.from({ length: visibleHintCount }, (_, index) => `第 ${index + 1} 层`);

  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">防卡关</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-100">提示系统</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            当前已使用 <span className="font-semibold text-amber-300">{hintUsedCount}</span> 次提示。
          </p>
          <p className="mt-1 text-sm text-slate-500">
            剩余约 <span className="font-semibold text-slate-200">{remainingHintCount}</span> 次方向提示。
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestHint}
          disabled={disabled}
          className="rounded-xl border border-amber-400/50 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
        >
          获取提示
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: visibleHintCount }, (_, index) => (
          <div
            key={`${hintUsedCount}-${index}`}
            className={`h-2 flex-1 rounded-full ${
              index < hintUsedCount ? "bg-amber-400" : "bg-slate-800"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        {stageLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        提示只负责收窄方向，不会直接公开汤底。
      </p>
    </section>
  );
}
