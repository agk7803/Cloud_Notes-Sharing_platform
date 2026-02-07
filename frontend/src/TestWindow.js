import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheck, FaTimes, FaFlag, FaChevronRight, FaChevronLeft, FaSave } from 'react-icons/fa';

const MOCK_QUESTIONS = [
    {
        id: 1,
        type: 'mcq',
        text: 'Which of the following spaces is NOT a vector space?',
        options: [
            'The set of all polynomials of degree exactly n.',
            'The set of all continuous functions on [0,1].',
            'The set of all 2x2 matrices with real entries.',
            'The set of solutions to a homogeneous linear system.'
        ]
    },
    {
        id: 2,
        type: 'descriptive',
        text: 'Explain the significance of the Eigenvalue in the context of linear transformations. Provide a geometric interpretation.',
    },
    {
        id: 3,
        type: 'mcq',
        text: 'If A is an invertible matrix, what is det(A^-1)?',
        options: [
            'det(A)',
            '1 / det(A)',
            '-det(A)',
            '1'
        ]
    }
];

export default function TestWindow() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(3600); // 60 mins in seconds
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Timer countdown
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);

        // Focus Monitoring
        const handleBlur = () => {
            const warningCount = parseInt(sessionStorage.getItem('warnings') || '0') + 1;
            sessionStorage.setItem('warnings', warningCount);

            if (warningCount >= 3) {
                alert("Test submitted automatically due to multiple focus violations.");
                navigate('/assessments'); // Auto-submit behavior
            } else {
                alert(`WARNING: You are leaving the test environment. Violation ${warningCount}/3.`);
            }
        };

        window.addEventListener('blur', handleBlur);

        return () => {
            clearInterval(timer);
            window.removeEventListener('blur', handleBlur);
        };
    }, [navigate]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswer = (val) => {
        setIsSaving(true);
        setAnswers(prev => ({ ...prev, [currentQuestionIdx]: val }));

        // Simulate auto-save
        setTimeout(() => {
            setIsSaving(false);
        }, 800);
    };

    const currentQuestion = MOCK_QUESTIONS[currentQuestionIdx];

    const handleExit = () => {
        if (window.confirm("Are you sure you want to exit? Your progress may be lost.")) {
            navigate('/assessments');
        }
    }

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
            {/* Top Bar */}
            <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 bg-white shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-gray-800 text-lg">Linear Algebra Midterm</h2>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded font-mono">ID: {testId}</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <FaClock className={timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-400"} />
                        <span className={`font-mono font-bold text-lg ${timeLeft < 300 ? "text-red-600" : "text-gray-800"}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button
                        onClick={handleExit}
                        className="text-gray-400 hover:text-red-600 text-sm font-semibold transition-colors"
                    >
                        Exit Assessment
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <main className="flex-1 overflow-y-auto p-12 bg-gray-50 flex justify-center">
                    <div className="max-w-3xl w-full bg-white min-h-[500px] rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Question {currentQuestionIdx + 1} of {MOCK_QUESTIONS.length}</span>
                            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <FaFlag />
                            </button>
                        </div>

                        <h3 className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
                            {currentQuestion.text}
                        </h3>

                        <div className="flex-1">
                            {currentQuestion.type === 'mcq' ? (
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, idx) => (
                                        <label
                                            key={idx}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[currentQuestionIdx] === idx
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestion.id}`}
                                                checked={answers[currentQuestionIdx] === idx}
                                                onChange={() => handleAnswer(idx)}
                                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className={`text-lg ${answers[currentQuestionIdx] === idx ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative">
                                    <textarea
                                        className="w-full h-64 p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 resize-none text-lg text-gray-800 bg-white"
                                        placeholder="Type your answer here..."
                                        value={answers[currentQuestionIdx] || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                    />
                                    <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                                        {isSaving ? <span className="flex items-center gap-1"><FaSave className="animate-bounce" /> Saving...</span> : <span className="flex items-center gap-1 text-green-600"><FaCheck /> Saved</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between items-center pt-8 border-t border-gray-100">
                            <button
                                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIdx === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                <FaChevronLeft /> Previous
                            </button>
                            <button
                                onClick={() => setCurrentQuestionIdx(prev => Math.min(MOCK_QUESTIONS.length - 1, prev + 1))}
                                disabled={currentQuestionIdx === MOCK_QUESTIONS.length - 1}
                                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-300 font-bold shadow-md transition-all active:scale-95"
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </main>

                {/* Utility Panel */}
                <aside className="w-80 bg-white border-l border-gray-200 p-6 hidden lg:flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4">Question Navigator</h3>
                    <div className="grid grid-cols-4 gap-3 mb-8">
                        {MOCK_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIdx(idx)}
                                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${currentQuestionIdx === idx ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200' :
                                    answers[idx] !== undefined ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">Instructions</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Select the best answer for MCQ questions. For descriptive questions, ensure your answer is clear and concise.
                            <br /><br />
                            Your progress is saved automatically.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
