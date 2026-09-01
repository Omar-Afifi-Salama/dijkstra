// src/components/user/UserDashboard.tsx
import React from "react";
import { useStore } from "@nanostores/react";
import {
    userDataStore,
    resetUserData,
    toggleBookmark,
} from "@/stores/userStore";

import "@/styles/UserDashboard.css";

interface ContentSummary {
    title: string;
    description: string;
    track: string;
    type: string;
    slug: string;
}

interface Props {
    locale: string;
    catalog: Record<string, ContentSummary>;
    translations: {
        streakTitle: string;
        streakDays: string;
        longestStreak: string;
        completedTitle: string;
        completedSubtitle: string;
        bookmarksTitle: string;
        bookmarksSubtitle: string;
        noBookmarks: string;
        removeBookmark: string;
        resetTitle: string;
        resetDescription: string;
        resetButton: string;
        resetConfirm: string;
    };
}

export default function UserDashboard({
    locale,
    catalog,
    translations,
}: Props) {
    const user = useStore(userDataStore);

    const streak = user?.streak?.currentStreak ?? 0;
    const longestStreak = user?.streak?.longestStreak ?? 0;
    const completedCount = user?.completedItems?.length ?? 0;
    const bookmarks = user?.bookmarks ?? [];

    const handleReset = () => {
        if (window.confirm(translations.resetConfirm)) {
            resetUserData();
        }
    };

    return (
        <section className="dashboard-layout" aria-label="Learning Metrics">
            {/* Metric Cards Grid */}
            <div className="metrics-grid">
                {/* Streak Metric */}
                <article className="metric-card metric-streak">
                    <header className="metric-header">
                        <span className="metric-label">
                            {translations.streakTitle}
                        </span>
                        <span className="metric-icon" aria-hidden="true">
                            🔥
                        </span>
                    </header>
                    <div className="metric-value">
                        <span className="metric-number">{streak}</span>
                        <span className="metric-unit">
                            {translations.streakDays}
                        </span>
                    </div>
                    <footer className="metric-footer">
                        {translations.longestStreak}:{" "}
                        <strong>
                            {longestStreak} {translations.streakDays}
                        </strong>
                    </footer>
                </article>

                {/* Completed Metric */}
                <article className="metric-card metric-completed">
                    <header className="metric-header">
                        <span className="metric-label">
                            {translations.completedTitle}
                        </span>
                        <span className="metric-icon" aria-hidden="true">
                            ✓
                        </span>
                    </header>
                    <div className="metric-value">
                        <span className="metric-number">{completedCount}</span>
                    </div>
                    <footer className="metric-footer">
                        {translations.completedSubtitle}
                    </footer>
                </article>

                {/* Bookmarks Metric */}
                <article className="metric-card metric-bookmarks">
                    <header className="metric-header">
                        <span className="metric-label">
                            {translations.bookmarksTitle}
                        </span>
                        <span className="metric-icon" aria-hidden="true">
                            🔖
                        </span>
                    </header>
                    <div className="metric-value">
                        <span className="metric-number">
                            {bookmarks.length}
                        </span>
                    </div>
                    <footer className="metric-footer">
                        {translations.bookmarksSubtitle}
                    </footer>
                </article>
            </div>

            {/* Bookmarked Items Section */}
            <section className="dashboard-section" id="bookmarks">
                <header className="section-header">
                    <h2 className="section-heading">
                        {translations.bookmarksTitle}
                    </h2>
                    <span className="badge-pill">{bookmarks.length}</span>
                </header>

                {bookmarks.length === 0 ? (
                    <p className="empty-notice">{translations.noBookmarks}</p>
                ) : (
                    <div className="bookmarks-grid">
                        {bookmarks.map((key) => {
                            const item = catalog[key];
                            const [rawTrack, rawType, ...rawSlugParts] =
                                key.split(":");
                            const fallbackSlug = rawSlugParts.join(":");

                            const track = item?.track || rawTrack;
                            const type = item?.type || rawType;
                            const slug = item?.slug || fallbackSlug;
                            const title = item?.title || fallbackSlug;
                            const description = item?.description || "";
                            const isCompleted =
                                user.completedItems.includes(key);

                            const href = `/${locale}/${track}/${type}/${slug}`;

                            return (
                                <div key={key} className="bookmark-card">
                                    <div className="bookmark-meta">
                                        <span className="track-badge">
                                            {track}
                                        </span>
                                        <span className="type-badge">
                                            {type}
                                        </span>
                                        {isCompleted && (
                                            <span
                                                className="completed-indicator"
                                                title="Completed"
                                            >
                                                ✓
                                            </span>
                                        )}
                                    </div>

                                    <a
                                        href={href}
                                        className="bookmark-title-link"
                                    >
                                        <h3>{title}</h3>
                                    </a>

                                    {description && (
                                        <p className="bookmark-desc">
                                            {description}
                                        </p>
                                    )}

                                    <div className="bookmark-footer">
                                        <a
                                            href={href}
                                            className="bookmark-open-btn"
                                        >
                                            Open →
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => toggleBookmark(key)}
                                            className="bookmark-remove-btn"
                                            title={translations.removeBookmark}
                                            aria-label={
                                                translations.removeBookmark
                                            }
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Danger Zone / Reset */}
            <section className="dashboard-section danger-zone">
                <div className="danger-info">
                    <h3 className="danger-title">{translations.resetTitle}</h3>
                    <p className="danger-text">
                        {translations.resetDescription}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    className="btn-danger"
                >
                    {translations.resetButton}
                </button>
            </section>
        </section>
    );
}
