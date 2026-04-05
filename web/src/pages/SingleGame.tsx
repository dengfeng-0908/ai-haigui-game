import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ChatBox } from "../components/ChatBox";
import { ConfirmedFacts } from "../components/ConfirmedFacts";
import { HighlightsPanel } from "../components/HighlightsPanel";
import { HintPanel } from "../components/HintPanel";
import {
  askStoryQuestion,
  getHint,
  getStory,
  submitGuess,
} from "../services/api";
import { DIFFICULTY_LABEL, DIFFICULTY_STYLES } from "../storyMeta";
import { getSingleGameGuide } from "../storyGuides";
import type { THighlightedClue, TMessage, TStoryPreview } from "../types";

function createMessage(
  role: TMessage["role"],
  content: string,
  playerName?: string,
): TMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
    playerName,
  };
}

export function SingleGame() {
  const { storyId = "" } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<TStoryPreview | null>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [confirmedFacts, setConfirmedFacts] = useState<string[]>([]);
  const [highlightedClues, setHighlightedClues] = useState<THighlightedClue[]>([]);
  const [hintUsedCount, setHintUsedCount] = useState(0);
  const [invalidQuestionCount, setInvalidQuestionCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [guessValue, setGuessValue] = useState("");
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getStory(storyId)
      .then(setStory)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "题目加载失败");
      })
      .finally(() => setIsLoading(false));
  }, [storyId]);

  const compactMessages = useMemo(
    () =>
      messages
        .filter(
          (message): message is TMessage & { role: "user" | "assistant" } =>
            message.role === "user" || message.role === "assistant",
        )
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    [messages],
  );
  const questionCount = useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages],
  );
  const answerCount = useMemo(
    () => messages.filter((message) => message.role === "assistant").length,
    [messages],
  );
  const guide = useMemo(() => getSingleGameGuide(storyId), [storyId]);

  function toggleHighlight(message: TMessage) {
    if (message.role === "system") {
      return;
    }

    const sourceRole = message.role;
    setHighlightedClues((current) => {
      const alreadyHighlighted = current.some((item) => item.messageId === message.id);
      if (alreadyHighlighted) {
        return current.filter((item) => item.messageId !== message.id);
      }

      return [
        {
          id: crypto.randomUUID(),
          messageId: message.id,
          content: message.content,
          sourceRole,
          channel: message.channel ?? "host",
          playerName: message.playerName,
          pinnedByName: "你",
          timestamp: Date.now(),
        },
        ...current,
      ].slice(0, 8);
    });
  }

  async function handleSend() {
    const question = inputValue.trim();
    if (!story || !question || isSending) {
      return;
    }

    setIsSending(true);
    setInputValue("");
    const nextMessages = [...messages, createMessage("user", question)];
    setMessages(nextMessages);

    try {
      const response = await askStoryQuestion(
        story.id,
        question,
        [...compactMessages, { role: "user", content: question }],
        invalidQuestionCount,
      );

      setMessages((current) => [
        ...current,
        createMessage("assistant", response.displayText),
      ]);
      setConfirmedFacts((current) =>
        Array.from(new Set([...current, ...response.confirmedFacts])),
      );
      setInvalidQuestionCount(response.invalidQuestionCount);
    } catch (sendError) {
      setMessages((current) => [
        ...current,
        createMessage(
          "system",
          sendError instanceof Error ? sendError.message : "AI 回复失败，请稍后再试",
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleHint() {
    if (!story || isSending) {
      return;
    }

    try {
      const response = await getHint(story.id, hintUsedCount);
      if (!response.hint) {
        setMessages((current) => [
          ...current,
          createMessage("system", "已经没有更多提示了，试着整理现有信息。"),
        ]);
        return;
      }

      setHintUsedCount(response.hintUsedCount);
      setMessages((current) => [
        ...current,
        createMessage("system", `提示 ${response.hintUsedCount}：${response.hint}`),
      ]);
    } catch (hintError) {
      setMessages((current) => [
        ...current,
        createMessage(
          "system",
          hintError instanceof Error ? hintError.message : "获取提示失败",
        ),
      ]);
    }
  }

  async function handleSubmitGuess() {
    const guess = guessValue.trim();
    if (!story || !guess || isSubmittingGuess) {
      return;
    }

    setIsSubmittingGuess(true);
    try {
      const response = await submitGuess(story.id, guess);
      if (response.solved) {
        navigate(`/result/${story.id}`, {
          state: {
            mode: "single",
            storyTitle: story.title,
              messages,
              hintUsedCount,
              highlightedClues,
              solved: true,
              feedback: response.feedback,
            },
        });
        return;
      }

      setMessages((current) => [
        ...current,
        createMessage("system", response.feedback),
      ]);
      setGuessValue("");
    } catch (submitError) {
      setMessages((current) => [
        ...current,
        createMessage(
          "system",
          submitError instanceof Error ? submitError.message : "提交推理失败",
        ),
      ]);
    } finally {
      setIsSubmittingGuess(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-slate-300">正在加载题目...</main>
    );
  }

  if (!story) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-rose-300">
        {error || "未找到对应题目"}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <section className="space-y-5">
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/25">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link to="/" className="text-sm text-slate-400 transition hover:text-slate-200">
                  ← 返回大厅
                </Link>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-amber-300/70">单人模式</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-100">{story.title}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${DIFFICULTY_STYLES[story.difficulty]}`}
                  >
                    {DIFFICULTY_LABEL[story.difficulty]}
                  </span>
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  先看汤面，再把每个问题问得更具体。目标是让“汤面 → 提问 → 回复 → 收集事实”形成稳定闭环。
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate(`/result/${story.id}`, {
                    state: {
                      mode: "single",
                      storyTitle: story.title,
                      messages,
                      hintUsedCount,
                      highlightedClues,
                      solved: false,
                      feedback: "你选择了放弃，本局直接揭晓汤底。",
                    },
                  })
                }
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
              >
                放弃并揭晓
              </button>
            </div>
            <div className="relative mt-6 overflow-hidden rounded-[24px] border border-amber-400/25 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.03)]">
              <div className="absolute inset-y-4 left-4 w-px bg-gradient-to-b from-transparent via-amber-300/70 to-transparent" />
              <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-300/75">核心汤面</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-50">先反复读题，再决定提问方向</h2>
                </div>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                  切入建议：{guide.title}
                </span>
              </div>
              <p className="relative mt-5 pl-6 text-xl font-semibold leading-10 text-slate-50 sm:text-[1.75rem]">
                {story.surface}
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">已提问题</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{questionCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI 回答</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{answerCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">已确认事实</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{confirmedFacts.length}</p>
              </div>
            </div>
          </section>
          <div className="min-h-[420px] sm:min-h-[560px]">
            <ChatBox
              title="推理记录"
              description="优先追问人物状态、时间差和导致结果的关键动作。"
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              isSending={isSending}
              emptyState="从人物、时间、地点、动机里先挑一个方向，不要一开始就直接猜完整汤底。"
              composerLabel="发送给 AI 主持"
              composerHint="只问能被回答为“是 / 否 / 无关”的问题，先拆人物状态和关键动作，再判断完整真相。"
              sendLabel="发送问题"
              highlightedMessageIds={highlightedClues.map((item) => item.messageId)}
              onToggleHighlight={toggleHighlight}
            />
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">推理策略</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">{guide.title}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
          <HintPanel hintUsedCount={hintUsedCount} onRequestHint={handleHint} disabled={isSending} />
          <HighlightsPanel items={highlightedClues} />
          <ConfirmedFacts facts={confirmedFacts} />
          <section className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">提交最终推理</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              把核心事实和反转写完整。只要抓住主要真相，就能进入揭晓页。
            </p>
            <textarea
              value={guessValue}
              onChange={(event) => setGuessValue(event.target.value)}
              rows={5}
              placeholder="把你认为的完整真相写出来"
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleSubmitGuess}
              disabled={isSubmittingGuess}
              className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              {isSubmittingGuess ? "判定中..." : "提交最终推理"}
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
