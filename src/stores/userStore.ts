// src/stores/userStore.ts
import { map } from "nanostores";
import type { UserProgressData, UserSession } from "./types";

const LOCAL_STORAGE_KEY = "user_data";

const DEFAULT_DATA: UserProgressData = {
    version: 1,
    updatedAt: Date.now(),
    theme: "dark",
    fontSize: "base",
    completedItems: [], // Stores: ["python:lessons:01-intro", "python:challenges:01-fizzbuzz"]
    codeDrafts: {},
};

// 1. Load initial data from localStorage synchronously (Browser only)
function loadInitialData(): UserProgressData {
    if (typeof window === "undefined") return DEFAULT_DATA;
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return DEFAULT_DATA;
        return { ...DEFAULT_DATA, ...JSON.parse(raw) };
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

// ==========================================
// Public Store Actions (Used by UI)
// ==========================================

export function setTheme(theme: "dark" | "light") {
    commitChanges((data) => {
        data.theme = theme;
    });
}

export function toggleTheme() {
    const current = userDataStore.get().theme;
    setTheme(current === "dark" ? "light" : "dark");
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
    // Strip any leading locale if present (e.g. "ar/01-variables" -> "01-variables")
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
        }
    });
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

// ==========================================
// Future Migration & Backend Sync Logic
// ==========================================

let syncTimeout: number | undefined;

function queueCloudSync() {
    if (typeof window === "undefined") return;
    window.clearTimeout(syncTimeout);
    // Debounce API calls by 1.5 seconds so rapid clicks don't spam the server
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

    // Merge logic: Combine completed items (Union Set) and resolve newest edits
    const mergedCompleted = Array.from(
        new Set([...localData.completedItems, ...remoteData.completedItems]),
    );
    const mergedDrafts = { ...remoteData.codeDrafts, ...localData.codeDrafts };

    const mergedData: UserProgressData = {
        version: Math.max(localData.version, remoteData.version),
        updatedAt: Date.now(),
        theme: localData.theme || remoteData.theme,
        fontSize: localData.fontSize || remoteData.fontSize,
        completedItems: mergedCompleted,
        codeDrafts: mergedDrafts,
    };

    // Update store and save locally
    userDataStore.set(mergedData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));

    // Sync the merged result back to your server
    await pushToCloud();
}
