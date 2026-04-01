import { getStoryById, toStoryPreview, type TStoryPreview } from "../data/stories.js";

export type TMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  playerName?: string;
};

export type TRoomPlayer = {
  id: string;
  name: string;
};

export type TRoom = {
  id: string;
  storyId: string;
  story: TStoryPreview;
  players: TRoomPlayer[];
  messages: TMessage[];
  hintUsedCount: number;
  confirmedFacts: string[];
  invalidQuestionCount: number;
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
    invalidQuestionCount: 0,
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

export function setInvalidQuestionCount(roomId: string, count: number) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }

  room.invalidQuestionCount = count;
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
  return room;
}
