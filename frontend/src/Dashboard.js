import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBell,
  FaFire,
  FaCheckCircle,
  FaFilePdf,
  FaEllipsisV,
  FaEye,
  FaDownload
} from "react-icons/fa";
import MiniCalendar from './MiniCalendar';
import api from './api/axios';
import { useNotes } from './NoteContext';

// --- Components ---

const Header = ({ user }) => {
  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotifs, setShowNotifs] = React.useState(false);

  return (
    <>
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

          <div
            onClick={() => setShowProfile(true)}
            className="w-11 h-11 rounded-full bg-green-100 p-0.5 cursor-pointer hover:ring-2 hover:ring-[#1dc962] transition-all"
          >
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

      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#1dc962] to-green-400"></div>
            <div className="relative pt-12 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white p-1 mb-4">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-[#1dc962]">
                    {user?.name?.[0] || "U"}
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name || "User"}</h2>
              <p className="text-gray-500 mb-6">{user?.email}</p>

              <div className="w-full space-y-3">
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600">Student ID</span>
                  <span className="text-sm font-bold text-gray-900">2023-CS-042</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600">Major</span>
                  <span className="text-sm font-bold text-gray-900">Computer Science</span>
                </div>
              </div>

              <button
                onClick={() => setShowProfile(false)}
                className="mt-8 w-full py-3 bg-[#1dc962] text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
          onClick={() => action === "View All" ? navigate('/mynotes') : null}
          className="text-sm font-semibold text-[#1dc962] hover:text-green-700 hover:underline"
        >
          {action}
        </button>
      )}
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

const StudyStreak = ({ streak }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Dynamically generate days for visualization
  // Streak logic fix
  const todayIndex = new Date().getDay(); // 0-6 Sun-Sat
  // Map todayIndex to array indices (Sun=0...Sat=6). Array matches this.
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
    // Highlight active days counting back from today
    // Assuming streak includes today if maintained.
    for (let i = 0; i < streak && i < 7; i++) {
      // Calculate index wrapping around
      const idx = (todayIndex - i + 7) % 7;
      days[idx].active = true;
    }
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

const NoteCard = ({ note }) => {
  const getViewUrl = (note) => {
    // Extract file extension
    const extension = note.s3Key ? note.s3Key.split('.').pop().toLowerCase() : note.fileUrl.split('.').pop().split('?')[0].toLowerCase();

    // Switch to Microsoft Office Viewer for better compatibility
    const officeTypes = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

    if (officeTypes.includes(extension)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(note.fileUrl)}`;
    }

    return note.fileUrl;
  };

  return (
    <div
      onClick={() => window.open(getViewUrl(note), '_blank')}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all cursor-pointer group flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-green-50 text-[#1dc962] flex items-center justify-center text-lg">
          <FaFilePdf />
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
          {note.subject || "General"}
        </span>
      </div>

      <div>
        <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#1dc962] transition-colors line-clamp-1">
          {note.title}
        </h4>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(note.createdAt || Date.now()).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const RightPanel = ({ assessments }) => (
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

    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-6">
      <SectionHeader title="Upcoming Assessments" action="View All" />
      <div className="grid grid-cols-1 gap-2">
        {assessments.length > 0 ? (
          assessments.map((item) => <AssessmentCard key={item._id} item={item} />)
        ) : (
          <p className="text-gray-500 text-sm">No upcoming assessments.</p>
        )}
      </div>
    </div>
  </aside>
);

export default function Dashboard() {
  const { user, streak } = useOutletContext();
  const { notes } = useNotes();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get('/assessments');
        // Take first 3 for right panel
        setAssessments(res.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load assessments", error);
      }
    };
    fetchAssessments();
  }, []);

  // Get top 4 recent notes
  const recentNotes = notes.slice(0, 4);

  return (
    <div className="flex relative">
      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
        <Header user={user} />
        <SearchBar />

        <StudyStreak streak={streak || 0} />

        <div className="mb-10">
          <SectionHeader title="My Uploaded Notes" action="View All" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => <NoteCard key={note._id} note={note} />)
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>No notes uploaded yet.</p>
                <button onClick={() => navigate('/mynotes')} className="text-[#1dc962] font-bold text-sm mt-2 hover:underline">
                  Upload your first note
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Divider */}
      <div className="hidden xl:flex justify-center px-2 sticky top-0 h-screen items-center">
        <div className="w-1 h-[80vh] bg-gradient-to-b via-gray-500 to-transparent rounded-full"></div>
      </div>

      {/* Right Smart Panel */}
      <RightPanel assessments={assessments} />

    </div>
  );
}
