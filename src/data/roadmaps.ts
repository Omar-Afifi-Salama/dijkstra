export const roadmaps = {
    python: [
        "lessons/01-variables",
        "challenges/01-sum-two",
        "projects/01-calculator",
    ],
    javascript: [
        "lessons/01-variables",
        "challenges/01-sum-two",
        "projects/01-calculator",
    ],
    cpp: [
        "lessons/01-variables",
        "challenges/01-sum-two",
        "projects/01-calculator",
    ],
} as const;

export type Track = keyof typeof roadmaps;
export type ContentType = "lessons" | "challenges" | "projects";
