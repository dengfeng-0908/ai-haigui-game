type THintPanelProps = {
  hintUsedCount: number;
  onRequestHint: () => void;
  disabled?: boolean;
};

export function HintPanel({
  hintUsedCount,
  onRequestHint,
  disabled = false,
}: THintPanelProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">防卡关</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-100">提示系统</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            当前已使用 <span className="font-semibold text-amber-300">{hintUsedCount}</span> 次提示。
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestHint}
          disabled={disabled}
          className="rounded-lg border border-amber-400/50 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
        >
          获取提示
        </button>
      </div>
    </section>
  );
}
