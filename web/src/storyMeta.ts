import type { TDifficulty } from "./types";

export const DIFFICULTY_LABEL: Record<TDifficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export const DIFFICULTY_STYLES: Record<TDifficulty, string> = {
  easy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  medium: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  hard: "border-rose-500/25 bg-rose-500/10 text-rose-300",
};
