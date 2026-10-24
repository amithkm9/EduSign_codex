import lessons from "./lsf-catalog.json";
export type LsfLesson = (typeof lessons)[number];
export const LSF_LESSONS = lessons;
export const getLsfLesson = (id: string) =>
  lessons.find((lesson) => lesson.id === id);
export const youtubeUrl = (lesson: LsfLesson) =>
  `https://www.youtube.com/watch?v=${lesson.youtubeId}`;
export const LESSON_TINTS: Record<string, string> = {
  peach: "bg-[#ffe1ce]",
  yellow: "bg-[#fff0b5]",
  pink: "bg-[#f7dbea]",
  blue: "bg-[#dceaff]",
  mint: "bg-[#d9efdf]",
};
