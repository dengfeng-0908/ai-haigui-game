import type { TMessage } from "./message";
import type { TStoryPreview } from "./story";

export type TAskResponse = {
  answer: "yes" | "no" | "irrelevant";
  displayText: string;
  confirmedFacts: string[];
  invalidQuestionCount: number;
  shouldNudge?: boolean;
};

export type THintResponse = {
  hint: string | null;
  hintUsedCount: number;
  remaining: number;
};

export type TSubmitResponse = {
  solved: boolean;
  feedback: string;
};

export type TResultNavigationState = {
  mode: "single" | "multi";
  storyTitle?: string;
  messages: TMessage[];
  hintUsedCount: number;
  solved: boolean;
  feedback?: string;
  playerCount?: number;
};

export type TRoomPlayer = {
  id: string;
  name: string;
};

export type TRoomSnapshot = {
  id: string;
  story: TStoryPreview;
  players: TRoomPlayer[];
  messages: TMessage[];
  hintUsedCount: number;
  confirmedFacts: string[];
  invalidQuestionCount: number;
  status: "playing" | "finished";
  isProcessing: boolean;
};
