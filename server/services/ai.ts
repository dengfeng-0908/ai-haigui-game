import type { TStory } from "../data/stories.js";
import { buildHostSystemPrompt, buildJudgeSystemPrompt } from "../prompts/hostPrompt.js";

export type THostAnswer = {
  answer: "yes" | "no" | "irrelevant";
  displayText: string;
  confirmedFacts: string[];
  invalidQuestionCount: number;
};

export type TSubmitResult = {
  solved: boolean;
  feedback: string;
};

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

function extractJsonObject<TValue>(content: string): TValue | null {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]) as TValue;
  } catch {
    return null;
  }
}

function normalizeAnswer(answer: string | undefined): "yes" | "no" | "irrelevant" {
  if (answer === "yes") {
    return "yes";
  }
  if (answer === "no") {
    return "no";
  }
  return "irrelevant";
}

function defaultDisplayText(answer: "yes" | "no" | "irrelevant") {
  if (answer === "yes") {
    return "是";
  }
  if (answer === "no") {
    return "否";
  }
  return "无关";
}

function normalizePlainText(text: string) {
  return text.replace(/[\s，。！？、；：“”"'`()（）,.!?;:_-]/g, "");
}

function normalizeConfirmedFacts(story: TStory, facts: string[] | undefined) {
  if (!Array.isArray(facts)) {
    return [];
  }

  const matchedFacts = new Set<string>();

  for (const fact of facts) {
    if (!fact?.trim()) {
      continue;
    }

    const normalizedFact = normalizePlainText(fact);
    const matched = story.keyFacts.find((keyFact) => {
      const normalizedKeyFact = normalizePlainText(keyFact);

      return (
        normalizedFact.includes(normalizedKeyFact) ||
        normalizedKeyFact.includes(normalizedFact)
      );
    });

    if (matched) {
      matchedFacts.add(matched);
    }
  }

  return Array.from(matchedFacts).slice(0, 3);
}

function shouldShowSafeNudge(nextInvalidQuestionCount: number) {
  return nextInvalidQuestionCount >= 2;
}

function buildIrrelevantDisplayText(story: TStory, nextInvalidQuestionCount: number) {
  if (!shouldShowSafeNudge(nextInvalidQuestionCount)) {
    return "无关";
  }

  if (nextInvalidQuestionCount === 2) {
    return "无关。换个方向再试试。";
  }

  const hintIndex = Math.min(nextInvalidQuestionCount - 3, story.hints.length - 1);
  const safeHint = story.hints[hintIndex];

  if (!safeHint) {
    return "无关。换个方向再试试。";
  }

  return `无关。换个方向试试：${safeHint}`;
}

async function requestDeepSeek(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("服务器未配置 DEEPSEEK_API_KEY，请先在 server/.env 中设置。");
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.1,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "DeepSeek 请求失败");
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return json.choices?.[0]?.message?.content || "";
}

export async function askStoryQuestion(input: {
  story: TStory;
  question: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  invalidQuestionCount: number;
}): Promise<THostAnswer> {
  const content = await requestDeepSeek([
    {
      role: "system",
      content: buildHostSystemPrompt(input.story),
    },
    ...input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    {
      role: "user",
      content: `玩家问题：${input.question}\n当前连续无效提问次数：${input.invalidQuestionCount}`,
    },
  ]);

  const parsed = extractJsonObject<{
    answer?: string;
    displayText?: string;
    confirmedFacts?: string[];
    shouldNudge?: boolean;
  }>(content);

  const answer = normalizeAnswer(parsed?.answer);
  const nextInvalidQuestionCount =
    answer === "irrelevant" ? input.invalidQuestionCount + 1 : 0;
  const confirmedFacts =
    answer === "irrelevant"
      ? []
      : normalizeConfirmedFacts(input.story, parsed?.confirmedFacts);
  const shouldNudge =
    answer === "irrelevant" &&
    (Boolean(parsed?.shouldNudge) || shouldShowSafeNudge(nextInvalidQuestionCount));
  let displayText = defaultDisplayText(answer);

  if (answer === "irrelevant") {
    displayText = shouldNudge
      ? buildIrrelevantDisplayText(input.story, nextInvalidQuestionCount)
      : "无关";
  }

  return {
    answer,
    displayText,
    confirmedFacts,
    invalidQuestionCount: nextInvalidQuestionCount,
  };
}

export async function submitFinalGuess(input: {
  story: TStory;
  guess: string;
}): Promise<TSubmitResult> {
  const content = await requestDeepSeek([
    {
      role: "system",
      content: buildJudgeSystemPrompt(input.story),
    },
    {
      role: "user",
      content: `玩家提交的最终推理：${input.guess}`,
    },
  ]);

  const parsed = extractJsonObject<{
    solved?: boolean;
    feedback?: string;
  }>(content);

  return {
    solved: Boolean(parsed?.solved),
    feedback:
      parsed?.feedback?.trim() ||
      (parsed?.solved ? "你已经抓住了主要事实，可以揭晓汤底了。" : "还原得还不够完整，可以继续提问。"),
  };
}
