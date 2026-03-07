import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    FaClock, FaChevronLeft, FaChevronRight, FaCheckCircle,
    FaTimesCircle, FaTrophy, FaExclamationTriangle
} from 'react-icons/fa';
import { useUser } from '../../shared/UserContext';

import '../../styles/Takeassessment.css';

/* ─── Injected styles — mirrors AcademicAI.css structure ─── */


/* ── Logo — same structure as AcademicAI's Logo component ── */
function Logo() {
    return (
        <span className="ta-logo">
            <span className="ta-logo__bracket">[</span>
            <span className="ta-logo__text">cs</span>
            <span className="ta-logo__dot">.</span>
            <span className="ta-logo__text">assess</span>
            <span className="ta-logo__bracket">]</span>
        </span>
    );
}

export default function TakeAssessment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useUser();

    // ── State (unchanged) ──
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });

    // ── Fetch (unchanged) ──
    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/assessments/${id}`);
                setAssessment(res.data);
                setTimeLeft(res.data.duration * 60);
            } catch (err) {
                console.error("Fetch assessment error:", err);
                setError("Failed to load assessment. It might have been deleted.");
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [id]);

    // ── Timer (unchanged) ──
    useEffect(() => {
        if (loading || isSubmitted || !timeLeft) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, isSubmitted, timeLeft]);

    // ── Keyboard nav (unchanged) ──
    const handleKeyDown = useCallback((e) => {
        if (isSubmitted || loading || !assessment) return;
        if (e.key === 'ArrowLeft') {
            setCurrentIdx(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
            const total = assessment.questions.length;
            if (currentIdx < total - 1 && answers[currentIdx] !== undefined)
                setCurrentIdx(prev => Math.min(total - 1, prev + 1));
        }
    }, [isSubmitted, loading, assessment, currentIdx, answers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // ── Helpers (unchanged) ──
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionIdx) => {
        setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    };

    const handleSubmit = async () => {
        if (!assessment) return;
        if (timeLeft > 0 && !window.confirm("Are you sure you want to submit your assessment?")) return;
        try {
            const formattedAnswers = Object.entries(answers).map(([idx, optionIdx]) => ({
                questionIdx: parseInt(idx),
                selectedOption: optionIdx
            }));
            const res = await api.post(`/assessments/${id}/submit`, { answers: formattedAnswers });
            const resultData = res.data;
            setScore({
                correct: resultData.answers.filter(a => a.isCorrect).length,
                total: resultData.totalQuestions,
                percentage: resultData.percentage,
                resultId: resultData._id
            });
            setIsSubmitted(true);
            if (refreshUser) refreshUser();
        } catch (err) {
            console.error("Submit error:", err);
            alert("Failed to submit assessment. Please try again.");
        }
    };

    /* ─── LOADING ─── */
    if (loading) {
        return (
            <>
                <div className="ta-loading">
                    <div className="ta-spinner" />
                    <p className="ta-loading__text">Loading Assessment...</p>
                </div>
            </>
        );
    }

    /* ─── ERROR ─── */
    if (error) {
        return (
            <>
                <div className="ta-error">
                    <div className="ta-error__box">
                        <div className="ta-error__icon"><FaExclamationTriangle /></div>
                        <h2>Something went wrong</h2>
                        <p>{error}</p>
                        {/* original button layout preserved exactly */}
                        <button
                            onClick={() => navigate('/assessments')}
                            className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                        >
                            Back to Assessments
                        </button>
                    </div>
                </div>
            </>
        );
    }

    /* ─── RESULT ─── */
    if (isSubmitted) {
        return (
            <>
                <div className="ta-result">
                    <div className="ta-result__card">
                        <div className="ta-result__banner" />
                        <div className="ta-result__body">

                            <div className="ta-result__trophy">🏆</div>
                            <h1>Assessment Complete!</h1>
                            <p>Great performance. Here's your final breakdown summary:</p>

                            {/* original grid layout preserved */}
                            <div className="ta-result__grid">
                                <div className="ta-result__stat">
                                    <div className="ta-result__stat-label">Total Score</div>
                                    <div className="ta-result__stat-val">
                                        {score.correct}<small>/</small>{score.total}
                                    </div>
                                </div>
                                <div className="ta-result__stat">
                                    <div className="ta-result__stat-label">Percentage</div>
                                    <div className="ta-result__stat-val ta-result__stat-val--teal">
                                        {score.percentage}<small>%</small>
                                    </div>
                                </div>
                            </div>

                            {/* original mini cards layout preserved */}
                            <div className="ta-result__mini">
                                <div className="ta-result__mini-card ta-result__mini-card--correct">
                                    <span className="ta-result__mini-icon"><FaCheckCircle /></span>
                                    <span className="ta-result__mini-label">Correct</span>
                                    <span className="ta-result__mini-val">{score.correct}</span>
                                </div>
                                <div className="ta-result__mini-card ta-result__mini-card--wrong">
                                    <span className="ta-result__mini-icon"><FaTimesCircle /></span>
                                    <span className="ta-result__mini-label">Incorrect</span>
                                    <span className="ta-result__mini-val">{score.total - score.correct}</span>
                                </div>
                            </div>

                            {/* original button layout + sizes preserved exactly */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate(`/assessment/review/${score.resultId}`)}
                                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold text-base hover:bg-green-700 active:scale-[0.97] transition-all shadow-xl shadow-green-900/10"
                                >
                                    Review Answers
                                </button>
                                <button
                                    onClick={() => navigate('/assessments')}
                                    className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-base hover:bg-gray-800 active:scale-[0.97] transition-all shadow-xl shadow-black/10"
                                >
                                    Return to Assessments
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ─── QUIZ VIEW ─── */
    const currentQuestion = assessment.questions[currentIdx];
    const totalQuestions = assessment.questions.length;
    const progress = ((currentIdx + 1) / totalQuestions) * 100;
    const diffClass = {
        easy: 'ta-diff--easy',
        medium: 'ta-diff--medium',
        hard: 'ta-diff--hard',
    }[assessment.difficulty] ?? 'ta-diff--medium';

    return (
        <>
            <div className="ta-root">

                {/* mesh bg — same blobs as AcademicAI */}
                <div className="ta-bg">
                    <div className="ta-bg__blob-teal" />
                    <div className="ta-bg__blob-pink" />
                    <div className="ta-bg__blob-sage" />
                    <div className="ta-bg__blob-accent" />
                </div>
                <div className="ta-grid" />

                {/* ── HEADER ── */}
                <header className="ta-header">
                    <div className="ta-header__inner">

                        <div className="ta-header__left">
                            <Logo />
                            <span className="ta-header__sep" />
                            <span className="ta-header__title">{assessment.title}</span>
                            <span className={`ta-diff ${diffClass}`}>{assessment.difficulty}</span>
                        </div>

                        <div className="ta-header__center">
                            <div className="ta-qcount">
                                <span className="ta-qcount__cur">{currentIdx + 1}</span>
                                <span className="ta-qcount__sep">/</span>
                                <span className="ta-qcount__tot">{totalQuestions}</span>
                            </div>
                        </div>

                        <div className="ta-header__right">
                            <div className={`ta-timer${timeLeft < 120 ? ' ta-timer--warn' : ''}`}>
                                <FaClock className={timeLeft < 120 ? "animate-pulse" : ""} />
                                <span className="font-mono">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                    </div>
                    {/* progress bar */}
                    <div className="ta-prog">
                        <div className="ta-prog__fill" style={{ width: `${progress}%` }} />
                    </div>
                </header>

                {/* ── QUESTION DOTS ── */}
                <div className="ta-dots">
                    {assessment.questions.map((_, i) => (
                        <div
                            key={i}
                            className={`ta-dot${i === currentIdx ? ' ta-dot--current' : answers[i] !== undefined ? ' ta-dot--answered' : ''}`}
                            onClick={() => setCurrentIdx(i)}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* ── QUESTION AREA ── */}
                <main className="ta-main">
                    <div className="ta-qwrap" key={currentIdx}>

                        <div className="ta-eyebrow">
                            <div className="ta-eyebrow__line" />
                            <span className="ta-eyebrow__text">Current Question</span>
                        </div>

                        <div className="ta-qtext">{currentQuestion.questionText}</div>

                        <div className="ta-options">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`ta-option${answers[currentIdx] === idx ? ' ta-option--sel' : ''}`}
                                >
                                    <div className="ta-option__bar" />
                                    <div className="ta-option__letter">{String.fromCharCode(65 + idx)}</div>
                                    <span className="ta-option__text">{option}</span>
                                </button>
                            ))}
                        </div>

                    </div>
                </main>

                {/* ── FOOTER — original button sizes/padding preserved exactly ── */}
                <footer className="ta-footer">
                    <div className="ta-footer__inner">

                        <button
                            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentIdx === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-0 transition-all font-bold text-[11px] uppercase tracking-widest"
                        >
                            <FaChevronLeft className="text-[9px]" /> Previous
                        </button>

                        {currentIdx === totalQuestions - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={answers[currentIdx] === undefined}
                                className="group flex items-center gap-3 px-10 py-3.5 rounded-2xl bg-black text-white font-black hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                <span className="text-[13px]">Analyze & Finish</span>
                                <div className="w-6 h-6 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-all duration-500">
                                    <FaCheckCircle className="text-white text-[10px]" />
                                </div>
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                                disabled={answers[currentIdx] === undefined}
                                className="group flex items-center gap-3 px-10 py-3.5 rounded-2xl bg-[#1dc962] text-white font-black hover:bg-[#18a952] active:scale-95 transition-all shadow-xl shadow-green-200/40 disabled:opacity-50 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                <span className="text-[13px]">Proceed Next</span>
                                <FaChevronRight className="text-[11px] group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                    </div>
                </footer>

            </div>
        </>
    );
}