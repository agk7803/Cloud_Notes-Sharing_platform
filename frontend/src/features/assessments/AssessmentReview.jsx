import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/AssessmentReview.css';

export default function AssessmentReview() {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── logic unchanged ──
    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await api.get(`/assessments/results/${resultId}`);
                setResult(res.data);
            } catch (err) {
                console.error("Fetch result error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [resultId]);

    if (loading) return (
        <div className="ar-loading">
            <div className="ar-spinner" />
            <span className="ar-loading__text">Loading Review...</span>
        </div>
    );

    if (!result) return (
        <div className="ar-error">Result not found.</div>
    );

    const { assessmentId: assessment, answers, score, totalQuestions, percentage } = result;

    return (
        <div className="ar-root">

            {/* mesh background — same as AcademicAI */}
            <div className="ar-bg">
                <div className="ar-bg__blob-teal" />
                <div className="ar-bg__blob-pink" />
                <div className="ar-bg__blob-sage" />
            </div>
            <div className="ar-grid" />

            <div className="ar-wrap">



                {/* back button — same original onClick */}
                <button className="ar-back" onClick={() => navigate('/assessments')}>
                    <FaChevronLeft /> Back to Assessments
                </button>

                {/* header card */}
                <div className="ar-header-card">
                    <div>
                        <div className="ar-eyebrow">Performance Review</div>
                        <h1 className="ar-header-title">
                            {assessment.title?.replace(/^(?:WRITTEN|MCQ)\s*-\s*/i, '')}
                        </h1>
                        <p className="ar-header-meta">
                            <strong>{assessment.subject}</strong> &nbsp;·&nbsp; {assessment.difficulty}
                        </p>
                    </div>
                    <div className="ar-score-chips">
                        <div className="ar-score-chip ar-score-chip--score">
                            <span className="ar-score-chip__label">Score</span>
                            <span className="ar-score-chip__val">{score}</span>
                        </div>
                        <div className="ar-score-chip ar-score-chip--accuracy">
                            <span className="ar-score-chip__label">Accuracy</span>
                            <span className="ar-score-chip__val">{percentage}%</span>
                        </div>
                    </div>
                </div>

                {/* question cards */}
                {assessment.questions.map((q, idx) => {
                    const userAns = answers.find(a => a.questionIdx === idx);
                    // Strictly check boolean so undefined/null becomes false
                    const isCorrect = !!userAns?.isCorrect;
                    const isSkipped = userAns == null || userAns.selectedOption == null;

                    return (
                        <div
                            key={idx}
                            className={`ar-card${isCorrect ? ' ar-card--correct' : ' ar-card--wrong'}`}
                        >
                            <div className="ar-card__inner">

                                {/* top row */}
                                <div className="ar-card__top">
                                    <span className="ar-card__q-label">Question {idx + 1} {isSkipped && "(Skipped)"}</span>
                                    {isCorrect ? (
                                        <span className="ar-mark ar-mark--correct">
                                            <FaCheck /> +10 Marks
                                        </span>
                                    ) : (
                                        <span className="ar-mark ar-mark--wrong">
                                            <FaTimes /> 0 Marks
                                        </span>
                                    )}
                                </div>

                                {/* question text */}
                                <div className="ar-question-text">{q.questionText}</div>

                                {/* options / answers */}
                                {assessment.type === 'mcq' ? (
                                    <div className="ar-options">
                                        {q.options.map((option, oIdx) => {
                                            const isSelected = !isSkipped && userAns?.selectedOption === oIdx;
                                            const isRightAns = option === q.correctAnswer;

                                            let cls = 'ar-option ar-option--default';
                                            if (isSelected && isCorrect) cls = 'ar-option ar-option--correct-selected';
                                            else if (isSelected && !isCorrect) cls = 'ar-option ar-option--wrong-selected';
                                            else if (isRightAns) cls = 'ar-option ar-option--correct-answer';

                                            return (
                                                <div key={oIdx} className={cls}>
                                                    <span>{option}</span>
                                                    <span className="ar-option__right">
                                                        {isSelected && isCorrect && <FaCheck />}
                                                        {isSelected && !isCorrect && <FaTimes />}
                                                        {isRightAns && !isSelected && 'Correct Answer'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="ar-subjective">
                                        <div className="ar-sub-box ar-sub-box--user">
                                            <div className="ar-sub-label">Your Response</div>
                                            <div className="ar-sub-text">{userAns?.answerText || <span className="italic opacity-50">No answer provided</span>}</div>
                                        </div>
                                        <div className="ar-sub-box ar-sub-box--model">
                                            <div className="ar-sub-label">Model Answer</div>
                                            <div className="ar-sub-text">{q.correctAnswer}</div>
                                        </div>
                                    </div>
                                )}

                                {/* explanation */}
                                {q.explanation && (
                                    <div className="ar-explanation">
                                        <div className="ar-explanation__label">
                                            <FaExclamationCircle /> Explanation
                                        </div>
                                        <p className="ar-explanation__text">{q.explanation}</p>
                                        {q.referencePage && (
                                            <span className="ar-explanation__ref">
                                                Refer to page: {q.referencePage}
                                            </span>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    );
                })}

            </div>
        </div >
    );
}