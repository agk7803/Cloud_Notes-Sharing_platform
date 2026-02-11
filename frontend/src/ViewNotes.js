import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaFilePdf,
  FaEllipsisV,
  FaLock,
  FaGlobe,
  FaUsers,
  FaTrash,
  FaEye
} from 'react-icons/fa';

import UploadModal from './UploadModal';
import { useNotes } from './NoteContext';
import { useOutletContext, useLocation } from 'react-router-dom';
import { getViewUrl } from './utils/fileViewer';


const SUBJECTS = [
  "Machine Learning",
  "Compiler Design",
  "Computer Networks",
  "Software Engineering",
  "Cloud Computing",
  "Web Engineering",
  "Other"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


/* ================= VIEW NOTES ================= */

export default function ViewNotes() {

  const { user } = useOutletContext();
  const location = useLocation();

  const { notes, addNote, deleteNote } = useNotes();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');


  /* ================= AUTO FILTER ================= */

  useEffect(() => {
    if (location.state?.subject) {
      setSubjectFilter(location.state.subject);
    }
  }, [location.state]);


  /* ================= CLOSE MENU ================= */

  useEffect(() => {
    const close = () => setActiveMenu(null);
    document.addEventListener('click', close);

    return () => document.removeEventListener('click', close);
  }, []);


  /* ================= UPLOAD ================= */

  const handleSubmit = (noteData) => {

    addNote({
      ...noteData,
      authorId: user?.uid,
      authorName: user?.displayName || 'Student'
    });

    setIsUploadOpen(false);
  };


  /* ================= DELETE ================= */

  const handleDelete = async (e, id) => {

    e.stopPropagation();

    if (!window.confirm("Delete this note?")) return;

    await deleteNote(id);
  };


  /* ================= ONLINE VIEWER ================= */

  const getViewUrl = (fileUrl) => {

    if (!fileUrl) return "";

    const ext = fileUrl
      .split('.')
      .pop()
      .split('?')[0]
      .toLowerCase();

    const officeTypes = [
      'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'
    ];

    // Office → Microsoft Viewer
    if (officeTypes.includes(ext)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }

    // PDF / Image / Others → Google Viewer
    return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };


  /* ================= FILTER ================= */

  const filteredNotes = notes.filter(note => {

    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.subject.toLowerCase().includes(search.toLowerCase());


    let matchesFilter = true;

    if (filter === 'private') {
      matchesFilter = note.visibility === 'private';
    }

    if (filter === 'shared') {
      matchesFilter =
        note.visibility === 'public' ||
        note.visibility === 'groups' ||
        note.visibility === 'public_group';
    }


    const matchesSubject =
      subjectFilter ? note.subject === subjectFilter : true;


    let matchesMonth = true;

    if (monthFilter) {
      const d = new Date(note.createdAt);

      if (!isNaN(d)) {
        matchesMonth =
          d.toLocaleString('default', { month: 'long' }) === monthFilter;
      }
    }

    return (
      matchesSearch &&
      matchesFilter &&
      matchesSubject &&
      matchesMonth
    );
  });


  /* ================= VISIBILITY ================= */

  const getVisibilityIcon = (note) => {

    if (note.visibility === 'private') {
      return <><FaLock /> Private</>;
    }

    if (note.visibility === 'public_group') {
      return <><FaGlobe className="text-green-600" /> Public</>;
    }

    return <><FaUsers /> Group</>;
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


        {/* HEADER */}

        <header className="mb-8 flex justify-between items-end">

          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="text-gray-500">View and manage notes</p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold"
          >
            <FaPlus /> Upload Note
          </button>

        </header>


        {/* TOOLBAR */}

        <div className="bg-white p-4 rounded-xl shadow border mb-8 flex flex-col lg:flex-row gap-4">

          {/* Tabs */}

          <div className="flex gap-2">

            {['All', 'Private', 'Shared'].map(tab => (

              <button
                key={tab}
                onClick={() => setFilter(tab.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-bold
                ${filter === tab.toLowerCase()
                    ? 'bg-white text-green-600 shadow'
                    : 'text-gray-400'
                  }`}
              >
                {tab}
              </button>

            ))}

          </div>


          {/* Filters */}

          <div className="flex gap-3 flex-wrap">

            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>


            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border"
            >
              <option value="">All Months</option>
              {MONTHS.map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>


            <div className="relative">

              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border"
              />

              <FaSearch className="absolute left-3 top-3 text-gray-400" />

            </div>

          </div>

        </div>


        {/* GRID */}

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

                  )}

                  </div>


                  {/* CONTENT */}

                  <div className="flex gap-3 mb-3">

                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                      <FaFilePdf />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm">
                        {note.title}
                      </h3>

                      <p className="text-xs text-gray-400">
                        {note.subject}
                      </p>
                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="text-xs text-gray-400 flex justify-between">

                    <span>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>

                    <span>
                      {getVisibilityIcon(note)}
                    </span>

                  </div>

                </div>

              ))}

          </div>

        ) : (

          <p className="text-center text-gray-400 py-20">
            No notes found.
          </p>

        )}


        {/* UPLOAD MODAL */}

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