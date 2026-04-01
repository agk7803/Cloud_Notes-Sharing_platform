import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import UploadModal from './UploadModal';
import { useNotes } from './NoteContext';
import { useOutletContext, useLocation } from 'react-router-dom';
import api from '../../services/api';
import NoteCard from './components/NoteCard';
import NoteSkeleton from './components/NoteSkeleton';
import '../landing/Landing.css'; // True Landing Page UI tokens
import { C } from '../../shared/theme'; // High-authority gradients

const SUBJECTS = [
  "Machine Learning", "Compiler Design", "Computer Networks", 
  "Software Engineering", "Cloud Computing", "Other"
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
  const [pubSearchFocused, setPubSearchFocused] = useState(false);
  
  // Public notes fetching
  const [publicNotes, setPublicNotes] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [hasFetchedPublic, setHasFetchedPublic] = useState(false); 

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
    <div className="relative overflow-x-clip" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ══════ EXACT LANDING HERO BACKGROUND (FIXED TO VIEWPORT) ══════ */}
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: 0, 
        background: 'linear-gradient(135deg,#e8faf0 0%,#f0fdf8 40%,#fce7f3 75%,#ccfbf1 100%)'
      }} />
      <div className="ln-grid" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
      <div className="ln-bg" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div className="ln-blob-teal" />
        <div className="ln-blob-pink" />
        <div className="ln-blob-sage" />
      </div>

      {/* ══════ DASHBOARD CONTENT ══════ */}
      <div style={{ position: 'relative', zIndex: 10, padding: '60px 24px 100px', flex: 1 }}>
          <div className="max-w-6xl mx-auto">
            
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10 fade-up">
              <div className="space-y-2">
                <h1 style={{
                  fontSize: 'clamp(32px,5vw,46px)', fontWeight: 900, lineHeight: 1.15,
                  letterSpacing: '-1.5px', color: '#0f172a'
                }}>
                  Notes{' '}
                  <span style={{ 
                    color: C.teal,
                    display: 'inline-block'
                  }}>
                    Library
                  </span>
                </h1>
                <p style={{ fontSize: 16, color: '#4b5563', fontWeight: 600 }}>
                   Manage your private notes or explore the public community.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="btn-press"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                  borderRadius: 16, background: '#111',
                  color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
                  boxShadow: `0 8px 24px rgba(0,0,0,0.15)`, alignSelf: 'flex-start'
                }}
              >
                <FaPlus />
                Upload Note
              </button>
            </header>

            {/* TAB BAR ALIGNMENT */}
            <div className="fade-up fade-up-1" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
               {['My Notes', 'Public', 'Private'].map(tab => (
                   <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="topic-pill btn-press"
                      style={{
                        padding: '10px 24px', 
                        borderRadius: 14, 
                        fontSize: 13, 
                        fontWeight: 800, 
                        border: '1px solid rgba(15, 23, 42, 0.12)',
                        background: activeTab === tab ? '#111' : 'rgba(255,255,255,0.7)',
                        color: activeTab === tab ? '#fff' : '#0f172a',
                        boxShadow: activeTab === tab ? `0 8px 20px rgba(0,0,0,0.15)` : '0 4px 12px rgba(15, 23, 42, 0.04)',
                        backdropFilter: activeTab === tab ? 'none' : 'blur(16px)',
                        cursor: 'pointer'
                      }}
                   >
                      {tab}
                   </button>
               ))}
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className={`fade-up fade-up-2 glass-search ${pubSearchFocused ? 'search-focus' : ''}`} style={{ 
              display: 'flex', flexDirection: 'column', gap: 16,
              borderRadius: 24, padding: '16px 24px', marginBottom: '40px',
              position: 'relative', zIndex: 2
            }}>
              <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
                
                <div className="relative flex-1 w-full" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FaSearch style={{ color: C.teal, fontSize: 20 }} />
                  <input
                    type="text"
                    value={search}
                    onFocus={() => setPubSearchFocused(true)}
                    onBlur={() => setPubSearchFocused(false)}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search your library..."
                    style={{
                      flex: 1, border: 'none', outline: 'none', fontSize: 16, color: '#0f172a',
                      fontFamily: 'inherit', fontWeight: 600, background: 'transparent'
                    }}
                  />
                </div>

                <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                  <select
                    value={subjectFilter}
                    onChange={e => setSubjectFilter(e.target.value)}
                    className="topic-pill"
                    style={{
                      padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(15, 23, 42, 0.12)',
                      background: 'rgba(255,255,255,0.7)', color: '#0f172a', fontWeight: 800, fontSize: 12,
                      outline: 'none', cursor: 'pointer', appearance: 'auto'
                    }}
                  >
                    <option value="">All Subjects</option>
                    {fetchedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <select
                    value={monthFilter}
                    onChange={e => setMonthFilter(e.target.value)}
                    className="topic-pill"
                    style={{
                      padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(15, 23, 42, 0.12)',
                      background: 'rgba(255,255,255,0.7)', color: '#0f172a', fontWeight: 800, fontSize: 12,
                      outline: 'none', cursor: 'pointer', appearance: 'auto'
                    }}
                  >
                    <option value="">All Months</option>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>

              </div>
            </div>

            {/* DYNAMIC RESULTS GRID */}
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-up fade-up-3">
                  {Array(6).fill(0).map((_, i) => <NoteSkeleton key={i} />)}
               </div>
            ) : filteredNotes.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 fade-up fade-up-3">
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
               <div className="fade-up fade-up-3 text-center py-20 bg-white/60 rounded-[32px] border border-dashed border-gray-300 shadow-sm backdrop-blur-md">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `rgba(13, 148, 136, 0.1)` }}>
                     <FaSearch className="text-3xl" style={{ color: C.teal }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Notes Found</h3>
                  <p className="text-gray-600 font-semibold max-w-sm mx-auto">
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
    </div>
  );
}