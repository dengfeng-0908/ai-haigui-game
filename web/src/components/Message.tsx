import type { TMessage } from "../types";

type TMessageProps = {
  message: TMessage;
};

export function Message({ message }: TMessageProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-slate-800/90 px-4 py-2 text-xs text-slate-300">
          {message.content}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isUser ? "bg-amber-400 text-slate-950" : "bg-sky-500/20 text-sky-300"
          }`}
        >
          {isUser ? "你" : "AI"}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
            isUser
              ? "rounded-tr-sm bg-amber-400 text-slate-950"
              : "rounded-tl-sm border border-slate-800 bg-slate-900 text-slate-100"
          }`}
        >
          {message.playerName && !isUser ? (
            <div className="mb-1 text-xs uppercase tracking-[0.2em] text-sky-300/80">
              {message.playerName}
            </div>
          ) : null}
          {message.content}
        </div>
      </div>
    </div>
  );
}
