import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaFilePdf, FaEllipsisV, FaLock, FaGlobe, FaUsers, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import UploadModal from './UploadModal';
import { useNotes } from './NoteContext';
import { useOutletContext, useLocation } from 'react-router-dom';

const SUBJECTS = ["Machine Learning", "Compiler Design", "Computer Networks", "Software Engineering", "Cloud Computing", "Web Engineering", "Other"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SUBJECT_THEMES = {
  "Machine Learning": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: "from-blue-50 to-indigo-50", hover: "hover:border-blue-300", shadow: "hover:shadow-blue-500/5", tagBg: "bg-blue-100", tagText: "text-blue-700", pastel: "bg-blue-200" },
  "Compiler Design": { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", icon: "from-red-50 to-orange-50", hover: "hover:border-red-300", shadow: "hover:shadow-red-500/5", tagBg: "bg-red-100", tagText: "text-red-700", pastel: "bg-red-200" },
  "Computer Networks": { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", icon: "from-purple-50 to-pink-50", hover: "hover:border-purple-300", shadow: "hover:shadow-purple-500/5", tagBg: "bg-purple-100", tagText: "text-purple-700", pastel: "bg-purple-200" },
  "Software Engineering": { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100", icon: "from-yellow-50 to-amber-50", hover: "hover:border-yellow-300", shadow: "hover:shadow-yellow-500/5", tagBg: "bg-yellow-100", tagText: "text-yellow-700", pastel: "bg-yellow-200" },
  "Cloud Computing": { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100", icon: "from-cyan-50 to-sky-50", hover: "hover:border-cyan-300", shadow: "hover:shadow-cyan-500/5", tagBg: "bg-cyan-100", tagText: "text-cyan-700", pastel: "bg-cyan-200" },
  "Web Engineering": { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-100", icon: "from-pink-50 to-rose-50", hover: "hover:border-pink-300", shadow: "hover:shadow-pink-500/5", tagBg: "bg-pink-100", tagText: "text-pink-700", pastel: "bg-pink-200" },
  "Other": { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100", icon: "from-gray-50 to-slate-50", hover: "hover:border-gray-300", shadow: "hover:shadow-gray-500/5", tagBg: "bg-gray-100", tagText: "text-gray-700", pastel: "bg-gray-200" }
};

export default function ViewNotes() {
  const { user } = useOutletContext();
  const location = useLocation(); // Hook for navigation state
  const { notes, addNote, deleteNote } = useNotes();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState('all'); // all, private, shared
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  // Dropdown Management
  const [activeMenu, setActiveMenu] = useState(null);

  // Auto-filter based on navigation state (e.g. from Assessments)
  useEffect(() => {
    if (location.state && location.state.subject) {
      setSubjectFilter(location.state.subject);
      // Optional: scroll to filters or show a toast
    }
  }, [location.state]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = (noteData) => {
    addNote({
      ...noteData,
      authorId: user?.uid,
      authorName: user?.displayName || 'Student'
    });
    setIsUploadOpen(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent opening the note
    if (window.confirm("Are you sure you want to delete this note?")) {
      await deleteNote(id);
    }
  };

  const handleDownload = (e, url) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `Note-${Date.now()}.pdf`; // Browser might ignore this for cross-origin, but worth a try
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || note.subject.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;
    if (filter === 'private') {
      matchesFilter = note.visibility === 'private';
    } else if (filter === 'shared') {
      // Show notes that are public OR shared with groups
      matchesFilter = note.visibility === 'public' || note.visibility === 'groups' || note.visibility === 'public_group';
    }
    // 'all' shows everything user authored (default from useNotes) or has access to (if we fetched shared ones)

    const matchesSubject = subjectFilter ? note.subject === subjectFilter : true;

    // Parse date for filtering (Assumes "Feb 08, 2026" format from MOCK or Date string)
    let matchesMonth = true;
    if (monthFilter) {
      const noteDate = new Date(note.date || note.createdAt);
      if (!isNaN(noteDate)) {
        matchesMonth = noteDate.toLocaleString('default', { month: 'long' }) === monthFilter;
      }
    }

    return matchesSearch && matchesFilter && matchesSubject && matchesMonth;
  });

  const getVisibilityIcon = (note) => {
    if (note.visibility === 'private' || note.visibility === 'private_group') {
      return <><FaLock className="text-gray-400" /> <span className="text-[10px]">Private Group</span></>;
    }
    if (note.visibility === 'public_group') {
      return <><FaGlobe className="text-[#1dc962]" /> <span className="text-[10px] text-[#1dc962]">Public Group</span></>;
    }
    // Fallback/Legacy
    return <><FaUsers className="text-black" /> <span className="text-[10px] text-gray-700">Group Shared</span></>;
  };

  const getViewUrl = (note) => {
    // Extract file extension
    const extension = note.s3Key ? note.s3Key.split('.').pop().toLowerCase() : note.fileUrl.split('.').pop().split('?')[0].toLowerCase();

    const officeTypes = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

    if (officeTypes.includes(extension)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(note.fileUrl)}`;
    }

    return note.fileUrl;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <p className="text-gray-500 mt-1">Manage, share, and access your study materials.</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 flex items-center gap-2 active:scale-95 transform"
          >
            <FaPlus /> Upload Note
          </button>
        </header>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">

          {/* Left: Tab Filters */}
          <div className="flex gap-2 p-1.5 bg-gray-50 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Private', 'Shared'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab.toLowerCase())}
                className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === tab.toLowerCase()
                  ? 'bg-white text-[#1dc962] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right: Search & Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-wrap">
            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
            >
              <option value="">All Months</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
              />
              <FaSearch className="absolute left-3.5 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map(note => {
              const theme = SUBJECT_THEMES[note.subject] || SUBJECT_THEMES["Other"];

              return (
                <div
                  key={note._id || note.id}
                  onClick={() => window.open(getViewUrl(note), '_blank')}
                  className={`${theme.bg} rounded-2xl border ${theme.border} ${theme.hover} hover:shadow-xl ${theme.shadow} transition-all group flex flex-col h-64 cursor-pointer relative overflow-hidden`}
                >
                  {/* Pastel Header Background */}
                  <div className={`absolute top-0 left-0 w-full h-32 ${theme.pastel}`}></div>

                  <div className="p-5 flex flex-col h-full relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 relative">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.icon} ${theme.text} flex items-center justify-center text-xl shadow-inner`}>
                        <FaFilePdf />
                      </div>

                      {/* 3 Dots Menu */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === note._id ? null : note._id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                          <FaEllipsisV />
                        </button>

                        {/* Dropdown */}
                        {activeMenu === note._id && (
                          <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                            <button onClick={() => window.open(getViewUrl(note), '_blank')} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2">
                              <FaEye /> View Online
                            </button>
                            <button onClick={(e) => handleDownload(e, note.fileUrl)} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2">
                              <FaDownload /> Download
                            </button>
                            <button onClick={(e) => handleDelete(e, note._id)} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-bold text-gray-900 mb-2 group-hover:${theme.text.split(' ')[0]} transition-colors line-clamp-2 leading-tight`}>{note.title}</h3>

                      {/* Subject Tag */}
                      <div className={`inline-block px-2.5 py-1 rounded-md ${theme.tagBg} border ${theme.border}`}>
                        <p className={`text-[10px] font-bold ${theme.tagText}`}>{note.subject}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
                      <span>{new Date(note.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {note.size || '1.2 MB'}</span>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                        {getVisibilityIcon(note)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300 text-4xl shadow-inner">
              <FaFilePdf />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">No notes found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              No notes match your filters. Try adjusting the search or filters, or upload a new note.
            </p>
          </div>
        )}

        {isUploadOpen && (
          <UploadModal
            onClose={() => setIsUploadOpen(false)}
            onUpload={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}