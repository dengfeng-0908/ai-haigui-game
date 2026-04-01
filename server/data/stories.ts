export type TDifficulty = "easy" | "medium" | "hard";

export type TStory = {
  id: string;
  title: string;
  difficulty: TDifficulty;
  tags: string[];
  surface: string;
  bottom: string;
  keyFacts: string[];
  hints: string[];
};

export type TStoryPreview = Pick<
  TStory,
  "id" | "title" | "difficulty" | "tags" | "surface"
>;

export const STORIES: TStory[] = [
  {
    id: "S001",
    title: "深夜公交",
    difficulty: "easy",
    tags: ["日常", "反转"],
    surface: "最后一班公交上只剩下一名乘客。司机靠站后回头看见他，立刻报警了。",
    bottom:
      "这名乘客其实已经死亡，司机回头时发现他的脖子上还插着刀。因为夜色太暗，前面一路都没看清。",
    keyFacts: ["乘客已死亡", "司机之前没看清", "报警是因为发现尸体", "不是司机杀人"],
    hints: ["先确认乘客当时是不是活着。", "司机为什么会突然改变判断？", "关键在司机回头后看到的新信息。"],
  },
  {
    id: "S002",
    title: "电梯按钮",
    difficulty: "medium",
    tags: ["生活", "细节"],
    surface: "男人每天都坐电梯到 12 楼，只有下雨天他才会按到 20 楼。",
    bottom:
      "他身材矮，平时只能按到 12 楼，再走楼梯上去。下雨天他带伞，可以用伞按到 20 楼。",
    keyFacts: ["男人身材矮", "目标楼层是 20 楼", "平时够不到按钮", "雨天带伞是关键"],
    hints: ["问题不在天气本身。", "他平时和雨天的差别是什么？", "差别来自他手里多了一样东西。"],
  },
  {
    id: "S003",
    title: "冰块中的声音",
    difficulty: "medium",
    tags: ["悬疑", "空间"],
    surface: "女人把录音机放进冰箱冷冻层，一周后再拿出来播放，成功证明自己清白。",
    bottom:
      "她被怀疑在案发时和受害人通话。其实那段录音是提前录好的。她故意把录音机冻住，让磁带结冰停止转动，之后再解冻继续播放，制造出通话发生在案发后的假象。最终警方通过冰箱温度记录发现了真相，她也因此证明案发时自己不在现场。",
    keyFacts: ["录音不是实时通话", "冰冻让播放停止", "时间线是关键", "女人不在案发现场"],
    hints: ["重点不是声音内容，而是声音出现的时间。", "她如何让录音‘暂停’很多天？", "冷冻环境改变了播放时间线。"],
  },
  {
    id: "S004",
    title: "病房里的花",
    difficulty: "hard",
    tags: ["悬疑", "心理"],
    surface: "病人醒来看到床头的花后立刻要求转院，医生却因此确认他装病。",
    bottom:
      "那束花是医院假期统一发的塑料花，正常住院已久的病人早就知道这一点。这个人却表现得像第一次见真花一样，说明他根本没在病房住那么久，是为了骗保临时装病。",
    keyFacts: ["花是假花", "老病人都知道", "病人反应异常", "说明他没长期住院"],
    hints: ["重点不是花好不好看。", "为什么只有真正住过院的人会知道某件事？", "病人的反应暴露了他对环境不熟。"],
  },
  {
    id: "S005",
    title: "海边脚印",
    difficulty: "easy",
    tags: ["推理", "场景"],
    surface: "警察在海边只看到一串脚印朝海里延伸，却断定不是自杀。",
    bottom:
      "脚印是倒着走出来的。凶手先从海里上岸，再倒退着回到海里，制造出受害人自己走进海中的假象。",
    keyFacts: ["脚印方向是伪装", "凶手倒退行走", "不是受害人自己入海", "现场被伪造"],
    hints: ["脚印本身是真的，但方向信息是假的。", "人一定是往前走留下脚印吗？", "有人故意倒退着走。"],
  },
  {
    id: "S006",
    title: "停电的公寓",
    difficulty: "hard",
    tags: ["推理", "时间线"],
    surface: "整栋公寓停电后，男人反而确认自己被偷了，而且立刻知道小偷不是邻居。",
    bottom:
      "他家装了会自动开启的应急灯，但停电后应急灯没亮，说明它早就被人拆走了。只有真正进过他家的小偷才知道应急灯位置，邻居只知道停电，不会专门偷那个东西。",
    keyFacts: ["应急灯本该自动亮", "它没亮说明已被拆走", "小偷事先进过屋", "邻居只知道停电但不知道灯位置"],
    hints: ["先想停电后本来应该发生什么。", "缺失的不是现金，而是一件应急设备。", "知道设备位置的人范围很小。"],
  },
];

export function getStoryById(storyId: string) {
  return STORIES.find((story) => story.id === storyId);
}

export function toStoryPreview(story: TStory): TStoryPreview {
  return {
    id: story.id,
    title: story.title,
    difficulty: story.difficulty,
    tags: story.tags,
    surface: story.surface,
  };
}
