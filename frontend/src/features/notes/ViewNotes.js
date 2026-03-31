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
import api from '../../services/api';


/* ================= CONSTANTS ================= */

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


/* ================= MAIN COMPONENT ================= */

export default function ViewNotes() {

  const { user } = useOutletContext();
  const location = useLocation();

  const { notes, addNote, deleteNote } = useNotes();


  /* ================= STATES ================= */

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [fetchedSubjects, setFetchedSubjects] = useState(SUBJECTS);

  useEffect(() => {
    // Fetch authoritative subjects
    api.get('/notes/subjects')
      .then(res => {
        if (Array.isArray(res.data)) setFetchedSubjects(res.data);
      })
      .catch(err => console.error("Error subjects:", err));
  }, []);


  /* ================= AUTO FILTER ================= */

  useEffect(() => {
    if (location.state?.subject) {
      setSubjectFilter(location.state.subject);
    }
  }, [location.state]);


  /* ================= CLOSE DROPDOWN ================= */

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
      authorName: user?.displayName || "Student"
    });

    setIsUploadOpen(false);
  };


  /* ================= DELETE ================= */

  const handleDelete = async (e, id) => {

    e.stopPropagation();

    if (!window.confirm("Delete this note?")) return;

    await deleteNote(id);
  };


  /* ================= FILE VIEWER ================= */

  const getViewUrl = (note) => {

    if (!note?.fileUrl) return "";

    const ext = note.fileUrl
      .split('.')
      .pop()
      .split('?')[0]
      .toLowerCase();

    const officeTypes = [
      'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'
    ];

    /* Office Files */
    if (officeTypes.includes(ext)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(note.fileUrl)}`;
    }

    /* PDF via Google Viewer */
    if (ext === 'pdf') {
      return `https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`;
    }

    return note.fileUrl;
  };


  /* ================= FILTER NOTES ================= */

  const filteredNotes = notes.filter(note => {

    const title = (note.title || "").toLowerCase();
    const subject = (note.subject || "").toLowerCase();

    const matchesSearch =
      title.includes(search.toLowerCase()) ||
      subject.includes(search.toLowerCase());


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


  /* ================= VISIBILITY TAG ================= */

  const getVisibilityIcon = (note) => {

    if (note.visibility === 'private') {
      return <><FaLock /> Private</>;
    }

    if (note.visibility === 'public_group') {
      return <><FaGlobe className="text-green-600" /> Public</>;
    }

    return <><FaUsers /> Group</>;
  };



  /* ================= UI ================= */

  return (

    <div className="min-h-screen p-8">

      <div className="max-w-6xl mx-auto">


        {/* HEADER */}

        <div className="mb-8">
          <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">

            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                My Notes
              </h1>
              <p className="text-gray-500 text-lg">
                Manage and view your study materials
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 hover:shadow-xl shadow-lg active:scale-95 transition-all duration-200"
            >
              <FaPlus className="transition-transform duration-300 group-hover:rotate-90" />
              Upload Note
            </button>

          </header>
        </div>


        {/* TOOLBAR */}

        <div className="bg-white p-4 rounded-xl shadow border mb-8 flex flex-col lg:flex-row gap-4 justify-between">


          {/* FILTER TABS */}

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


          {/* SEARCH & DROPDOWNS */}

          <div className="flex gap-3 flex-wrap">


            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Subjects</option>
              {fetchedSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
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
                placeholder="Search notes..."
                className="pl-10 pr-4 py-2 rounded-lg border"
              />

              <FaSearch className="absolute left-3 top-3 text-gray-400" />

            </div>

          </div>

        </div>


        {/* NOTES GRID */}

        {filteredNotes.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">


            {filteredNotes.map(note => (

              <div
                key={note._id}
                onClick={() => window.open(getViewUrl(note), '_blank')}
                className="bg-white rounded-2xl border shadow hover:shadow-lg transition-all cursor-pointer relative overflow-hidden p-5 flex flex-col h-60"
              >


                {/* HEADER */}

                <div className="flex justify-between mb-4">

                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                    <FaFilePdf />
                  </div>


                  {/* MENU */}

                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >

                    <button
                      onClick={() =>
                        setActiveMenu(activeMenu === note._id ? null : note._id)
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                    >
                      <FaEllipsisV />
                    </button>


                    {activeMenu === note._id && (

                      <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-xl border z-50">


                        <button
                          onClick={() => window.open(getViewUrl(note), '_blank')}
                          className="w-full px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FaEye /> View Online
                        </button>


                        <button
                          onClick={(e) => handleDelete(e, note._id)}
                          className="w-full px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t"
                        >
                          <FaTrash /> Delete
                        </button>

                      </div>

                    )}

                  </div>

                </div>


                {/* CONTENT */}

                <div className="flex-1">

                  <h3 className="font-bold text-sm mb-1 line-clamp-2">
                    {note.title}
                  </h3>

                  <p className="text-xs text-gray-400">
                    {note.subject}
                  </p>

                </div>


                {/* FOOTER */}

                <div className="text-xs text-gray-400 flex justify-between pt-3 border-t">

                  <span>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-1">
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