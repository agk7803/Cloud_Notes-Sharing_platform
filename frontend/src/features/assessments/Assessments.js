import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from "../../services/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    FaClock, FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp,
    FaBookOpen, FaPlayCircle, FaFileAlt, FaTrophy,
    FaChartBar, FaPlus, FaTimes, FaTrash, FaChevronRight
} from 'react-icons/fa';

const SUBJECTS = ["Machine Learning", "Compiler Design", "Computer Networks", "Software Engineering", "Cloud Computing", "Web Engineering"];

const CountUp = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
};

export default function Assessments() {
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [userNotes, setUserNotes] = useState([]);


    // Data State
    const [generatedTests, setGeneratedTests] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userResults, setUserResults] = useState([]);

    // Generator Form
    const [genSubject, setGenSubject] = useState(SUBJECTS[0]);
    const [genType, setGenType] = useState("mcq");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionsCount, setQuestionsCount] = useState(10);
    const [shuffle, setShuffle] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const navigate = useNavigate();
    const { user } = useOutletContext(); // Get user from Layout context


    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            try {
                const testsRes = await api.get("/assessments");
                setGeneratedTests(testsRes.data);
            } catch (err) {
                console.error("Assessments error:", err);
            }

            try {
                const resultsRes = await api.get("/assessments/results/user");
                setUserResults(resultsRes.data);
            } catch (err) {
                console.error("Results error:", err);
            }

            try {
                const lbRes = await api.get("/auth/leaderboard");
                setLeaderboard(lbRes.data);
            } catch (err) {
                console.error("Leaderboard error:", err);
            }

            try {
                const notesRes = await api.get("/notes");
                setUserNotes(notesRes.data);
            } catch (err) {
                console.error("Notes error:", err);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleStartTest = (testId) => {
        navigate(`/assessment/${testId}`);
    };

    const handlePrepare = (subject) => {
        navigate('/view', { state: { subject: subject } });
    };

    const toggleExpand = (testId) => {
        setSelectedTestId(prev => prev === testId ? null : testId);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this assessment?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/assessments/${id}`);

            setGeneratedTests(prev =>
                prev.map(t =>
                    t._id === id ? { ...t, removing: true } : t
                )
            );

            setTimeout(() => {
                setGeneratedTests(prev =>
                    prev.filter(test => test._id !== id)
                );
            }, 300);

        } catch (error) {
            console.error(error);
            alert("Failed to delete assessment.");
        }
    };

    const handleGenerateTest = async () => {
        if (!selectedFile) {
            alert("Please upload a file first.");
            return;
        }

        setIsGenerating(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("subject", genSubject);
            formData.append("type", genType);
            formData.append("difficulty", difficulty);
            formData.append("questionsCount", questionsCount);
            formData.append("shuffle", shuffle);

            const res = await api.post(
                "/assessments/generate",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            setGeneratedTests(prev => [res.data, ...prev]);

            console.log(res.data);
            alert("Test generated successfully!");
            setShowGenerateModal(false);

        } catch (error) {
            console.error(error);
            alert("Failed to generate test.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10 transition-all duration-300">

                        <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">

                            <div className="space-y-2">
                                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                                    Assessments
                                </h1>

                                <p className="text-gray-500 text-lg">
                                    Test your knowledge and climb the leaderboard.
                                </p>

                                <div className="flex items-center gap-4 text-sm mt-3">
                                    <span className="bg-white px-3 py-1 rounded-full shadow-sm font-medium">
                                        🔥 Streak: 5
                                    </span>
                                    <span className="bg-white px-3 py-1 rounded-full shadow-sm font-medium">
                                        🏆 Rank: #12
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">

                                <button
                                    onClick={() => setShowScoreModal(true)}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:border-green-400 hover:text-green-600 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <FaTrophy className="text-yellow-500 transition-transform duration-300 group-hover:scale-110" />
                                    Scores
                                </button>

                                <button
                                    onClick={() => setShowGenerateModal(true)}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 hover:shadow-xl shadow-lg active:scale-95 transition-all duration-200"
                                >
                                    <FaPlus className="transition-transform duration-300 group-hover:rotate-90" />
                                    Generate Test
                                </button>

                            </div>

                        </header>

                    </div>
                </div>

                <div className="space-y-6">
                    {generatedTests.length === 0 && (
                        <p className="text-center text-gray-500">No assessments found. Generate one to get started!</p>
                    )}
                    {generatedTests.map(test => {
                        const isExpanded = selectedTestId === test._id; // MongoDB uses _id

                        return (
                            <div
                                key={test._id}
                                className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 ${isExpanded
                                    ? "border-green-500 shadow-lg ring-1 ring-green-100"
                                    : "border-transparent hover:border-green-200"
                                    }${test.removing ? "opacity-0 scale-95" : ""}`}
                            >
                                <div
                                    className="p-6 cursor-pointer flex justify-between items-center"
                                    onClick={() => toggleExpand(test._id)}
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-100">{test.subject}</span>
                                            {/* 🤖 AI Badge */}
                                            <span className="px-2 py-1 text-[10px] bg-purple-100 text-purple-600 rounded-md font-semibold">
                                                🤖 AI Generated
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                <FaClock /> {test.duration} min
                                            </div>
                                            <span className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 rounded-md font-semibold">
                                                👤 By {test.creatorName || "Scholar"}
                                            </span>
                                        </div>
                                        <h3 className={`text-xl font-bold transition-colors ${isExpanded ? 'text-green-600' : 'text-gray-900'}`}>{test.title}</h3>
                                        {/* Row 1 - Meta Info */}
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span>{test.questions?.length || 0} Questions</span>
                                            <span>•</span>
                                            <span className="uppercase">{test.type}</span>
                                        </div>

                                        {/* Row 2 - Badges */}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span
                                                className={`text-xs px-3 py-1 rounded-full font-semibold ${test.difficulty === "easy"
                                                    ? "bg-green-100 text-green-600"
                                                    : test.difficulty === "medium"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {{
                                                    easy: "🌿 Easy",
                                                    medium: "⚡ Medium",
                                                    hard: "🔥 Hard",
                                                }[test.difficulty]}
                                            </span>

                                            {userResults.some(r => r.assessmentId?._id === test._id) ? (
                                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600 font-bold flex items-center gap-1">
                                                    <FaCheck size={10} /> Completed
                                                </span>
                                            ) : (
                                                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                                                    Not Attempted
                                                </span>
                                            )}
                                        </div>
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
                                            {userNotes.filter(note =>
                                                note.subject?.toLowerCase() === test.subject?.toLowerCase()
                                            ).length > 0 ? (

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {userNotes
                                                        .filter(note =>
                                                            note.subject?.toLowerCase() === test.subject?.toLowerCase()
                                                        )
                                                        .map(note => (
                                                            <div
                                                                key={note._id}
                                                                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-green-200 transition"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm">
                                                                    <FaFileAlt />
                                                                </div>

                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {note.title}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>

                                            ) : (
                                                <p className="text-xs text-gray-400 italic">
                                                    No notes available for this subject.
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-4 mt-6 items-center">
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
                                            <button
                                                onClick={() => handleDelete(test._id)}
                                                className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center"
                                                title="Delete Assessment"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- MODALS --- */}

                {/* Score Modal - High Fidelity Redesign */}
                {showScoreModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black/30">

                            {/* Left: Performance Analysis */}
                            <div className="flex-2 p-10 md:p-12 border-r border-gray-100 overflow-y-auto custom-scrollbar flex-shrink-0 md:w-[60%]">
                                <header className="mb-10">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Performance</h2>
                                    <p className="text-gray-400 text-sm mt-1 font-medium">Track your learning journey and milestones</p>
                                </header>

                                {/* Rewarding Score Card */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2rem] p-8 text-white mb-10 shadow-xl shadow-green-200/40">
                                    <div className="absolute top-[-20%] right-[-5%] opacity-10 rotate-12">
                                        <FaTrophy size={180} />
                                    </div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="text-center md:text-left">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 block mb-2">Total Accumulated Score</span>
                                            <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                                <h3 className="text-6xl font-black tracking-tighter">
                                                    <CountUp end={user?.totalScore || 0} />
                                                </h3>
                                                <span className="text-xl font-bold opacity-60">pts</span>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 w-fit mx-auto md:mx-0">
                                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-100">+250 XP earned today</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/20 min-w-[140px]">
                                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                                                <FaTrophy className="text-yellow-400 text-2xl" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Current Rank</span>
                                            <span className="text-2xl font-black">#12</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subject Breakdown - Horizontal Progress Bars */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            Knowledge Mastery
                                        </h3>
                                        <div className="px-3 py-1 bg-gray-50 rounded-lg text-gray-400 font-black text-[9px] uppercase tracking-wider border border-gray-100">
                                            By Subject
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {user?.subjectScores ? Object.entries(user.subjectScores).map(([subject, score]) => (
                                            <div key={subject} className="group">
                                                <div className="flex justify-between items-center mb-2.5">
                                                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{subject}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">{score} pts</span>
                                                    </div>
                                                </div>
                                                <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50 relative">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[4px_0_12px_rgba(16,185,129,0.2)]"
                                                        style={{ width: `${Math.min((score / 500) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                                                <p className="text-gray-300 text-sm italic font-medium">Complete an assessment to see your analytics</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent Activity / History */}
                                    <div className="mt-12 space-y-6">
                                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            Recent Activity
                                        </h3>
                                        <div className="space-y-3">
                                            {userResults.length > 0 ? userResults.slice(0, 5).map((result) => (
                                                <div key={result._id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${result.percentage >= 80 ? 'bg-green-50 text-green-600' : result.percentage >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                                                            {result.percentage}%
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-bold text-gray-900 truncate">{result.assessmentId?.title || "Deleted Assessment"}</h4>
                                                            <p className="text-[10px] text-gray-400 font-medium">{new Date(result.completedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/assessment/review/${result._id}`)}
                                                        className="px-4 py-1.5 bg-gray-50 hover:bg-black hover:text-white text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-gray-100"
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            )) : (
                                                <p className="text-xs text-gray-400 italic">No recent attempts recorded.</p>
                                            )}
                                        </div>
                                    </div>

                                    {user?.subjectScores && Object.keys(user.subjectScores).length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 mt-10">
                                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-2">Strongest Category</span>
                                                <span className="text-sm font-bold text-blue-900 truncate block">
                                                    {Object.entries(user.subjectScores).sort((a, b) => b[1] - a[1])[0][0]}
                                                </span>
                                            </div>
                                            <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100/50">
                                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-2">Active Streak</span>
                                                <span className="text-sm font-bold text-purple-900">5 Days 🔥</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Leaderboard Section */}
                            <div className="w-full md:w-[40%] bg-[#fafbfc] p-10 md:p-12 flex flex-col relative overflow-hidden">
                                <div className="absolute top-10 right-10 opacity-[0.03] rotate-12 pointer-events-none">
                                    <FaTrophy size={160} />
                                </div>

                                <div className="flex justify-between items-center mb-10 relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 italic">
                                            <FaTrophy className="text-yellow-400 text-xl" /> HALL OF FAME
                                        </h2>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Top performers this week</p>
                                    </div>
                                    <button
                                        onClick={() => setShowScoreModal(false)}
                                        className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-110"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar relative z-10">
                                    {leaderboard.map((lbUser, idx) => {
                                        const isCurrentUser = lbUser._id === user?._id;
                                        return (
                                            <div
                                                key={lbUser._id}
                                                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isCurrentUser
                                                    ? 'bg-white border-green-200 shadow-xl shadow-green-100/30 ring-1 ring-green-100 ring-offset-2'
                                                    : 'bg-white border-gray-100 hover:border-green-100 shadow-sm hover:shadow-lg'
                                                    }`}
                                            >
                                                {/* Rank Badge */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-transform duration-300 group-hover:scale-110 ${idx === 0 ? 'bg-yellow-100 text-yellow-600 shadow-inner' :
                                                    idx === 1 ? 'bg-gray-100 text-gray-500 shadow-inner' :
                                                        idx === 2 ? 'bg-orange-50 text-orange-600 shadow-inner' :
                                                            'bg-gray-50 text-gray-300'
                                                    }`}>
                                                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                                                </div>

                                                {/* Avatar + Info */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs ring-2 ring-white overflow-hidden shrink-0">
                                                    {lbUser.name?.[0]?.toUpperCase() || lbUser.email?.[0]?.toUpperCase() || "?"}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-gray-900 truncate text-[13px] tracking-tight">
                                                        {lbUser.name || lbUser.email?.split('@')[0]}
                                                        {isCurrentUser && <span className="ml-1.5 text-[9px] text-green-500 font-black tracking-widest">(YOU)</span>}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lbUser.streak || 0}d streak</span>
                                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                        <span className="text-[10px] text-green-500 font-black">↑ 2 ranks</span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="font-black text-[14px] text-gray-900 tracking-tighter">{lbUser.totalScore || 0}</div>
                                                    <div className="text-[8px] font-black uppercase text-gray-400 tracking-widest">PTS</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pinned Rank Banner */}
                                <div className="mt-8 bg-green-500 p-5 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-green-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">#12</div>
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest opacity-80">Your Global Rank</h5>
                                            <p className="text-sm font-black">Top 5% Students</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce cursor-pointer">
                                        <FaChevronUp />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Generate AI Test Drawer */}
                {showGenerateModal && (
                    <div className="fixed inset-0 z-50 overflow-hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                            onClick={() => setShowGenerateModal(false)}
                        ></div>

                        {/* Drawer Panel */}
                        <div className="absolute inset-y-0 right-0 max-w-full flex">
                            <div className="relative w-screen max-w-[460px] transform transition-transform duration-500 ease-in-out">
                                <div className="h-full flex flex-col bg-white shadow-2xl">
                                    {/* Header */}
                                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Generate AI Test</h2>
                                            <p className="text-xs text-gray-500 font-medium">Create an assessment with AI</p>
                                        </div>
                                        <button
                                            onClick={() => setShowGenerateModal(false)}
                                            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            <FaTimes size={18} />
                                        </button>
                                    </div>

                                    {/* Scrollable Body */}
                                    <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                                        <div className="space-y-6">
                                            {/* Upload Section */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Source Material
                                                </label>
                                                <div className="relative">
                                                    <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all group">
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                                                            className="hidden"
                                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                                        />
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                                                                <FaFileAlt size={20} />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600">
                                                                Click to upload or drag & drop
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">
                                                                PDF, DOCX, or PPTX (Max 20MB)
                                                            </span>
                                                        </div>
                                                    </label>

                                                    {selectedFile && (
                                                        <div className="mt-3 flex items-center justify-between p-2 bg-green-50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-1">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="p-1.5 bg-green-100 text-green-700 rounded-lg shrink-0">
                                                                    <FaCheck size={10} />
                                                                </div>
                                                                <span className="text-xs font-medium text-green-800 truncate">
                                                                    {selectedFile.name}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedFile(null)}
                                                                className="p-1 hover:bg-green-100 text-green-600 rounded-md transition-colors"
                                                            >
                                                                <FaTimes size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Subject */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Subject Category
                                                </label>
                                                <select
                                                    value={genSubject}
                                                    onChange={(e) => setGenSubject(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                                >
                                                    {SUBJECTS.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Test Type - Segmented Control */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Assessment Format
                                                </label>
                                                <div className="flex p-1 bg-gray-100 rounded-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => setGenType("mcq")}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${genType === "mcq"
                                                            ? "bg-white shadow-sm text-green-600"
                                                            : "text-gray-500 hover:text-gray-700"
                                                            }`}
                                                    >
                                                        Multiple Choice
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGenType("written")}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${genType === "written"
                                                            ? "bg-white shadow-sm text-green-600"
                                                            : "text-gray-500 hover:text-gray-700"
                                                            }`}
                                                    >
                                                        Written Answer
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Difficulty + Questions */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Difficulty
                                                    </label>
                                                    <select
                                                        value={difficulty}
                                                        onChange={(e) => setDifficulty(e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                                    >
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Questions
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="30"
                                                        value={questionsCount}
                                                        onChange={(e) => setQuestionsCount(e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Shuffle Contol */}
                                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={shuffle}
                                                    onChange={() => setShuffle(!shuffle)}
                                                    className="w-4 h-4 rounded-md accent-green-600 focus:ring-green-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Shuffle Question Order
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Sticky Footer */}
                                    <div className="px-6 py-6 border-t border-gray-100 sticky bottom-0 bg-white">
                                        <button
                                            onClick={handleGenerateTest}
                                            disabled={isGenerating}
                                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Generating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Generate Assessment</span>
                                                    <FaPlayCircle />
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] text-gray-400 text-center mt-3">
                                            AI-generated tests can take up to 30 seconds to process.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
