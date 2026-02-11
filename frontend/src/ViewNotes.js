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


  /* ================= UI ================= */

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

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">

            {filteredNotes.map(note => (

              <div
                key={note._id}
                onClick={() =>
                  window.open(
                    getViewUrl(note.fileUrl),
                    '_blank'
                  )
                }
                className="bg-white border rounded-xl p-5 shadow hover:shadow-lg cursor-pointer relative"
              >

                {/* MENU */}

                <div
                  className="absolute top-3 right-3"
                  onClick={e => e.stopPropagation()}
                >

                  <button
                    onClick={() =>
                      setActiveMenu(
                        activeMenu === note._id ? null : note._id
                      )
                    }
                  >
                    <FaEllipsisV />
                  </button>


                  {activeMenu === note._id && (

                    <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow z-50">

                      <button
                        onClick={() =>
                          window.open(
                            getViewUrl(note.fileUrl),
                            '_blank'
                          )
                        }
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <FaEye /> View Online
                      </button>


                      <button
                        onClick={(e) => handleDelete(e, note._id)}
                        className="block px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <FaTrash /> Delete
                      </button>

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