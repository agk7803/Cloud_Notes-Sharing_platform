import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import UploadModal from './UploadModal';
import { useNotes } from './NoteContext';
import { useOutletContext, useLocation } from 'react-router-dom';
import api from '../../services/api';
import NoteCard from './components/NoteCard';
import NoteSkeleton from './components/NoteSkeleton';

const SUBJECTS = [
  "Machine Learning", "Compiler Design", "Computer Networks", 
  "Software Engineering", "Cloud Computing", "Web Engineering", "Other"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ViewNotes() {
  const { user } = useOutletContext();
  const location = useLocation();
  const { notes: myAllNotes, addNote, deleteNote, loading: contextLoading } = useNotes();

  // State
  const [activeTab, setActiveTab] = useState('My Notes'); // 'My Notes', 'Public', 'Private'
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Public notes fetching
  const [publicNotes, setPublicNotes] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [hasFetchedPublic, setHasFetchedPublic] = useState(false); // New explicit tracking

  // Filters
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [fetchedSubjects, setFetchedSubjects] = useState(SUBJECTS);

  // Fetch subjects globally
  useEffect(() => {
    api.get('/notes/subjects')
      .then(res => { if (Array.isArray(res.data)) setFetchedSubjects(res.data); })
      .catch(err => console.error("Error subjects:", err));
  }, []);

  useEffect(() => {
    if (location.state?.subject) setSubjectFilter(location.state.subject);
  }, [location.state]);

  // Fetch global public notes dynamically when active
  useEffect(() => {
    if (activeTab === 'Public' && !hasFetchedPublic) {
      setPublicLoading(true);
      api.get('/notes/public?limit=100') // fetch public platform notes
        .then(res => {
           setPublicNotes(res.data.notes || []);
           setHasFetchedPublic(true);
        })
        .catch(err => console.error("Error fetching public notes:", err))
        .finally(() => setPublicLoading(false));
    }
  }, [activeTab, hasFetchedPublic]);

  const handleSubmit = (noteData) => {
    // 1. Sync to My Notes context immediately 
    addNote({
      ...noteData,
      authorId: user?.uid,
      authorName: user?.displayName || "Student"
    });
    
    // 2. Sync to local Public cache if applicable (EVEN if uploaded from My Notes tab)
    if (noteData.visibility === 'public' && hasFetchedPublic) {
      setPublicNotes(prev => [noteData, ...prev]);
    }
    
    setIsUploadOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this note?")) return;
    await deleteNote(id);
    if (activeTab === 'Public') {
      setPublicNotes(prev => prev.filter(n => n._id !== id && n.id !== id));
    }
  };

  // High-authority office/pdf previewer
  const getViewUrl = (note) => {
    if (!note?.fileUrl) return "";
    const ext = note.fileUrl.split('.').pop().split('?')[0].toLowerCase();
    const officeTypes = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    if (officeTypes.includes(ext)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(note.fileUrl)}`;
    }
    if (ext === 'pdf') {
      return `https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`;
    }
    return note.fileUrl;
  };

  const handleView = (note) => {
     window.open(getViewUrl(note), '_blank');
  };

  const handleDownload = (note) => {
    if (note.downloadUrl) window.open(note.downloadUrl, '_blank');
    else window.open(note.fileUrl, '_blank');
  };

  // Select Data Based on Strict Tab Definitions
  let currentData = [];
  let isLoading = false;

  if (activeTab === 'My Notes') {
    currentData = myAllNotes; // Show ALL notes uploaded by the current user (Private + Public)
    isLoading = contextLoading;
  } else if (activeTab === 'Private') {
    currentData = myAllNotes.filter(n => n.visibility === 'private'); // ONLY current user's private
    isLoading = contextLoading;
  } else if (activeTab === 'Public') {
    currentData = publicNotes; // ALL public notes on the platform
    isLoading = publicLoading;
  }

  // Filter Data via Search/Subject parameters
  const filteredNotes = currentData.filter(note => {
    const title = (note.title || "").toLowerCase();
    const subject = (note.subject || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase()) || subject.includes(search.toLowerCase());
    const matchesSubject = subjectFilter ? note.subject === subjectFilter : true;
    
    let matchesMonth = true;
    if (monthFilter) {
      const d = new Date(note.createdAt);
      if (!isNaN(d)) {
        matchesMonth = d.toLocaleString('default', { month: 'long' }) === monthFilter;
      }
    }
    return matchesSearch && matchesSubject && matchesMonth;
  });

  return (
      <div className="min-h-screen p-8 bg-gray-50/20">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                  Notes Library
                </h1>
                <p className="text-gray-500 text-lg">
                  Organize, discover, and manage your academic resources
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1dc962] text-white font-bold hover:bg-green-600 hover:shadow-xl shadow-green-200 shadow-lg active:scale-95 transition-all duration-200"
              >
                <FaPlus className="transition-transform duration-300 group-hover:rotate-90" />
                Upload Note
              </button>
            </header>
          </div>

          {/* TAB BAR ALIGNMENT */}
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6 w-fit">
             {['My Notes', 'Public', 'Private'].map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab ? 'bg-[#1dc962] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                 >
                    {tab}
                 </button>
             ))}
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-8 flex flex-col lg:flex-row gap-4 justify-between">
            <h3 className="text-gray-400 font-bold self-center px-2 uppercase tracking-widest text-xs hidden lg:block">Filters</h3>
            <div className="flex gap-3 flex-wrap w-full lg:w-auto">
              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1dc962] outline-none bg-gray-50 text-sm font-semibold text-gray-700"
              >
                <option value="">All Subjects</option>
                {fetchedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1dc962] outline-none bg-gray-50 text-sm font-semibold text-gray-700"
              >
                <option value="">All Months</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>

              <div className="relative flex-1 lg:flex-none">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#1dc962] outline-none bg-gray-50 font-semibold text-sm"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* DYNAMIC RESULTS GRID */}
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => <NoteSkeleton key={i} />)}
             </div>
          ) : filteredNotes.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {filteredNotes.map((note, i) => {
                   const isOwnNote = note.authorId === user?.uid;
                   return (
                     <NoteCard 
                        key={note._id || i}
                        note={note}
                        index={i}
                        locked={false}
                        onView={handleView}
                        onDownload={handleDownload}
                        onDelete={isOwnNote ? handleDelete : null}
                     />
                   );
                })}
             </div>
          ) : (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FaSearch className="text-3xl text-green-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Notes Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                   There are no notes available in the "{activeTab}" tab matching your current filters.
                </p>
             </div>
          )}

          {/* MODALS */}
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