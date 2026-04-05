import { getStoryById, toStoryPreview, type TStoryPreview } from "../data/stories.js";

export type TMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  playerName?: string;
  channel?: "host" | "discussion";
};

export type THighlightedClue = {
  id: string;
  messageId: string;
  content: string;
  sourceRole: "user" | "assistant";
  channel: "host" | "discussion";
  playerName?: string;
  pinnedByName?: string;
  timestamp: number;
};

export type TRoomPlayer = {
  id: string;
  name: string;
};

export type TFinalProposal = {
  guess: string;
  proposerId: string;
  proposerName: string;
  approvals: string[];
  requiredApprovals: number;
  updatedAt: number;
};

export type TRoom = {
  id: string;
  storyId: string;
  story: TStoryPreview;
  players: TRoomPlayer[];
  messages: TMessage[];
  hintUsedCount: number;
  confirmedFacts: string[];
  highlightedClues: THighlightedClue[];
  invalidQuestionCount: number;
  finalProposal: TFinalProposal | null;
  status: "playing" | "finished";
  isProcessing: boolean;
};

const rooms = new Map<string, TRoom>();

export function createRoom(storyId: string) {
  const story = getStoryById(storyId);
  if (!story) {
    throw new Error("故事不存在");
  }

  const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const room: TRoom = {
    id: roomId,
    storyId,
    story: toStoryPreview(story),
    players: [],
    messages: [],
    hintUsedCount: 0,
    confirmedFacts: [],
    highlightedClues: [],
    invalidQuestionCount: 0,
    finalProposal: null,
    status: "playing",
    isProcessing: false,
  };

  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId: string) {
  return rooms.get(roomId);
}

export function addPlayer(roomId: string, player: TRoomPlayer) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  if (!room.players.some((item) => item.id === player.id)) {
    room.players.push(player);
  }

  return room;
}

export function removePlayer(roomId: string, playerId: string) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.players = room.players.filter((player) => player.id !== playerId);
  if (room.finalProposal) {
    room.finalProposal.approvals = room.finalProposal.approvals.filter((id) => id !== playerId);
    room.finalProposal.requiredApprovals = getRequiredApprovalCount(room.players.length);
    if (room.finalProposal.proposerId === playerId) {
      room.finalProposal = null;
    }
  }
  if (room.players.length === 0 && room.status === "finished") {
    rooms.delete(roomId);
  }

  return room;
}

export function pushMessage(roomId: string, message: TMessage) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.messages.push(message);
  return room;
}

export function getRequiredApprovalCount(playerCount: number) {
  return Math.max(1, Math.floor(playerCount / 2) + 1);
}

export function incrementHint(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.hintUsedCount += 1;
  return room;
}

export function updateFacts(roomId: string, facts: string[]) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.confirmedFacts = Array.from(new Set([...room.confirmedFacts, ...facts]));
  return room;
}

export function toggleHighlightedClue(roomId: string, clue: THighlightedClue) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  const alreadyHighlighted = room.highlightedClues.some(
    (item) => item.messageId === clue.messageId,
  );

  room.highlightedClues = alreadyHighlighted
    ? room.highlightedClues.filter((item) => item.messageId !== clue.messageId)
    : [clue, ...room.highlightedClues].slice(0, 8);

  return room;
}

export function setInvalidQuestionCount(roomId: string, count: number) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.invalidQuestionCount = count;
  return room;
}

export function setFinalProposal(
  roomId: string,
  proposal: Omit<TFinalProposal, "requiredApprovals">,
) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.finalProposal = {
    ...proposal,
    requiredApprovals: getRequiredApprovalCount(room.players.length),
  };
  return room;
}

export function approveFinalProposal(roomId: string, playerId: string) {
  const room = rooms.get(roomId);
  if (!room || !room.finalProposal) {
    return null;
  }

  if (!room.finalProposal.approvals.includes(playerId)) {
    room.finalProposal.approvals.push(playerId);
  }
  room.finalProposal.requiredApprovals = getRequiredApprovalCount(room.players.length);
  return room;
}

export function clearFinalProposal(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.finalProposal = null;
  return room;
}

export function setRoomProcessing(roomId: string, value: boolean) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.isProcessing = value;
  return room;
}

export function finishRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.status = "finished";
  room.isProcessing = false;
  room.finalProposal = null;
  return room;
}
