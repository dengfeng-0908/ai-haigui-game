import type { THighlightedClue } from "../types";

type THighlightsPanelProps = {
  items: THighlightedClue[];
};

function getHighlightBadge(item: THighlightedClue) {
  if (item.sourceRole === "assistant") {
    return {
      label: "主持回复",
      className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
    };
  }

  if (item.channel === "discussion") {
    return {
      label: "队友讨论",
      className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
    };
  }

  return {
    label: "关键提问",
    className: "border-amber-400/25 bg-amber-400/10 text-amber-100",
  };
}

export function HighlightsPanel({ items }: THighlightsPanelProps) {
  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">协作高光</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            把房间里最关键的一句提问、回复或讨论标记出来，后来加入的人也能快速对齐。
          </p>
        </div>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
          {items.length} 条
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-400">
          还没有被标记的高光线索。看到关键一句时，直接在消息气泡里点“标记”。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => {
            const badge = getHighlightBadge(item);
            return (
              <li
                key={item.messageId}
                className="rounded-2xl border border-amber-400/10 bg-slate-950/80 px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-200">
                    {index + 1}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  {item.playerName ? (
                    <span className="text-xs text-slate-500">来源：{item.playerName}</span>
                  ) : null}
                  {item.pinnedByName ? (
                    <span className="text-xs text-slate-500">标记者：{item.pinnedByName}</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-100">{item.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
