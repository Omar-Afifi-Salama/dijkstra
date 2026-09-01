// src/components/user/UserNavStatus.tsx
import { useStore } from "@nanostores/react";
import { userDataStore } from "@/stores/userStore";

import "@/styles/UserNavStatus.css";

interface Props {
    locale: string;
    translations: {
        streak: string;
        bookmarks: string;
    };
}

export default function UserNavStatus({ locale, translations }: Props) {
    const user = useStore(userDataStore);
    const currentStreak = user?.streak?.currentStreak ?? 0;
    const bookmarkCount = user?.bookmarks?.length ?? 0;

    return (
        <div className="user-nav-status">
            {/* Streak Badge */}
            <a
                href={`/${locale}/profile`}
                className={`status-chip streak-chip ${currentStreak > 0 ? "is-active" : "is-idle"}`}
                title={`${currentStreak} ${translations.streak}`}
                aria-label={`${currentStreak} ${translations.streak}`}
            >
                <span className="status-icon" aria-hidden="true">
                    🔥
                </span>
                <span className="status-count">{currentStreak}</span>
            </a>

            {/* Bookmarks Badge */}
            <a
                href={`/${locale}/profile#bookmarks`}
                className={`status-chip bookmark-chip ${bookmarkCount > 0 ? "is-active" : "is-idle"}`}
                title={`${bookmarkCount} ${translations.bookmarks}`}
                aria-label={`${bookmarkCount} ${translations.bookmarks}`}
            >
                <span className="status-icon" aria-hidden="true">
                    🔖
                </span>
                <span className="status-count">{bookmarkCount}</span>
            </a>
        </div>
    );
}
