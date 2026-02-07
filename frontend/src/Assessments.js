import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaQuestionCircle, FaArrowLeft, FaCheck } from 'react-icons/fa';

const MOCK_TESTS = [
    { id: 1, title: 'Linear Algebra Midterm', questions: 20, duration: 60, subject: 'Math' },
    { id: 2, title: 'Classical Mechanics Quiz', questions: 10, duration: 30, subject: 'Physics' },
    { id: 3, title: 'European History Essay', questions: 2, duration: 45, subject: 'History' },
];

export default function Assessments() {
    const [selectedTest, setSelectedTest] = useState(null);
    const navigate = useNavigate();

    const handleStartTest = () => {
        navigate(`/test-window/${selectedTest.id}`);
    };

    if (selectedTest) {
        // Rules View
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    <button
                        onClick={() => setSelectedTest(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                    >
                        <FaArrowLeft /> Back to Assessments
                    </button>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedTest.title}</h1>
                    <p className="text-xl text-gray-500 mb-8">{selectedTest.subject} • {selectedTest.duration} Minutes</p>

                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Assessment Rules & Instructions</h3>
                        <ul className="space-y-4 text-gray-600">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                                <span>You are about to enter a <strong>focus-mode</strong> environment. Full screen is recommended.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                                <span>Do not switch tabs or exit the window. Such actions may be recorded.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
                                <span>Your answers are auto-saved. Ensure a stable internet connection.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="flex-1 bg-black text-white text-lg font-bold py-4 rounded-xl hover:bg-gray-800 transition-transform active:scale-[0.98] shadow-lg"
                            onClick={handleStartTest}
                        >
                            Start Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Listing View
    return (
        <div className="min-h-screen bg-[#f8fbfa] p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
                    <p className="text-gray-500">Select a test to begin.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_TESTS.map(test => (
                        <div key={test.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedTest(test)}>
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-lg">{test.subject}</span>
                                <FaClock className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{test.title}</h3>
                            <p className="text-gray-500 text-sm mb-6">{test.questions} Questions • {test.duration} min</p>
                            <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
