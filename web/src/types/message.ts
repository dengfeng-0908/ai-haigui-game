export type TMessageRole = "user" | "assistant" | "system";
export type TMessageChannel = "host" | "discussion";

export type TMessage = {
  id: string;
  role: TMessageRole;
  content: string;
  timestamp: number;
  playerName?: string;
  channel?: TMessageChannel;
};

export type THighlightedClue = {
  id: string;
  messageId: string;
  content: string;
  sourceRole: Exclude<TMessageRole, "system">;
  channel: TMessageChannel;
  playerName?: string;
  pinnedByName?: string;
  timestamp: number;
};
