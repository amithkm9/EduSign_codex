export const AGE_GROUPS = ["1-4", "5-10", "15+"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];
export const CATEGORY_META: Record<
  AgeGroup,
  { title: string; description: string; emoji: string; difficulty: string }
> = {
  "1-4": {
    title: "Découvrir ensemble",
    description: "Les premiers mots à explorer avec un proche.",
    emoji: "🌱",
    difficulty: "Découverte",
  },
  "5-10": {
    title: "Les petits explorateurs",
    description: "Des lettres, des nombres et la vie à l’école.",
    emoji: "🎒",
    difficulty: "Débutant",
  },
  "15+": {
    title: "Les échanges du quotidien",
    description:
      "Observer les expressions et relier les signes aux situations.",
    emoji: "💬",
    difficulty: "Pour aller plus loin",
  },
};
export const isAgeGroup = (value: string): value is AgeGroup =>
  (AGE_GROUPS as readonly string[]).includes(value);
