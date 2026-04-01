type TRoomHeaderProps = {
  roomId: string;
  playerCount: number;
};

export function RoomHeader({ roomId, playerCount }: TRoomHeaderProps) {
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/multi/room/${roomId}`
      : `/multi/room/${roomId}`;

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">多人房间</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-100">房间号：{roomId}</h2>
          <p className="mt-2 text-sm text-slate-400">当前在线 {playerCount} 人</p>
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
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
        >
          复制房间链接
        </button>
      </div>
    </section>
  );
}
