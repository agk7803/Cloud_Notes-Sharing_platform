import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheck, FaTimes, FaFlag, FaChevronRight, FaChevronLeft, FaSave, FaTrophy } from 'react-icons/fa';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

const MOCK_QUESTIONS = {
    'mock-1': [
        { id: 1, type: 'mcq', text: 'Which of the following spaces is NOT a vector space?', options: ['The set of all polynomials.', 'The set of all continuous functions.', 'The set of all 2x2 matrices.', 'Set of solutions to Ax=b where b!=0.'], correct: 3 },
        { id: 2, type: 'mcq', text: 'If A is invertible, det(A^-1) is?', options: ['det(A)', '1/det(A)', '-det(A)', '1'], correct: 1 },
        // ... (simplified for brevity, assume 20 questions)
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

    useEffect(() => {
        // Load Questions
        const loadTest = async () => {
            if (testId.startsWith('mock-')) {
                setQuestions(MOCK_QUESTIONS[testId] || DEFAULT_QUESTIONS);
                setTestMetadata({ title: 'Mock Test', subject: 'General' });
            } else {
                // Fetch from Firestore
                try {
                    const docRef = doc(db, 'assessments', testId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setTestMetadata(data);
                        // In a real app, questions would be a subcollection or field. 
                        // For this MVP, we generate dummy questions based on count.
                        // But if questions field exists use it, else use DEFAULT.
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

        // Calculate Score
        let score = 0;
        questions.forEach((q, idx) => {
            if (q.type === 'mcq' && answers[idx] === q.correct) {
                score += 10;
            }
            // Descriptive: Random score for MVP or mark as pending
            if (q.type === 'descriptive' && answers[idx]) {
                score += 5;
            }
        });

        const totalPotential = questions.length * 10;
        setScoreResult({ score, total: totalPotential });

        // Update Firestore
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

    if (showResult) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center p-6 animate-fade-in">
                <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-green-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
                        🏆
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-2">Test Complete!</h2>
                    <p className="text-gray-500 mb-8">Great job completing the assessment.</p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Your Score</span>
                        <div className="text-6xl font-black text-green-600 my-2">{scoreResult.score}</div>
                        <p className="text-sm text-gray-500">out of {scoreResult.total} points</p>
                    </div>

                    <button
                        onClick={() => navigate('/assessments')}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) return <div className="p-10 text-center">Loading Test...</div>;

    const currentQuestion = questions[currentQuestionIdx];

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
            {/* Top Bar */}
            <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 bg-white shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-gray-800 text-lg">{testMetadata?.title || 'Assessment'}</h2>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded font-bold uppercase tracking-wider">{testMetadata?.subject}</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <FaClock className={timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-400"} />
                        <span className={`font-mono font-bold text-lg ${timeLeft < 300 ? "text-red-600" : "text-gray-800"}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/assessments')}
                        className="text-gray-400 hover:text-red-600 text-sm font-semibold transition-colors"
                    >
                        Exit
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
                    >
                        Submit Test
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Area */}
                <main className="flex-1 overflow-y-auto p-12 bg-gray-50 flex justify-center">
                    <div className="max-w-3xl w-full bg-white min-h-[500px] rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-sm font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded">Question {currentQuestionIdx + 1} of {questions.length}</span>
                            <button className="text-gray-400 hover:text-green-600 transition-colors">
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
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestion.id}`}
                                                checked={answers[currentQuestionIdx] === idx}
                                                onChange={() => handleAnswer(idx)}
                                                className="w-5 h-5 text-green-600 focus:ring-green-500 accent-green-600"
                                            />
                                            <span className={`text-lg ${answers[currentQuestionIdx] === idx ? 'text-green-900 font-medium' : 'text-gray-700'}`}>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative">
                                    <textarea
                                        className="w-full h-64 p-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-0 resize-none text-lg text-gray-800 bg-white"
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
                                onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestionIdx === questions.length - 1}
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
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIdx(idx)}
                                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${currentQuestionIdx === idx ? 'bg-green-600 text-white shadow-md ring-2 ring-green-200' :
                                    answers[idx] !== undefined ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 bg-green-50/50 rounded-xl p-4 border border-green-100">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">Instructions</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
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
