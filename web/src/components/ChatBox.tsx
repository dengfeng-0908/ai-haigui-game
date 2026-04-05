import { useEffect, useRef, type ReactNode } from "react";

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
  title?: string;
  description?: string;
  emptyState?: string;
  currentPlayerName?: string;
  composerLabel?: string;
  composerHint?: string;
  sendLabel?: string;
  headerAccessory?: ReactNode;
  composerAccessory?: ReactNode;
  highlightedMessageIds?: string[];
  onToggleHighlight?: (message: TMessage) => void;
};

export function ChatBox({
  messages,
  inputValue,
  onInputChange,
  onSend,
  isSending,
  placeholder = "问一个能缩小范围的问题",
  disabled = false,
  title,
  description,
  emptyState = "先从人物、时间、地点、动机里挑一个方向问起。",
  currentPlayerName,
  composerLabel,
  composerHint,
  sendLabel = "发送",
  headerAccessory,
  composerAccessory,
  highlightedMessageIds = [],
  onToggleHighlight,
}: TChatBoxProps) {
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-slate-800/90 bg-slate-900/80 shadow-xl shadow-slate-950/25">
      {title || description ? (
        <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {title ? <h2 className="text-lg font-semibold text-slate-50">{title}</h2> : null}
              {description ? (
                <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
              ) : null}
            </div>
            {headerAccessory}
          </div>
        </div>
      ) : null}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center text-sm leading-6 text-slate-400">
            {emptyState}
          </div>
        ) : null}
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            currentPlayerName={currentPlayerName}
            isHighlighted={highlightedMessageIds.includes(message.id)}
            onToggleHighlight={onToggleHighlight}
          />
        ))}
        {isSending ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400 shadow-lg shadow-slate-950/25">
              AI 正在思考...
            </div>
          </div>
        ) : null}
        <div ref={scrollAnchorRef} />
      </div>
      <div className="border-t border-slate-800 bg-slate-950/80 p-4">
        {composerAccessory ? <div className="mb-3">{composerAccessory}</div> : null}
        {composerLabel || composerHint ? (
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-800/90 bg-slate-900/70 px-4 py-3">
            <div>
              {composerLabel ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
                  {composerLabel}
                </p>
              ) : null}
              {composerHint ? (
                <p className="mt-1 text-xs leading-5 text-slate-400">{composerHint}</p>
              ) : null}
            </div>
            {isSending ? (
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                AI 判定中
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
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
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || isSending}
            className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 sm:min-w-[112px]"
          >
            {sendLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
