import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ChatBox } from "../components/ChatBox";
import { ConfirmedFacts } from "../components/ConfirmedFacts";
import { HintPanel } from "../components/HintPanel";
import {
  askStoryQuestion,
  getHint,
  getStory,
  submitGuess,
} from "../services/api";
import type { TMessage, TStoryPreview } from "../types";

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
        compactMessages,
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
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.55fr]">
        <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link to="/" className="text-sm text-slate-400 transition hover:text-slate-200">
                ← 返回大厅
              </Link>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-amber-300/70">单人模式</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-100">{story.title}</h1>
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
                    solved: false,
                    feedback: "你选择了放弃，本局直接揭晓汤底。",
                  },
                })
              }
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
            >
              放弃并揭晓
            </button>
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">汤面</p>
            <p className="mt-3 text-base leading-8 text-slate-200">{story.surface}</p>
          </div>
          <div className="mt-6 h-[640px]">
            <ChatBox
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              isSending={isSending}
            />
          </div>
        </section>

        <aside className="space-y-4">
          <HintPanel hintUsedCount={hintUsedCount} onRequestHint={handleHint} disabled={isSending} />
          <ConfirmedFacts facts={confirmedFacts} />
          <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">提交最终推理</p>
            <textarea
              value={guessValue}
              onChange={(event) => setGuessValue(event.target.value)}
              rows={5}
              placeholder="把你认为的完整真相写出来"
              className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleSubmitGuess}
              disabled={isSubmittingGuess}
              className="mt-3 w-full rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              {isSubmittingGuess ? "判定中..." : "提交最终推理"}
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
