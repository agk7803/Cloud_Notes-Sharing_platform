import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    FaClock, FaChevronLeft, FaChevronRight, FaCheckCircle,
    FaTimesCircle, FaTrophy, FaExclamationTriangle
} from 'react-icons/fa';

export default function TakeAssessment() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIdx: answerIndex }
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });

    // Fetch Assessment
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

    // Timer Logic
    useEffect(() => {
        if (loading || isSubmitted || !timeLeft) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, isSubmitted, timeLeft]);

    // Keyboard Navigation
    const handleKeyDown = useCallback((e) => {
        if (isSubmitted || loading || !assessment) return;

        if (e.key === 'ArrowLeft') {
            setCurrentIdx(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
            const total = assessment.questions.length;
            if (currentIdx < total - 1 && answers[currentIdx] !== undefined) {
                setCurrentIdx(prev => Math.min(total - 1, prev + 1));
            }
        }
    }, [isSubmitted, loading, assessment, currentIdx, answers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionIdx) => {
        setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    };

    const handleSubmit = () => {
        if (!assessment) return;

        // Optional confirmation
        if (timeLeft > 0 && !window.confirm("Are you sure you want to submit your assessment?")) return;

        const questions = assessment.questions || [];
        let correctCount = 0;

        questions.forEach((q, idx) => {
            const selectedAnswer = answers[idx];
            if (selectedAnswer !== undefined && q.options[selectedAnswer] === q.correctAnswer) {
                correctCount++;
            }
        });

        const total = questions.length;
        const percentage = Math.round((correctCount / total) * 100);

        setScore({ correct: correctCount, total, percentage });
        setIsSubmitted(true);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium text-sm tracking-tight">Loading Assessment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-6 opacity-80" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={() => navigate('/assessments')}
                        className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                    >
                        Back to Assessments
                    </button>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="fixed inset-0 bg-[#fbfbfb] z-[100] flex items-center justify-center p-6 overflow-y-auto">
                <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

                    <div className="p-8 md:p-12 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                            <FaTrophy className="text-green-500 text-2xl" />
                        </div>

                        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Assessment Complete!</h1>
                        <p className="text-gray-400 text-sm mb-8 px-4 leading-relaxed tracking-tight">Great performance. Here's your final breakdown summary:</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50/80 p-5 rounded-[1.5rem] border border-gray-100/50">
                                <span className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Total Score</span>
                                <span className="text-3xl font-black text-gray-900">{score.correct}<span className="text-base text-gray-300 mx-1">/</span>{score.total}</span>
                            </div>
                            <div className="bg-gray-50/80 p-5 rounded-[1.5rem] border border-gray-100/50">
                                <span className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Percentage</span>
                                <span className="text-3xl font-black text-blue-600">{score.percentage}<span className="text-base opacity-40">%</span></span>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-10">
                            <div className="flex-1 flex flex-col items-center p-4 bg-green-50/30 rounded-2xl border border-green-100/50">
                                <FaCheckCircle className="text-green-500/80 mb-1.5 text-lg" />
                                <span className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-0.5">Correct</span>
                                <span className="text-xl font-black text-green-800">{score.correct}</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center p-4 bg-red-50/30 rounded-2xl border border-red-100/50">
                                <FaTimesCircle className="text-red-500/80 mb-1.5 text-lg" />
                                <span className="text-[9px] font-black text-red-700 uppercase tracking-widest mb-0.5">Incorrect</span>
                                <span className="text-xl font-black text-red-800">{score.total - score.correct}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/assessments')}
                            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-base hover:bg-gray-800 active:scale-[0.97] transition-all shadow-xl shadow-black/10"
                        >
                            Return to Assessments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = assessment.questions[currentIdx];
    const totalQuestions = assessment.questions.length;
    const progress = ((currentIdx + 1) / totalQuestions) * 100;

    return (
        <div className="fixed inset-0 bg-[#fbfbfb] z-[100] flex flex-col h-screen font-sans overflow-hidden">
            {/* 🔝 Compact Professional Header */}
            <header className="bg-white z-20 flex-shrink-0 border-b border-gray-50">
                <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <h2 className="text-[12px] font-black text-gray-900 truncate max-w-xs tracking-tight uppercase opacity-80">
                            {assessment.title}
                        </h2>
                        <div className="h-3 w-px bg-gray-200"></div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${assessment.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                            assessment.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-600'
                            }`}>
                            {assessment.difficulty}
                        </span>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <div className="flex items-center gap-1 bg-gray-50/80 px-3 py-1 rounded-xl border border-gray-100">
                            <span className="text-[10px] font-black text-gray-900">{currentIdx + 1}</span>
                            <span className="text-[9px] font-bold text-gray-300">/</span>
                            <span className="text-[10px] font-black text-gray-400">{totalQuestions}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-6 flex-1">
                        <div className={`flex items-center gap-2 transition-all px-3 py-1 rounded-xl ${timeLeft < 120 ? 'bg-red-50 text-red-600' : 'text-gray-500'
                            }`}>
                            <FaClock className={`text-xs ${timeLeft < 120 ? "animate-pulse" : "opacity-30"}`} />
                            <span className="font-mono font-black text-[13px] tabular-nums">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 📊 High-Precision Thin Progress Bar */}
                <div className="w-full h-1 bg-gray-50">
                    <div
                        className="h-full bg-green-500/90 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </header>

            {/* 📝 Question Area - Refined Typography & Centering */}
            <main className="flex-1 flex items-center justify-center px-10 overflow-y-auto">
                <div className="max-w-[720px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-[2px] w-5 bg-green-500/30"></div>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Current Question</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-medium text-gray-900 leading-[1.4] tracking-tight transition-all">
                            {currentQuestion.questionText}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`w-full text-left p-4 md:p-5 rounded-[1.25rem] border-2 transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${answers[currentIdx] === idx
                                    ? 'border-green-500/40 bg-white ring-4 ring-green-500/5 shadow-lg'
                                    : 'border-white bg-white hover:border-green-100 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <div className={`absolute top-0 left-0 bottom-0 w-1 transition-all duration-500 ${answers[currentIdx] === idx ? 'bg-green-500 scale-y-100' : 'bg-green-100 scale-y-0'
                                    }`}></div>

                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black transition-all duration-300 flex-shrink-0 ${answers[currentIdx] === idx
                                    ? 'bg-green-500 text-white shadow-md shadow-green-200'
                                    : 'bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-green-500'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>

                                <span className={`text-base md:text-lg transition-colors duration-300 leading-tight ${answers[currentIdx] === idx ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-800'
                                    }`}>
                                    {option}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* 🔘 Anchored Navigation Footer */}
            <footer className="bg-white border-t border-gray-100 py-4 px-10 flex-shrink-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-0 transition-all font-bold text-[11px] uppercase tracking-widest`}
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
    );
}
