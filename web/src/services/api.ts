import type {
  TAskResponse,
  THintResponse,
  TRoomSnapshot,
  TStoryPreview,
  TStoryReveal,
  TSubmitResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<TData>(path: string, init?: RequestInit): Promise<TData> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "请求失败");
  }

  return response.json() as Promise<TData>;
}

export async function getStories(): Promise<TStoryPreview[]> {
  return request<TStoryPreview[]>("/stories");
}

export async function getStory(storyId: string): Promise<TStoryPreview> {
  return request<TStoryPreview>(`/stories/${storyId}`);
}

export async function askStoryQuestion(
  storyId: string,
  question: string,
  messages: { role: "user" | "assistant"; content: string }[],
  invalidQuestionCount: number,
): Promise<TAskResponse> {
  return request<TAskResponse>("/game/ask", {
    method: "POST",
    body: JSON.stringify({
      storyId,
      question,
      messages,
      invalidQuestionCount,
    }),
  });
}

export async function getHint(
  storyId: string,
  hintUsedCount: number,
): Promise<THintResponse> {
  return request<THintResponse>("/game/hint", {
    method: "POST",
    body: JSON.stringify({
      storyId,
      hintUsedCount,
    }),
  });
}

export async function submitGuess(
  storyId: string,
  guess: string,
): Promise<TSubmitResponse> {
  return request<TSubmitResponse>("/game/submit", {
    method: "POST",
    body: JSON.stringify({
      storyId,
      guess,
    }),
  });
}

export async function revealStory(storyId: string): Promise<TStoryReveal> {
  return request<TStoryReveal>("/game/reveal", {
    method: "POST",
    body: JSON.stringify({
      storyId,
    }),
  });
}

export async function createRoom(storyId: string): Promise<{ roomId: string }> {
  return request<{ roomId: string }>("/rooms", {
    method: "POST",
    body: JSON.stringify({ storyId }),
  });
}

export async function getRoom(roomId: string): Promise<TRoomSnapshot> {
  return request<TRoomSnapshot>(`/rooms/${roomId}`);
}
