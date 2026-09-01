import { useState, useEffect } from "react";
import { useTranslations } from "@/i18n/utils";
import "@/styles/QuizCard.css";

export interface QuestionItem {
    question: string;
    choices: string[];
    answer: string;
    explanation?: string;
}

interface QuizProps {
    title?: string;
    locale?: string;
    questions: QuestionItem[];
}

interface PreparedQuestion extends QuestionItem {
    shuffledChoices: string[];
}

export default function QuizCard({ title, locale, questions }: QuizProps) {
    const [currentLocale, setCurrentLocale] = useState(locale || "en");

    useEffect(() => {
        if (!locale && typeof document !== "undefined") {
            const htmlLang = document.documentElement.lang;
            const pathLang = window.location.pathname.split("/")[1];
            setCurrentLocale(htmlLang || pathLang || "en");
        }
    }, [locale]);

    const { t } = useTranslations(currentLocale);
    const displayTitle = title || t("quiz.defaultTitle");

    const [preparedQuestions, setPreparedQuestions] = useState<
        PreparedQuestion[]
    >([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<
        Record<number, string>
    >({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        resetQuiz();
    }, [questions]);

    const resetQuiz = () => {
        const randomized = questions.map((q) => ({
            ...q,
            shuffledChoices: [...q.choices].sort(() => Math.random() - 0.5),
        }));
        setPreparedQuestions(randomized);
        setSelectedAnswers({});
        setCurrentIndex(0);
        setSubmitted(false);
    };

    const handleSelectChoice = (choice: string) => {
        // Guard: Prevent modifying choices after submission
        if (submitted) return;

        setSelectedAnswers((prev) => ({
            ...prev,
            [currentIndex]: choice,
        }));
    };

    const handleNext = () => {
        if (currentIndex < preparedQuestions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (Object.keys(selectedAnswers).length < preparedQuestions.length) {
            alert(t("quiz.incompleteAlert"));
            return;
        }
        setSubmitted(true);
        setCurrentIndex(0);
    };

    const calculateScore = () => {
        return preparedQuestions.reduce((score, q, idx) => {
            return selectedAnswers[idx] === q.answer ? score + 1 : score;
        }, 0);
    };

    if (!preparedQuestions.length) return null;

    const currentQ = preparedQuestions[currentIndex];
    const selectedChoice = selectedAnswers[currentIndex];
    const isAllAnswered =
        Object.keys(selectedAnswers).length === preparedQuestions.length;
    const isLast = currentIndex === preparedQuestions.length - 1;
    const isFirst = currentIndex === 0;
    const score = calculateScore();

    return (
        <div className="quiz-card" aria-label={displayTitle}>
            {/* Header */}
            <header className="quiz-header">
                <div className="quiz-header-start">
                    <span className="quiz-tag">{displayTitle}</span>
                </div>
                <div className="quiz-header-end">
                    {submitted && (
                        <span className="quiz-score-pill">
                            <span className="score-label">
                                {t("quiz.score")}:
                            </span>{" "}
                            <strong className="numeric-fraction" dir="ltr">
                                {score}/{preparedQuestions.length}
                            </strong>
                        </span>
                    )}
                    <span className="quiz-counter" dir="ltr">
                        <span>{currentIndex + 1}</span>
                        <span className="quiz-counter-divider">/</span>
                        <span>{preparedQuestions.length}</span>
                    </span>
                </div>
            </header>

            {/* Pagination Progress Dots */}
            <div
                className="quiz-progress-dots"
                role="tablist"
                aria-label={t("quiz.defaultTitle")}
            >
                {preparedQuestions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const hasAnswer = selectedAnswers[idx] !== undefined;
                    const isCorrect = selectedAnswers[idx] === q.answer;

                    let dotClass = "quiz-dot";
                    if (isCurrent) dotClass += " is-current";
                    if (hasAnswer) dotClass += " is-filled";
                    if (submitted) {
                        dotClass += isCorrect
                            ? " is-correct-dot"
                            : " is-wrong-dot";
                    }

                    return (
                        <button
                            key={idx}
                            type="button"
                            className={dotClass}
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`${t("quiz.question")} ${idx + 1}`}
                            aria-current={isCurrent ? "step" : undefined}
                        />
                    );
                })}
            </div>

            {/* Active Question Body */}
            <div className="quiz-body">
                <div className="quiz-question-container">
                    <div className="quiz-question-heading-row">
                        <h4 className="quiz-question-title">
                            {currentQ.question}
                        </h4>
                        {submitted && (
                            <span
                                className={`status-badge-inline ${selectedChoice === currentQ.answer ? "correct" : "wrong"}`}
                            >
                                {selectedChoice === currentQ.answer
                                    ? `✓ ${t("quiz.correct")}`
                                    : `✕ ${t("quiz.wrong")}`}
                            </span>
                        )}
                    </div>

                    <div className="quiz-choices-grid">
                        {currentQ.shuffledChoices.map((choice, cIndex) => {
                            const isSelected = selectedChoice === choice;
                            let choiceClass = "quiz-choice-btn";

                            if (isSelected) choiceClass += " is-selected";

                            if (submitted) {
                                if (choice === currentQ.answer) {
                                    choiceClass += " is-correct";
                                } else if (
                                    isSelected &&
                                    choice !== currentQ.answer
                                ) {
                                    choiceClass += " is-wrong";
                                }
                            }

                            return (
                                <button
                                    key={cIndex}
                                    type="button"
                                    disabled={submitted}
                                    onClick={() => handleSelectChoice(choice)}
                                    className={choiceClass}
                                >
                                    <span
                                        className="choice-indicator"
                                        aria-hidden="true"
                                    />
                                    <span className="choice-text">
                                        {choice}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {submitted && currentQ.explanation && (
                        <div
                            className={`quiz-explanation ${selectedChoice === currentQ.answer ? "is-correct" : "is-wrong"}`}
                        >
                            <strong>
                                {selectedChoice === currentQ.answer
                                    ? `✓ ${t("quiz.explanation")}: `
                                    : `✕ ${t("quiz.explanation")}: `}
                            </strong>
                            {currentQ.explanation}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <footer className="quiz-footer">
                <div className="quiz-nav-row">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={isFirst}
                        className="quiz-arrow-btn"
                        aria-label={t("quiz.back")}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="nav-arrow-icon prev"
                            aria-hidden="true"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        <span className="btn-label-text">{t("quiz.back")}</span>
                    </button>

                    {/* Center Action */}
                    <div className="quiz-center-actions">
                        {!submitted ? (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isAllAnswered}
                                className="quiz-btn quiz-submit-btn"
                            >
                                {t("quiz.checkAnswers")}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={resetQuiz}
                                className="quiz-btn quiz-retry-btn"
                            >
                                {t("quiz.resetRetry")}
                            </button>
                        )}
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={isLast}
                        className={`quiz-arrow-btn ${!isLast && !submitted ? "primary" : ""}`}
                        aria-label={t("quiz.next")}
                    >
                        <span className="btn-label-text">{t("quiz.next")}</span>
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="nav-arrow-icon next"
                            aria-hidden="true"
                        >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
}
