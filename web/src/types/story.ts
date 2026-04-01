export type TDifficulty = "easy" | "medium" | "hard";

export type TStoryPreview = {
  id: string;
  title: string;
  difficulty: TDifficulty;
  tags: string[];
  surface: string;
};

export type TStoryReveal = TStoryPreview & {
  bottom: string;
  hints: string[];
  keyFacts: string[];
};
