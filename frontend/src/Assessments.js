import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaClock, FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp, FaBookOpen, FaPlayCircle, FaFileAlt, FaTrophy, FaChartBar, FaPlus, FaTimes } from 'react-icons/fa';
import api from './api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const SUBJECTS = ["Machine Learning", "Compiler Design", "Computer Networks", "Software Engineering", "Cloud Computing", "Web Engineering"];

export default function Assessments() {
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Data State
    const [generatedTests, setGeneratedTests] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    // Generator Form
    const [genSubject, setGenSubject] = useState(SUBJECTS[0]);
    const [genType, setGenType] = useState('mcq');
    const [isGenerating, setIsGenerating] = useState(false);

    const navigate = useNavigate();
    const { user } = useOutletContext(); // Get user from Layout context

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Assessments
                const testsRes = await api.get('/assessments');
                setGeneratedTests(testsRes.data);

                // Fetch Leaderboard
                const lbRes = await api.get('/auth/leaderboard');
                setLeaderboard(lbRes.data);
            } catch (error) {
                console.error("Error fetching assessment data:", error);
            }
        };

        fetchData();
    }, []);

    const handleStartTest = (testId) => {
        // Navigate to test window (implementation needed for actual test taking)
        alert("Test taking interface not fully implemented in this migration yet.");
        // navigate(`/test-window/${testId}`); 
    };

    const handlePrepare = (subject) => {
        navigate('/view', { state: { subject: subject } });
    };

    const toggleExpand = (testId) => {
        setSelectedTestId(prev => prev === testId ? null : testId);
    };

    const handleGenerateTest = async () => {
        if (!genSubject || !genType) return;
        setIsGenerating(true);

        try {
            const newTest = {
                title: `${genType.toUpperCase()}: ${genSubject} Practice`,
                subject: genSubject,
                type: genType,
                duration: genType === 'mcq' ? 30 : 60,
                questions: genType === 'mcq' ? 15 : 5
            };

            const res = await api.post('/assessments', newTest);
            setGeneratedTests([res.data, ...generatedTests]);
            setShowGenerateModal(false);
        } catch (error) {
            console.error("Error generating test:", error);
            alert("Failed to generate test.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
                        <p className="text-gray-500">Test your knowledge and climb the leaderboard.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowScoreModal(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:border-green-400 hover:text-green-600 shadow-sm transition-all"
                        >
                            <FaTrophy className="text-yellow-500" /> Scores
                        </button>
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 shadow-lg active:scale-95 transition-all"
                        >
                            <FaPlus /> Generate Test
                        </button>
                    </div>
                </header>

                <div className="space-y-6">
                    {generatedTests.length === 0 && (
                        <p className="text-center text-gray-500">No assessments found. Generate one to get started!</p>
                    )}
                    {generatedTests.map(test => {
                        const isExpanded = selectedTestId === test._id; // MongoDB uses _id

                        return (
                            <div key={test._id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${isExpanded ? 'border-green-500 shadow-lg ring-1 ring-green-100' : 'border-gray-100 hover:border-gray-300'}`}>
                                <div
                                    className="p-6 cursor-pointer flex justify-between items-center"
                                    onClick={() => toggleExpand(test._id)}
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-100">{test.subject}</span>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                <FaClock /> {test.duration} min
                                            </div>
                                            {/* For simplicity not showing createdBy name unless we populate it */}
                                        </div>
                                        <h3 className={`text-xl font-bold transition-colors ${isExpanded ? 'text-green-600' : 'text-gray-900'}`}>{test.title}</h3>
                                        <p className="text-gray-500 text-sm">{test.questions} Questions • {test.type.toUpperCase()}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-0 border-t border-gray-50 bg-gray-50/30">
                                        <div className="mt-6 mb-8">
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                                <FaBookOpen className="text-green-500" /> Recommended Study Material
                                            </h4>
                                            {test.materials && test.materials.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {test.materials.map((mat, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-green-200 cursor-pointer transition-colors group">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm">
                                                                {mat.type === 'video' ? <FaPlayCircle /> : <FaFileAlt />}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{mat.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No specific materials linked. Check the main notes.</p>
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handlePrepare(test.subject)}
                                                className="flex-1 py-3 px-4 rounded-xl border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FaFileAlt /> Prepare with Notes
                                            </button>
                                            <button
                                                onClick={() => handleStartTest(test._id)}
                                                className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                                            >
                                                Start Assessment <FaArrowLeft className="rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- MODALS --- */}

                {/* Score Modal */}
                {showScoreModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col md:flex-row overflow-hidden">
                            {/* Left: My Stats */}
                            <div className="flex-1 p-8 border-r border-gray-100">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Your Performance</h2>
                                </div>

                                <div className="mb-8 text-center bg-green-50 rounded-2xl p-6 border border-green-100">
                                    <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Score</span>
                                    <div className="text-5xl font-black text-green-600 mt-2">{user?.totalScore || 0}</div>
                                    <p className="text-green-600/70 text-sm font-medium mt-1">Points Earned</p>
                                </div>

                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaChartBar className="text-green-500" /> Subject Breakdown</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={user?.subjectScores ? Object.entries(user.subjectScores).map(([k, v]) => ({ name: k.split(' ')[0], score: v })) : []}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#1dc962" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#1dc962" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" fontSize={10} tick={{ fill: '#6b7280' }} />
                                            <YAxis fontSize={10} tick={{ fill: '#6b7280' }} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="score" fill="url(#colorScore)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right: Leaderboard */}
                            <div className="w-full md:w-96 bg-gray-50 p-8 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FaTrophy className="text-yellow-500" /> Leaderboard</h2>
                                    <button onClick={() => setShowScoreModal(false)} className="text-gray-400 hover:text-gray-900"><FaTimes /></button>
                                </div>

                                <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                    {leaderboard.map((lbUser, idx) => (
                                        <div key={lbUser._id} className={`flex items-center gap-4 p-3 rounded-xl border ${lbUser._id === user?._id ? 'bg-green-100 border-green-200 ring-1 ring-green-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{lbUser.name || lbUser.email?.split('@')[0]}</h4>
                                                <p className="text-xs text-gray-500">{lbUser.streak || 0} Day Streak</p>
                                            </div>
                                            <div className="font-mono font-bold text-green-600">{lbUser.totalScore || 0} pts</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Test Modal */}
                {showGenerateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in relative">
                            <button onClick={() => setShowGenerateModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><FaTimes /></button>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Test</h2>
                            <p className="text-gray-500 mb-8">Create a custom challenge for yourself and others.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Subject</label>
                                    <select
                                        value={genSubject}
                                        onChange={(e) => setGenSubject(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 font-medium bg-gray-50"
                                    >
                                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Test Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setGenType('mcq')}
                                            className={`p-4 rounded-xl border-2 font-bold transition-all ${genType === 'mcq' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            MCQ
                                        </button>
                                        <button
                                            onClick={() => setGenType('written')}
                                            className={`p-4 rounded-xl border-2 font-bold transition-all ${genType === 'written' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            Written
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateTest}
                                    disabled={isGenerating}
                                    className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? 'Generating...' : <><FaCheck /> Create Test</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
