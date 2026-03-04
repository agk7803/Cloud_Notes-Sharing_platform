import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import api from '../../services/api';

export default function AssessmentReview() {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-10 text-center">Loading Review...</div>;
    if (!result) return <div className="p-10 text-center text-red-500">Result not found.</div>;

    const { assessmentId: assessment, answers, score, totalQuestions, percentage } = result;

    return (
        <div className="h-screen overflow-y-auto custom-scrollbar bg-gray-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/assessments')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm uppercase tracking-widest mb-8 transition-colors"
                >
                    <FaChevronLeft /> Back to Assessments
                </button>

                <header className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-2">Performance Review</span>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{assessment.title}</h1>
                            <p className="text-gray-400 text-sm mt-1">{assessment.subject} • {assessment.difficulty}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 text-center">
                                <span className="block text-[10px] font-black text-green-600 uppercase tracking-widest">Score</span>
                                <span className="text-2xl font-black text-green-700">{score}</span>
                            </div>
                            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-center">
                                <span className="block text-[10px] font-black text-blue-600 uppercase tracking-widest">Accuracy</span>
                                <span className="text-2xl font-black text-blue-700">{percentage}%</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="space-y-6">
                    {assessment.questions.map((q, idx) => {
                        const userAns = answers.find(a => a.questionIdx === idx);
                        const isCorrect = userAns?.isCorrect;
                        const selectedText = q.options[userAns?.selectedOption] || "No answer provided";

                        return (
                            <div key={idx} className={`bg-white rounded-[1.5rem] border-2 overflow-hidden transition-all ${isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                                <div className="p-6 md:p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {idx + 1}</span>
                                        {isCorrect ? (
                                            <span className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                                <FaCheck /> +10 Marks
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                                <FaTimes /> 0 Marks
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">{q.questionText}</h3>

                                    <div className="space-y-3">
                                        {q.options.map((option, oIdx) => {
                                            const isSelected = userAns?.selectedOption === oIdx;
                                            const isRightAns = option === q.correctAnswer;

                                            let styles = "bg-gray-50 text-gray-500 border-transparent";
                                            if (isSelected && isCorrect) styles = "bg-green-500 text-white border-green-500 shadow-lg shadow-green-100";
                                            else if (isSelected && !isCorrect) styles = "bg-red-500 text-white border-red-500 shadow-lg shadow-red-100";
                                            else if (isRightAns) styles = "bg-green-50 text-green-700 border-green-200";

                                            return (
                                                <div key={oIdx} className={`p-4 rounded-xl border-2 text-sm font-medium flex items-center justify-between ${styles}`}>
                                                    <span>{option}</span>
                                                    {isSelected && isCorrect && <FaCheck />}
                                                    {isSelected && !isCorrect && <FaTimes />}
                                                    {isRightAns && !isSelected && <span className="text-[10px] font-black uppercase tracking-widest">Correct Answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {q.explanation && (
                                        <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                            <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                                                <FaExclamationCircle /> Explanation
                                            </h4>
                                            <p className="text-sm text-blue-900/80 leading-relaxed font-medium">
                                                {q.explanation}
                                            </p>
                                            {q.referencePage && (
                                                <span className="mt-3 block text-[10px] font-bold text-blue-400 italic">
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
            </div>
        </div>
    );
}
