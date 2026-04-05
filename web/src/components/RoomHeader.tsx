import type { TRoomPlayer } from "../types";

type TRoomHeaderProps = {
  roomId: string;
  players: TRoomPlayer[];
};

export function RoomHeader({ roomId, players }: TRoomHeaderProps) {
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/multi/room/${roomId}`
      : `/multi/room/${roomId}`;

  return (
    <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">多人房间</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">房间号：{roomId}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            所有玩家共享同一道题、同一个 AI 主持，以及同一条推理记录。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200">
            当前在线 {players.length} 人
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(roomUrl);
              } catch {
                // Ignore clipboard failures in demo mode.
              }
            }}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
          >
            复制房间链接
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
          共享题目
        </span>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
          共享主持
        </span>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          统一结算
        </span>
        {players.map((player) => (
          <span
            key={player.id}
            className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300"
          >
            {player.name}
          </span>
        ))}
      </div>
    </section>
  );
}
