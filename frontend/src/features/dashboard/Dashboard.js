import React, { useEffect, useState, useRef } from "react";

import { useOutletContext, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBell,
  FaFire,
  FaFilePdf
} from "react-icons/fa";

import MiniCalendar from '../../shared/MiniCalendar';
import api from '../../services/api';
import { useNotes } from '../notes/NoteContext';



/* ================= FILE VIEWER ================= */

const getViewUrl = (url) => {
  if (!url) return "";

  const ext = url
    .split(".")
    .pop()
    .split("?")[0]
    .toLowerCase();

  const office = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"];

  // Office files → Microsoft Viewer
  if (office.includes(ext)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      url
    )}`;
  }

  // PDF → Google Viewer
  if (ext === "pdf") {
    return `https://docs.google.com/gview?url=${encodeURIComponent(
      url
    )}&embedded=true`;
  }

  return url;
};


/* ================= HEADER ================= */

const Header = ({ user }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Ready to learn,{" "}
            <span className="text-[#1dc962]">
              {user?.name?.split(" ")[0] || "Student"}
            </span>
            ?
          </h1>
          <p className="text-gray-500 text-lg">
            Good to see you back. Let's make progress today!
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* Notifications */}
          <div className="relative">

            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-3 bg-white rounded-xl shadow-sm hover:text-[#1dc962] border border-gray-100 transition-all"
            >
              <FaBell />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <h4 className="font-bold mb-2">Notifications</h4>
                <p className="text-sm text-gray-600">
                  No new notifications
                </p>
              </div>
            )}

          </div>

          {/* Profile */}
          <div
            onClick={() => navigate("/profile")}
            className="w-11 h-11 rounded-full bg-white p-0.5 cursor-pointer shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">

              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-[#1dc962] font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}

            </div>
          </div>

        </div>

      </header>
    </div>
  );
};

/* ================= SECTION HEADER ================= */

const SectionHeader = ({ title, route }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-5">

      <h2 className="text-xl font-bold text-gray-800">
        {title}
      </h2>

      {route && (
        <button
          onClick={() => navigate(route)}
          className="text-sm font-semibold text-[#1dc962] hover:underline"
        >
          View All
        </button>
      )}

    </div>
  );
};


/* ================= STREAK ================= */

const StudyStreak = ({ streak }) => (
  <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 rounded-3xl text-white mb-8">

    <div className="flex justify-between items-center">

      <div>
        <h3 className="text-2xl font-bold">
          {streak} Day Streak!
        </h3>
        <p>Keep it up 🔥</p>
      </div>

      <FaFire className="text-4xl" />

    </div>

  </div>
);


/* ================= NOTE CARD ================= */

const NoteCard = ({ note }) => {

  const openNote = () => {
    const url = getViewUrl(note.fileUrl);
    window.open(url, "_blank");
  };

  return (
    <div
      onClick={openNote}
      className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer"
    >

      <div className="flex gap-3">

        <div className="w-10 h-10 bg-green-50 text-[#1dc962] rounded-lg flex items-center justify-center">
          <FaFilePdf />
        </div>

        <div>
          <h4 className="font-bold text-sm">
            {note.title}
          </h4>

          <p className="text-xs text-gray-400">
            {new Date(note.createdAt).toLocaleDateString()}
          </p>
        </div>

      </div>

    </div>
  );
};


/* ================= ASSESSMENT CARD ================= */

const AssessmentCard = ({ item }) => (
  <div className="bg-white p-4 rounded-xl border shadow-sm flex gap-3 mb-3">

    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-[#1dc962] font-bold">
      A
    </div>

    <div>
      <h4 className="font-bold text-sm">
        {item.title}
      </h4>

      <p className="text-xs text-gray-500">
        {item.type}
      </p>
    </div>

  </div>
);


/* ================= RIGHT PANEL ================= */

const RightPanel = ({ assessments }) => (
  <aside className="hidden xl:flex w-[360px] p-6 flex-col gap-8 sticky top-0 h-screen">

    <div className="bg-white rounded-3xl shadow border">
      <MiniCalendar />
    </div>

    <div className="bg-white rounded-3xl shadow border p-6">

      <SectionHeader
        title="Upcoming Assessments"
        route="/assessments"
      />

      {assessments.length > 0 ? (
        assessments.map(a => (
          <AssessmentCard key={a._id} item={a} />
        ))
      ) : (
        <p className="text-gray-500 text-sm">
          No upcoming assessments.
        </p>
      )}

    </div>

  </aside>
);

const SearchBar = ({ notes }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const filtered = notes.filter((note) =>
      note.title?.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered.slice(0, 5));
    setShowDropdown(true);
  }, [query, notes]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full mb-8" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
        placeholder="Search for notes..."
        className="w-full pl-12 pr-4 py-4 rounded-2xl border shadow-sm focus:ring-2 focus:ring-[#1dc962]"
      />

      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      {showDropdown && results.length > 0 && (
        <div className="absolute w-full bg-white border rounded-xl shadow-lg mt-2 z-50">
          {results.map((note) => (
            <div
              key={note._id}
              onClick={() => {
                const url = getViewUrl(note.fileUrl);
                window.open(url, "_blank");
                setShowDropdown(false);
              }}

              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {note.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= MAIN DASHBOARD ================= */

export default function Dashboard() {

  const { user, streak } = useOutletContext();
  const { notes } = useNotes();

  const [assessments, setAssessments] = useState([]);


  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get('/assessments');
        // Sort by most recent first
        const sorted = (res.data || []).sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setAssessments(sorted.slice(0, 2));
      } catch (err) {
        console.error(err);
      }
    };

    fetchAssessments();
  }, []);


  const recentNotes = notes.slice(0, 4);


  return (
    <div className="flex relative">

      {/* MAIN */}

      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto">

        <Header user={user} />

        <SearchBar notes={notes} />


        <StudyStreak streak={streak || 0} />


        {/* NOTES */}

        <div className="mb-10">

          <SectionHeader
            title="My Uploaded Notes"
            route="/view"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {recentNotes.length > 0 ? (
              recentNotes.map(note => (
                <NoteCard key={note._id} note={note} />
              ))
            ) : (
              <p className="text-gray-400">
                No notes uploaded yet.
              </p>
            )}

          </div>

        </div>

      </main>


      {/* SIDE */}

      <RightPanel assessments={assessments} />

    </div>
  );
}