// src/stores/types.ts

export type ThemeMode = "dark" | "light" | "system";
export type FontSize = "sm" | "base" | "lg" | "xl";

export interface UserStreak {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // ISO format: "YYYY-MM-DD"
}

export interface UserProgressData {
    version: number;
    updatedAt: number;
    theme: ThemeMode;
    fontSize: FontSize;
    completedItems: string[]; // e.g. ["python:lessons:01-intro", "python:challenges:01-fizzbuzz"]
    bookmarks: string[]; // e.g. ["python:lessons:01-intro"]
    codeDrafts: Record<string, string>;
    streak: UserStreak;
    activityHistory: Record<string, number>; // Maps "YYYY-MM-DD" -> count of completed actions
}

export interface UserSession {
    isAuthenticated: boolean;
    userId: string | null;
    token: string | null;
}
