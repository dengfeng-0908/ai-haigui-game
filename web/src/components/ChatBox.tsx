import { useEffect, useRef } from "react";

import type { TMessage } from "../types";
import { Message } from "./Message";

type TChatBoxProps = {
  messages: TMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder?: string;
  disabled?: boolean;
};

export function ChatBox({
  messages,
  inputValue,
  onInputChange,
  onSend,
  isSending,
  placeholder = "问一个能缩小范围的问题",
  disabled = false,
}: TChatBoxProps) {
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/80 shadow-lg">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center text-sm leading-6 text-slate-400">
            先从人物、时间、地点、动机里挑一个方向问起。
          </div>
        ) : null}
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isSending ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
              AI 正在思考...
            </div>
          </div>
        ) : null}
        <div ref={scrollAnchorRef} />
      </div>
      <div className="border-t border-slate-800 bg-slate-950/80 p-4">
        <div className="flex gap-3">
          <input
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            disabled={disabled || isSending}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || isSending}
            className="rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
