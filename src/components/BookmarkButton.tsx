// src/components/curriculum/BookmarkButton.tsx
import { useStore } from "@nanostores/react";
import { userDataStore, toggleBookmark } from "@/stores/userStore";

interface Props {
    itemKey: string;
    labels: {
        bookmark: string;
        bookmarked: string;
    };
}

export default function BookmarkButton({ itemKey, labels }: Props) {
    const user = useStore(userDataStore);
    const isBookmarked = (user?.bookmarks || []).includes(itemKey);

    return (
        <button
            type="button"
            onClick={() => toggleBookmark(itemKey)}
            className={`header-bookmark-btn ${isBookmarked ? "is-bookmarked" : ""}`}
            title={isBookmarked ? labels.bookmarked : labels.bookmark}
            aria-label={isBookmarked ? labels.bookmarked : labels.bookmark}
            aria-pressed={isBookmarked}
        >
            <svg
                className="bookmark-svg"
                viewBox="0 0 24 24"
                width="15"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill={isBookmarked ? "currentColor" : "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>{isBookmarked ? labels.bookmarked : labels.bookmark}</span>
        </button>
    );
}
