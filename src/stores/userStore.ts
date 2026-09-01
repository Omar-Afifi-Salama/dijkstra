// src/stores/userStore.ts
import { map } from "nanostores";
import type {
    UserProgressData,
    UserSession,
    FontSize,
    ThemeMode,
} from "./types";

const LOCAL_STORAGE_KEY = "user_data";

export const DEFAULT_DATA: UserProgressData = {
    version: 1,
    updatedAt: Date.now(),
    theme: "dark",
    fontSize: "base",
    completedItems: [],
    bookmarks: [],
    codeDrafts: {},
    streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: "",
    },
    activityHistory: {},
};

// Date Helpers
function getTodayString(): string {
    return new Date().toISOString().split("T")[0];
}

function getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
}

// 1. Load initial data from localStorage synchronously (Browser only)
function loadInitialData(): UserProgressData {
    if (typeof window === "undefined") return DEFAULT_DATA;
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return DEFAULT_DATA;

        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_DATA,
            ...parsed,
            streak: { ...DEFAULT_DATA.streak, ...(parsed.streak || {}) },
            activityHistory: {
                ...DEFAULT_DATA.activityHistory,
                ...(parsed.activityHistory || {}),
            },
            bookmarks: parsed.bookmarks || [],
        };
    } catch (err) {
        console.error("Failed to load local user data:", err);
        return DEFAULT_DATA;
    }
}

// 2. The Active In-Memory Store
export const userDataStore = map<UserProgressData>(loadInitialData());

// 3. User Session State
export const sessionStore = map<UserSession>({
    isAuthenticated: false,
    userId: null,
    token: null,
});

// 4. Persistence Pipeline (Saves locally + Triggers Cloud Sync)
function commitChanges(mutator: (draft: UserProgressData) => void) {
    const current = userDataStore.get();
    const next: UserProgressData = {
        ...current,
        updatedAt: Date.now(),
    };

    mutator(next);
    userDataStore.set(next);

    // Save locally
    if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    }

    // If logged in, queue background cloud sync
    if (sessionStore.get().isAuthenticated) {
        queueCloudSync();
    }
}

/**
 * Internal helper to update daily streaks and activity counter
 */
function applyActivityProgress(data: UserProgressData) {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastActive = data.streak.lastActiveDate;

    let currentStreak = data.streak.currentStreak;
    let longestStreak = data.streak.longestStreak;

    if (lastActive === today) {
        // Already active today, streak remains unchanged
    } else if (lastActive === yesterday) {
        currentStreak += 1;
    } else {
        currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
    }

    data.streak = {
        currentStreak,
        longestStreak,
        lastActiveDate: today,
    };

    data.activityHistory = {
        ...data.activityHistory,
        [today]: (data.activityHistory[today] || 0) + 1,
    };
}

// ==========================================
// Public Store Actions (Used by UI)
// ==========================================

export function setTheme(theme: ThemeMode) {
    commitChanges((data) => {
        data.theme = theme;
    });
}

export function toggleTheme() {
    const current = userDataStore.get().theme;
    setTheme(current === "dark" ? "light" : "dark");
}

export function setFontSize(fontSize: FontSize) {
    commitChanges((data) => {
        data.fontSize = fontSize;
    });
}

/**
 * Normalizes any entry ID to a language-agnostic canonical key.
 * Input: ('python', 'lessons', '01-variables') -> "python:lessons:01-variables"
 */
export function createItemKey(
    track: string,
    type: string,
    slug: string,
): string {
    const cleanSlug = slug.replace(/^(en|ar)\//, "");
    return `${track}:${type}:${cleanSlug}`;
}

export function toggleItemCompletion(itemKey: string) {
    commitChanges((data) => {
        const exists = data.completedItems.includes(itemKey);
        if (exists) {
            data.completedItems = data.completedItems.filter(
                (id) => id !== itemKey,
            );
        } else {
            data.completedItems = [...data.completedItems, itemKey];
            applyActivityProgress(data);
        }
    });
}

export function toggleBookmark(itemKey: string) {
    commitChanges((data) => {
        const bookmarks = data.bookmarks || [];
        const exists = bookmarks.includes(itemKey);
        if (exists) {
            data.bookmarks = bookmarks.filter((id) => id !== itemKey);
        } else {
            data.bookmarks = [...bookmarks, itemKey];
        }
    });
}

export function isItemBookmarked(itemKey: string): boolean {
    return (userDataStore.get().bookmarks || []).includes(itemKey);
}

export function saveCodeDraft(challengeId: string, code: string) {
    commitChanges((data) => {
        data.codeDrafts = { ...data.codeDrafts, [challengeId]: code };
    });
}

export function isItemCompleted(itemKey: string): boolean {
    return userDataStore.get().completedItems.includes(itemKey);
}

export function getTrackCompletedCount(track: string): number {
    const completed = userDataStore.get().completedItems || [];
    const prefix = `${track}:`;
    return completed.filter((key) => key.startsWith(prefix)).length;
}

export function getTrackCompletionPercentage(
    track: string,
    totalItems: number,
): number {
    if (!totalItems || totalItems === 0) return 0;
    const count = getTrackCompletedCount(track);
    return Math.min(100, Math.round((count / totalItems) * 100));
}

export function getTypeCompletedCount(track: string, type: string): number {
    const completed = userDataStore.get().completedItems || [];
    const prefix = `${track}:${type}:`;
    return completed.filter((key) => key.startsWith(prefix)).length;
}

export function getTypeCompletionPercentage(
    track: string,
    type: string,
    totalItems: number,
): number {
    if (!totalItems || totalItems === 0) return 0;
    const count = getTypeCompletedCount(track, type);
    return Math.min(100, Math.round((count / totalItems) * 100));
}

export function resetUserData() {
    commitChanges((data) => {
        Object.assign(data, DEFAULT_DATA, { updatedAt: Date.now() });
    });
}

// ==========================================
// Future Migration & Backend Sync Logic
// ==========================================

let syncTimeout: number | undefined;

function queueCloudSync() {
    if (typeof window === "undefined") return;
    window.clearTimeout(syncTimeout);
    syncTimeout = window.setTimeout(async () => {
        await pushToCloud();
    }, 1500);
}

async function pushToCloud() {
    const session = sessionStore.get();
    if (!session.isAuthenticated || !session.token) return;

    try {
        const payload = userDataStore.get();
        /*
    await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`
      },
      body: JSON.stringify(payload)
    });
    */
        console.log("[Sync] Synced local changes to cloud account");
    } catch (err) {
        console.error("[Sync Error] Failed to push local data to server:", err);
    }
}

/**
 * Call this immediately after a user logs in.
 * Merges local guest progress with existing account progress in the database.
 */
export async function handleUserLogin(
    remoteData: UserProgressData,
    token: string,
    userId: string,
) {
    sessionStore.set({ isAuthenticated: true, userId, token });

    const localData = userDataStore.get();

    // Merge Sets (Completed items & Bookmarks)
    const mergedCompleted = Array.from(
        new Set([
            ...localData.completedItems,
            ...(remoteData.completedItems || []),
        ]),
    );
    const mergedBookmarks = Array.from(
        new Set([
            ...(localData.bookmarks || []),
            ...(remoteData.bookmarks || []),
        ]),
    );
    const mergedDrafts = {
        ...(remoteData.codeDrafts || {}),
        ...(localData.codeDrafts || {}),
    };

    // Merge Activity History
    const mergedHistory: Record<string, number> = {
        ...(remoteData.activityHistory || {}),
    };
    for (const [dateKey, count] of Object.entries(
        localData.activityHistory || {},
    )) {
        mergedHistory[dateKey] = Math.max(mergedHistory[dateKey] || 0, count);
    }

    // Merge Streaks (Take the best metrics)
    const longestStreak = Math.max(
        localData.streak?.longestStreak || 0,
        remoteData.streak?.longestStreak || 0,
    );
    const currentStreak = Math.max(
        localData.streak?.currentStreak || 0,
        remoteData.streak?.currentStreak || 0,
    );
    const lastActiveDate =
        (localData.streak?.lastActiveDate || "") >
        (remoteData.streak?.lastActiveDate || "")
            ? localData.streak?.lastActiveDate || ""
            : remoteData.streak?.lastActiveDate || "";

    const mergedData: UserProgressData = {
        version: Math.max(localData.version, remoteData.version),
        updatedAt: Date.now(),
        theme: localData.theme || remoteData.theme,
        fontSize: localData.fontSize || remoteData.fontSize,
        completedItems: mergedCompleted,
        bookmarks: mergedBookmarks,
        codeDrafts: mergedDrafts,
        streak: {
            currentStreak,
            longestStreak,
            lastActiveDate,
        },
        activityHistory: mergedHistory,
    };

    // Update store and save locally
    userDataStore.set(mergedData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));

    // Sync merged result back to backend
    await pushToCloud();
}
