import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBell,
  FaFire,
  FaCheckCircle,
} from "react-icons/fa";
import MiniCalendar from './MiniCalendar';
import api from './api/axios';

// --- Components ---

const Header = ({ user }) => {
  const [showNotifs, setShowNotifs] = React.useState(false);

  return (
    <header className="flex justify-between items-center mb-6 relative">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Ready to learn, <span className="text-[#1dc962]">{user?.name?.split(" ")[0] || "Student"}</span>?
        </h1>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-[#1dc962]"
          >
            <FaBell />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in">
              <h4 className="font-bold text-gray-800 mb-2">Notifications</h4>
              <div className="space-y-2">
                <div className="p-2 bg-green-50 rounded-lg text-xs text-gray-600">
                  <span className="font-bold text-[#1dc962]">Assessment Due</span><br />Cloud Computing Midterm tomorrow!
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-11 h-11 rounded-full bg-green-100 p-0.5 cursor-pointer hover:ring-2 hover:ring-[#1dc962] transition-all">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#1dc962] font-bold text-lg">{user?.name?.[0] || "U"}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const SearchBar = () => (
  <div className="relative group w-full mb-8">
    <input
      type="text"
      placeholder="Search for notes, tests, or study groups..."
      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1dc962]/20 focus:border-[#1dc962] text-base transition-all placeholder:text-gray-400"
    />
    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-[#1dc962] transition-colors" />
  </div>
);

const SectionHeader = ({ title, action }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {action && (
        <button
          onClick={() => action === "View All" ? navigate('/assessments') : null}
          className="text-sm font-semibold text-[#1dc962] hover:text-green-700 hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  );
};

const StudyStreak = ({ streak }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Dynamically generate days for visualization
  const todayIndex = new Date().getDay(); // 0-6 Sun-Sat
  const days = [
    { day: 'S', active: false },
    { day: 'M', active: false },
    { day: 'T', active: false },
    { day: 'W', active: false },
    { day: 'T', active: false },
    { day: 'F', active: false },
    { day: 'S', active: false },
  ];

  if (streak > 0) {
    days[todayIndex === 0 ? 6 : todayIndex - 1].active = true;
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`bg-gradient-to-r from-orange-400 to-pink-500 p-6 rounded-3xl text-white shadow-lg shadow-orange-200 mb-8 cursor-pointer transition-all duration-300 relative overflow-hidden ${expanded ? 'h-auto' : 'h-32 flex items-center justify-between'}`}
    >
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className="text-2xl font-bold mb-1">{streak} Day Streak!</h3>
            <p className="text-orange-50 font-medium">Keep up the good work! 🔥</p>
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

const AssessmentCard = ({ item }) => (
  <div className="bg-white/70 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-sm flex items-center gap-4 mb-3 hover:border-green-200 transition-colors cursor-pointer group">
    <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex flex-col items-center justify-center text-[#1dc962] font-bold border border-green-100">
      <span className="text-xs uppercase">Feb</span>
      <span className="text-lg leading-none">12</span>
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#1dc962] transition-colors">{item.title}</h4>
      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.type}</span>
      </div>
    </div>
    <button className="text-sm font-semibold text-[#1dc962] px-3 py-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
      Prepare
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
    ">

    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50">
      <MiniCalendar />
    </div>
  </aside>
);

export default function Dashboard() {
  const { user, streak } = useOutletContext();
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get('/assessments');
        // Take first 4 for display
        setAssessments(res.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to load assessments", error);
      }
    };
    fetchAssessments();
  }, []);

  return (
    <div className="flex relative">
      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
        <Header user={user} />
        <SearchBar />

        <StudyStreak streak={streak} />

        <div className="mb-10">
          <SectionHeader title="Upcoming Assessments" action="View All" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.length > 0 ? (
              assessments.map((item) => <AssessmentCard key={item._id} item={item} />)
            ) : (
              <p className="text-gray-500">No upcoming assessments.</p>
            )}
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
