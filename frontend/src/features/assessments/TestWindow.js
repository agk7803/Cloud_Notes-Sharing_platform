import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheck, FaTimes, FaFlag, FaChevronRight, FaChevronLeft, FaSave, FaTrophy } from 'react-icons/fa';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import '../../styles/TestWindow.css';

const MOCK_QUESTIONS = {
    'mock-1': [
        { id: 1, type: 'mcq', text: 'Which of the following spaces is NOT a vector space?', options: ['The set of all polynomials.', 'The set of all continuous functions.', 'The set of all 2x2 matrices.', 'Set of solutions to Ax=b where b!=0.'], correct: 3 },
        { id: 2, type: 'mcq', text: 'If A is invertible, det(A^-1) is?', options: ['det(A)', '1/det(A)', '-det(A)', '1'], correct: 1 },
    ],
    'mock-2': [
        { id: 1, type: 'mcq', text: 'What is Backpropagation?', options: ['Forward pass', 'Error correction algorithm', 'Activation function', 'None'], correct: 1 },
    ]
};

const DEFAULT_QUESTIONS = [
    { id: 1, type: 'mcq', text: 'Sample Question 1 (Generated)', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0 },
    { id: 2, type: 'mcq', text: 'Sample Question 2 (Generated)', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 1 },
    { id: 3, type: 'mcq', text: 'Sample Question 3 (Generated)', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 2 },
];

export default function TestWindow() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(3600);
    const [isSaving, setIsSaving] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [testMetadata, setTestMetadata] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [scoreResult, setScoreResult] = useState({ score: 0, total: 0 });

    // ── all logic unchanged ──
    useEffect(() => {
        const loadTest = async () => {
            if (testId.startsWith('mock-')) {
                setQuestions(MOCK_QUESTIONS[testId] || DEFAULT_QUESTIONS);
                setTestMetadata({ title: 'Mock Test', subject: 'General' });
            } else {
                try {
                    const docRef = doc(db, 'assessments', testId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setTestMetadata(data);
                        setQuestions(DEFAULT_QUESTIONS);
                        setTimeLeft(data.duration * 60);
                    }
                } catch (e) {
                    console.error("Error loading test", e);
                }
            }
        };
        loadTest();
    }, [testId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswer = (val) => {
        setIsSaving(true);
        setAnswers(prev => ({ ...prev, [currentQuestionIdx]: val }));
        setTimeout(() => setIsSaving(false), 500);
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit?")) return;

        let score = 0;
        questions.forEach((q, idx) => {
            if (q.type === 'mcq' && answers[idx] === q.correct) score += 10;
            if (q.type === 'descriptive' && answers[idx]) score += 5;
        });

        const totalPotential = questions.length * 10;
        setScoreResult({ score, total: totalPotential });

        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    totalScore: increment(score),
                    [`subjectScores.${testMetadata?.subject || 'Other'}`]: increment(score)
                });
            } catch (e) {
                console.error("Error updating score", e);
            }
        }

        setShowResult(true);
    };

    /* ── RESULT SCREEN ── */
    if (showResult) {
        return (
            <div className="tw-result">
                <div className="tw-result__blob-teal" />
                <div className="tw-result__blob-pink" />
                <div className="tw-result__card">
                    <div className="tw-result__banner" />
                    <div className="tw-result__body">
                        <div className="tw-result__trophy">🏆</div>
                        <h2 className="tw-result__title">Test Complete!</h2>
                        <p className="tw-result__sub">Great job completing the assessment.</p>
                        <div className="tw-result__score-box">
                            <div className="tw-result__score-label">Your Score</div>
                            <div className="tw-result__score-val">{scoreResult.score}</div>
                            <div className="tw-result__score-out">out of {scoreResult.total} points</div>
                        </div>
                        {/* original onClick preserved */}
                        <button className="tw-result__btn" onClick={() => navigate('/assessments')}>
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── LOADING ── */
    if (questions.length === 0) return (
        <div className="tw-loading">
            <div className="tw-spinner" />
            <span className="tw-loading__text">Loading Test...</span>
        </div>
    );

    const currentQuestion = questions[currentQuestionIdx];

    return (
        <div className="tw-root">

            {/* mesh bg */}
            <div className="tw-bg">
                <div className="tw-bg__blob-teal" />
                <div className="tw-bg__blob-pink" />
                <div className="tw-bg__blob-sage" />
            </div>
            <div className="tw-grid" />

            {/* ── HEADER ── */}
            <header className="tw-header">
                <div className="tw-header__left">
                    <div className="tw-logo">
                        <span className="tw-logo__bracket">[</span>
                        <span className="tw-logo__text">cs</span>
                        <span className="tw-logo__dot">.</span>
                        <span className="tw-logo__text">test</span>
                        <span className="tw-logo__bracket">]</span>
                    </div>
                    <span className="tw-header__sep" />
                    <span className="tw-header__title">{testMetadata?.title || 'Assessment'}</span>
                    {testMetadata?.subject && (
                        <span className="tw-subject-chip">{testMetadata.subject}</span>
                    )}
                </div>

                <div className="tw-header__right">
                    <div className={`tw-timer${timeLeft < 300 ? ' tw-timer--warn' : ''}`}>
                        <FaClock className={timeLeft < 300 ? "animate-pulse" : ""} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    {/* original onClick preserved */}
                    <button className="tw-btn-exit" onClick={() => navigate('/assessments')}>Exit</button>
                    <button className="tw-btn-submit" onClick={handleSubmit}>Submit Test</button>
                </div>
            </header>

            {/* ── BODY ── */}
            <div className="tw-body">

                {/* ── QUESTION CARD ── */}
                <main className="tw-main">
                    <div className="tw-qcard">

                        {/* meta row */}
                        <div className="tw-qcard__meta">
                            <span className="tw-qcard__counter">
                                Question {currentQuestionIdx + 1} of {questions.length}
                            </span>
                            <button className="tw-flag-btn"><FaFlag /></button>
                        </div>

                        {/* question text */}
                        <div className="tw-qtext">{currentQuestion.text}</div>

                        {/* answers */}
                        <div style={{ flex: 1 }}>
                            {currentQuestion.type === 'mcq' ? (
                                <div className="tw-options">
                                    {currentQuestion.options.map((option, idx) => (
                                        <label
                                            key={idx}
                                            className={`tw-option${answers[currentQuestionIdx] === idx ? ' tw-option--selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestion.id}`}
                                                checked={answers[currentQuestionIdx] === idx}
                                                onChange={() => handleAnswer(idx)}
                                            />
                                            <span className="tw-option__text">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="tw-textarea-wrap">
                                    <textarea
                                        className="tw-textarea"
                                        placeholder="Type your answer here..."
                                        value={answers[currentQuestionIdx] || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                    />
                                    <div className={`tw-save-indicator${isSaving ? ' tw-save-indicator--saving' : ' tw-save-indicator--saved'}`}>
                                        {isSaving
                                            ? <><FaSave className="animate-bounce" /> Saving...</>
                                            : <><FaCheck /> Saved</>
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* footer nav — original button sizes preserved */}
                        <div className="tw-qcard__footer">
                            <button
                                className="tw-btn-prev"
                                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIdx === 0}
                            >
                                <FaChevronLeft /> Previous
                            </button>
                            <button
                                className="tw-btn-next"
                                onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestionIdx === questions.length - 1}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </main>

                {/* ── SIDEBAR ── */}
                <aside className="tw-sidebar">
                    <div className="tw-sidebar__title">Question Navigator</div>

                    <div className="tw-nav-grid">
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                className={`tw-nav-dot${idx === currentQuestionIdx ? ' tw-nav-dot--current' : answers[idx] !== undefined ? ' tw-nav-dot--answered' : ''}`}
                                onClick={() => setCurrentQuestionIdx(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="tw-instructions">
                        <div className="tw-instructions__title">Instructions</div>
                        <p className="tw-instructions__body">
                            Questions specific to <strong>{testMetadata?.subject}</strong>.
                            <br /><br />
                            Select the best answer for MCQ questions. Your progress is saved automatically.
                        </p>
                    </div>
                </aside>

            </div>
        </div>
    );
}