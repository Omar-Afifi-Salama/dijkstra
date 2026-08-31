// src/stores/types.ts

export interface UserProgressData {
    version: number;
    updatedAt: number; // Timestamp for conflict resolution / Last-Write-Wins
    theme: "dark" | "light";
    fontSize: "sm" | "base" | "lg";
    // Set of completed item slugs (e.g. 'python:lessons:01-intro')
    completedItems: string[];
    // Key-value store for challenge code drafts: { [challengeId]: "def solution()..." }
    codeDrafts: Record<string, string>;
}

export interface UserSession {
    isAuthenticated: boolean;
    userId: string | null;
    token: string | null;
}
