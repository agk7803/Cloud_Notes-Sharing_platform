import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaBook,
  FaSearch,
  FaBell,
  FaFire,
  FaCheckCircle,
  FaPlay,
  FaClock,
} from "react-icons/fa";
import MiniCalendar from './MiniCalendar';

// --- Mock Data ---

const CONTINUE_STUDYING = [
  { title: "Introduction to Limits.pdf", topic: "Mathematics", progress: 85, color: "bg-blue-500", remaining: "5 min left" },
  { title: "Advanced French Grammar_Vol2.pdf", topic: "Language", progress: 45, color: "bg-pink-500", remaining: "20 min left" },
  { title: "Physics Midterm - Incomplete", topic: "Classical Mechanics", progress: 10, color: "bg-purple-500", remaining: "1 hr 30 min left" },
];

const UPCOMING_ASSESSMENTS = [
  { title: "Midterm: Linear Algebra", date: "Tomorrow, 10:00 AM", duration: "90 min", type: "MCQ & Written" },
  { title: "Quiz: Classical Mechanics", date: "Feb 15, 2:00 PM", duration: "45 min", type: "MCQ" },
  { title: "Research Methodology Defense", date: "Feb 28, 11:00 AM", duration: "120 min", type: "Presentation" },
  { title: "Genetics Lab Final", date: "Mar 05, 1:00 PM", duration: "60 min", type: "Practical" },
];

const RECOMMENDED_TESTS = [
  { title: "Master Linear Algebra", desc: "Based on your recent notes, try this 20-min diagnostic test.", action: "Start Diagnostic" },
  { title: "Calculus Limits", desc: "Refresh your knowledge on limits and continuity.", action: "Practice Now" },
];

// --- Components ---

const Header = ({ user }) => (
  <header className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
        Ready to learn, <span className="text-purple-600">{user?.displayName?.split(" ")[0] || "Student"}</span>?
      </h1>
    </div>
    <div className="flex items-center gap-5">
      <button className="relative p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-purple-600">
        <FaBell />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
      </button>
      <div className="w-11 h-11 rounded-full bg-indigo-100 p-0.5 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-indigo-600 font-bold text-lg">{user?.displayName?.[0] || "U"}</span>
          )}
        </div>
      </div>
    </div>
  </header>
);

const SearchBar = () => (
  <div className="relative group w-full mb-8">
    <input
      type="text"
      placeholder="Search for notes, tests, or study groups..."
      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-base transition-all placeholder:text-gray-400"
    />
    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-purple-500 transition-colors" />
  </div>
);

const SectionHeader = ({ title, action }) => (
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    {action && (
      <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline">
        {action}
      </button>
    )}
  </div>
);

const StudyStreak = () => {
  const [expanded, setExpanded] = React.useState(false);
  const days = [
    { day: 'M', active: true },
    { day: 'T', active: true },
    { day: 'W', active: true },
    { day: 'T', active: false },
    { day: 'F', active: false },
    { day: 'S', active: false },
    { day: 'S', active: false },
  ];

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`bg-gradient-to-r from-orange-400 to-pink-500 p-6 rounded-3xl text-white shadow-lg shadow-orange-200 mb-8 cursor-pointer transition-all duration-300 relative overflow-hidden ${expanded ? 'h-auto' : 'h-32 flex items-center justify-between'}`}
    >
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className="text-2xl font-bold mb-1">3 Day Streak!</h3>
            <p className="text-orange-50 font-medium">You studied for 2.5 hours yesterday. Keep it up! 🔥</p>
          </div>
          {!expanded && (
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
              <FaFire className="text-4xl text-white animate-pulse" />
            </div>
          )}
        </div>

        {expanded && (
          <div className="mt-6 flex justify-between items-center pt-6 border-t border-white/20 animate-fade-in">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${d.active ? 'bg-white text-orange-500 shadow-md' : 'bg-white/20 text-white/60'}`}>
                  {d.active ? <FaFire /> : <span className="text-xs font-bold">{d.day}</span>}
                </div>
                <span className="text-xs font-medium text-orange-50">{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute -right-10 -bottom-20 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};

const ContinueStudyingCard = ({ item }) => (
  <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-10 flex items-center justify-center text-lg ${item.color.replace('bg-', 'text-')}`}>
        <FaBook />
      </div>
      <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.remaining}</span>
    </div>
    <h3 className="font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">{item.title}</h3>
    <p className="text-sm text-gray-500 mb-4">{item.topic}</p>
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
      </div>
      <button className="text-gray-300 hover:text-purple-600 transition-colors"><FaPlay size={12} /></button>
    </div>
  </div>
);

const AssessmentCard = ({ item }) => (
  <div className="bg-white/70 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm flex items-center gap-4 mb-3 hover:border-purple-200 transition-colors cursor-pointer group">
    <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-600 font-bold border border-indigo-100">
      <span className="text-xs uppercase">Feb</span>
      <span className="text-lg leading-none">12</span>
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition-colors">{item.title}</h4>
      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
        <span className="flex items-center gap-1"><FaClock size={10} /> {item.duration}</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.type}</span>
      </div>
    </div>
    <button className="text-sm font-semibold text-purple-600 px-3 py-1.5 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
      Prepare
    </button>
  </div>
);

const RecommendedTestCard = ({ item }) => (
  <div className="bg-indigo-50/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 flex flex-col items-center text-center mb-4">
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 text-xl shadow-sm mb-3">
      <FaCheckCircle />
    </div>
    <h3 className="font-bold text-gray-800">{item.title}</h3>
    <p className="text-sm text-gray-500 mb-4 mt-1">{item.desc}</p>
    <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 w-full">
      {item.action}
    </button>
  </div>
);

const RightPanel = () => (
  <aside className="
      w-[360px]
      flex-shrink-0
      p-6
      hidden xl:flex
      flex-col
      gap-8
      sticky top-0
      h-screen
      pt-8
      self-start
      overflow-y-auto
      no-scrollbar
    ">

    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50">
      <MiniCalendar />
    </div>

    <div>
      <h3 className="font-bold text-lg mb-4 text-gray-800 px-2">Recommended For You</h3>
      {RECOMMENDED_TESTS.map((test, i) => (
        <RecommendedTestCard key={i} item={test} />
      ))}
    </div>
  </aside>
);

export default function Dashboard() {
  const { user } = useOutletContext();

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-5xl mx-auto w-full no-scrollbar">
        <Header user={user} />
        <SearchBar />

        <StudyStreak />

        <div className="mb-10">
          <SectionHeader title="Continue Studying" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONTINUE_STUDYING.map((item, idx) => <ContinueStudyingCard key={idx} item={item} />)}
          </div>
        </div>

        <div className="mb-10">
          <SectionHeader title="Upcoming Assessments" action="View All" />
          {/* Changed to 2 columns to fill space nicely, or 1 column if items are wide. 
                User asked to 'adjust upcoming assessments in that space'. 
                Since we removed the recommended tests from the side of it, it can now span full width.
            */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UPCOMING_ASSESSMENTS.map((item, idx) => <AssessmentCard key={idx} item={item} />)}
          </div>
        </div>
      </main>

      {/* Divider */}
      <div className="hidden xl:flex justify-center px-2 sticky top-0 h-screen items-center">
        <div className="w-1 h-[80vh] bg-gradient-to-b via-gray-500 to-transparent rounded-full"></div>
      </div>

      {/* Right Smart Panel */}
      <RightPanel />

    </div>
  );
}

