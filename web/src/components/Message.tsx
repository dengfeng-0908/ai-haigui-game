import type { TMessage, TMessageChannel } from "../types";

type TMessageProps = {
  message: TMessage;
  currentPlayerName?: string;
  isHighlighted?: boolean;
  onToggleHighlight?: (message: TMessage) => void;
};

type TAssistantTone = "yes" | "no" | "irrelevant" | "unknown";

function normalizeContent(content: string) {
  return content
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[。！？!?，,；;：:、]/g, "")
    .toLowerCase();
}

function detectAssistantTone(content: string): TAssistantTone {
  const normalized = normalizeContent(content);

  if (
    /^(是|对|正确|没错|可以|行|能|yes|yep|yeah|true|ok|okay)$/.test(normalized) ||
    normalized.startsWith("是的") ||
    normalized.startsWith("对的") ||
    normalized.startsWith("没错")
  ) {
    return "yes";
  }

  if (
    /^(否|不|不是|错误|不对|no|nope|false)$/.test(normalized) ||
    normalized.startsWith("不是") ||
    normalized.startsWith("不对")
  ) {
    return "no";
  }

  if (
    /^(无关|irrelevant|偏题|跑题|与题目无关|不相关)$/.test(normalized) ||
    normalized.includes("无关") ||
    normalized.includes("不相关")
  ) {
    return "irrelevant";
  }

  return "unknown";
}

function getAssistantToneMeta(tone: TAssistantTone) {
  switch (tone) {
    case "yes":
      return {
        badge: "是",
        badgeClassName: "bg-emerald-400 text-slate-950 shadow-emerald-400/20",
        borderClassName: "border-emerald-500/35",
        accentClassName: "bg-emerald-400/10",
        labelClassName: "text-emerald-300/90",
        avatarClassName: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25",
      };
    case "no":
      return {
        badge: "否",
        badgeClassName: "bg-rose-400 text-slate-950 shadow-rose-400/20",
        borderClassName: "border-rose-500/35",
        accentClassName: "bg-rose-400/10",
        labelClassName: "text-rose-300/90",
        avatarClassName: "bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/25",
      };
    case "irrelevant":
      return {
        badge: "无关",
        badgeClassName: "bg-amber-300 text-slate-950 shadow-amber-300/20",
        borderClassName: "border-amber-400/35",
        accentClassName: "bg-amber-300/10",
        labelClassName: "text-amber-200/90",
        avatarClassName: "bg-amber-300/15 text-amber-100 ring-1 ring-amber-300/25",
      };
    default:
      return {
        badge: "AI",
        badgeClassName: "bg-sky-500/15 text-sky-200 shadow-sky-500/10",
        borderClassName: "border-slate-800",
        accentClassName: "bg-sky-400/10",
        labelClassName: "text-sky-300/80",
        avatarClassName: "bg-sky-500/20 text-sky-300",
      };
  }
}

function getChannelBadgeMeta(channel: TMessageChannel) {
  if (channel === "discussion") {
    return {
      label: "讨论",
      className: "border border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
    };
  }

  return {
    label: "提问",
    className: "border border-amber-300/25 bg-amber-300/10 text-amber-100",
  };
}

export function Message({
  message,
  currentPlayerName,
  isHighlighted = false,
  onToggleHighlight,
}: TMessageProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-xs text-slate-300 shadow-lg shadow-slate-950/30">
          {message.content}
        </div>
      </div>
    );
  }

  const isAssistant = message.role === "assistant";
  const channel = message.channel ?? "host";
  const isOwnUser =
    message.role === "user" &&
    (!currentPlayerName || !message.playerName || message.playerName === currentPlayerName);
  const isOtherUser = message.role === "user" && !isOwnUser;
  const isDiscussion = message.role === "user" && channel === "discussion";
  const assistantTone = isAssistant ? detectAssistantTone(message.content) : "unknown";
  const assistantToneMeta = getAssistantToneMeta(assistantTone);
  const channelBadgeMeta = getChannelBadgeMeta(channel);

  const alignment = isOwnUser ? "justify-end" : "justify-start";
  const avatarClassName = isOwnUser
    ? isDiscussion
      ? "bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/30"
      : "bg-amber-400 text-slate-950"
    : isAssistant
      ? assistantToneMeta.avatarClassName
      : isDiscussion
        ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/20"
        : "bg-emerald-500/15 text-emerald-300";
  const bubbleClassName = isOwnUser
    ? isDiscussion
      ? "rounded-tr-sm border border-cyan-400/30 bg-cyan-400/10 text-cyan-50"
      : "rounded-tr-sm bg-amber-400 text-slate-950"
    : isAssistant
      ? `rounded-tl-sm border ${assistantToneMeta.borderClassName} bg-slate-900 text-slate-100`
      : isDiscussion
        ? "rounded-tl-sm border border-cyan-500/20 bg-cyan-500/5 text-slate-100"
        : "rounded-tl-sm border border-emerald-500/20 bg-emerald-500/5 text-slate-100";
  const label = isAssistant ? "AI 主持" : isOtherUser ? message.playerName || "队友" : "你";
  const avatarText = isAssistant ? "AI" : isDiscussion ? "聊" : isOtherUser ? "友" : "你";
  const labelClassName = isOwnUser
    ? isDiscussion
      ? "text-cyan-100/80"
      : "text-slate-900/70"
    : isAssistant
      ? assistantToneMeta.labelClassName
      : isDiscussion
        ? "text-cyan-200/80"
        : "text-emerald-300/80";

  return (
    <div className={`flex ${alignment}`}>
      <div className={`flex max-w-[90%] gap-3 ${isOwnUser ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${avatarClassName}`}
        >
          {avatarText}
        </div>
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg shadow-slate-950/25 ${
            bubbleClassName
          } ${isAssistant ? "overflow-hidden" : ""}`}
        >
          {isAssistant ? (
            <div className={`absolute inset-x-0 top-0 h-1 ${assistantToneMeta.accentClassName}`} />
          ) : null}
          <div className="mb-2 flex items-start justify-between gap-3">
            <div
              className={`flex flex-wrap items-center gap-2 ${
                isOwnUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${labelClassName}`}
              >
                {label}
              </div>
              {isAssistant ? (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none tracking-[0.14em] ${assistantToneMeta.badgeClassName}`}
                >
                  {assistantToneMeta.badge}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none tracking-[0.14em] ${channelBadgeMeta.className}`}
                >
                  {channelBadgeMeta.label}
                </span>
              )}
            </div>
            {onToggleHighlight ? (
              <button
                type="button"
                onClick={() => onToggleHighlight(message)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  isHighlighted
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                    : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-amber-400/30 hover:text-amber-100"
                }`}
              >
                {isHighlighted ? "已标记" : "标记"}
              </button>
            ) : null}
          </div>
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>
      </div>
    </div>
  );
}
