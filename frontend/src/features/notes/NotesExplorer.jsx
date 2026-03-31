import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { C } from '../../shared/theme';
import Icon from '../../shared/components/Icon';
import NoteCard from './components/NoteCard';
import NoteSkeleton from './components/NoteSkeleton';
import LockModal from './components/LockModal';
import './NotesExplorer.css';

const FILE_TYPES = ["All Types", "PDF", "PPT", "DOCX", "Image"];
const DIFFICULTIES = ["All Levels", "Easy", "Medium", "Hard"];
const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" }
];

export default function NotesExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [showLock, setShowLock] = useState(false);
  
  // Filters (Synced with URL)
  const query = searchParams.get('query') || '';
  const subject = searchParams.get('subject') || '';
  const fileType = searchParams.get('fileType') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const sort = searchParams.get('sort') || 'latest';
  const [page, setPage] = useState(0);

  // Freemium tracking (local session)
  const [viewedNotes, setViewedNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stunotes_viewed')) || []; }
    catch { return []; }
  });
  const FREE_LIMIT = 3;

  useEffect(() => {
    localStorage.setItem('stunotes_viewed', JSON.stringify(viewedNotes));
    localStorage.setItem('notes_viewed_count', viewedNotes.length.toString());
  }, [viewedNotes]);

  // Fetch Subjects
  useEffect(() => {
    api.get('/notes/subjects')
      .then(res => setSubjects(res.data))
      .catch(err => console.error("Subjects fetch error:", err));
  }, []);

  // Main Fetch Logic
  const fetchNotes = useCallback(async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page + 1 : 0;
    const limit = 12;
    const skip = currentPage * limit;

    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = {
        query,
        subject: subject !== 'All Subjects' ? subject : '',
        fileType: fileType !== 'All Types' ? fileType : '',
        difficulty: difficulty !== 'All Levels' ? difficulty.toLowerCase() : '',
        sort,
        limit,
        skip
      };

      const res = await api.get('/notes/public', { params });
      
      if (isLoadMore) {
        setNotes(prev => [...prev, ...res.data.notes]);
        setPage(currentPage);
      } else {
        setNotes(res.data.notes || []);
        setPage(0);
      }
      
      setTotal(res.data.total);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, subject, fileType, difficulty, sort, page]);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchNotes(false);
  }, [query, subject, fileType, difficulty, sort, fetchNotes]);

  // Handlers
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All Subjects' && value !== 'All Types' && value !== 'All Levels') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set('query', val);
    else newParams.delete('query');
    setSearchParams(newParams);
  };

  const handleViewNote = (note) => {
    const id = note._id || note.id;
    if (viewedNotes.includes(id)) {
        if (note.fileUrl) window.open(note.fileUrl, '_blank');
        return;
    }
    if (viewedNotes.length >= FREE_LIMIT) {
        setShowLock(true);
        return;
    }
    setViewedNotes(prev => [...prev, id]);
    if (note.fileUrl) window.open(note.fileUrl, '_blank');
  };

  const isLocked = (note, index) => {
    const id = note._id || note.id;
    if (viewedNotes.includes(id)) return false;
    return viewedNotes.length >= FREE_LIMIT || index >= FREE_LIMIT;
  };

  return (
    <div className="ne-root">
      <div className="ne-bg">
        <div className="ne-bg__blob" style={{ background: 'rgba(126, 200, 200, 0.2)', top: '10%', left: '5%', width: '40vw', height: '40vw' }} />
        <div className="ne-bg__blob" style={{ background: 'rgba(249, 168, 201, 0.15)', bottom: '10%', right: '5%', width: '35vw', height: '35vw', animationDelay: '-5s' }} />
      </div>
      <div className="ne-grid" />

      <div className="ne-wrap">
        <header className="ne-header">
          <button onClick={() => navigate('/')} style={{ 
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', 
              color: 'var(--ne-muted)', fontWeight: 700, cursor: 'pointer', marginBottom: 20 
          }}>
            <Icon name="search" size={16} /> Back to Home
          </button>
          <h1 className="ne-title">Explore <span style={{ color: C.teal }}>Notes</span></h1>
          <p className="ne-subtitle">Browse thousands of high-quality study materials shared by students worldwide.</p>
        </header>

        <section className="ne-controls">
          <div className="ne-search-box">
            <Icon name="search" size={20} color={C.teal} />
            <input 
              type="text" 
              className="ne-search-input" 
              placeholder="Search by title, subject, or keywords..." 
              value={query}
              onChange={handleSearch}
            />
          </div>

          <div className="ne-filters">
            <select className="ne-select" value={subject || 'All Subjects'} onChange={(e) => handleFilterChange('subject', e.target.value)}>
              <option>All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select className="ne-select" value={fileType || 'All Types'} onChange={(e) => handleFilterChange('fileType', e.target.value)}>
              {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select className="ne-select" value={difficulty || 'All Levels'} onChange={(e) => handleFilterChange('difficulty', e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select className="ne-select" value={sort} onChange={(e) => handleFilterChange('sort', e.target.value)} style={{ marginLeft: 'auto' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort by: {o.label}</option>)}
            </select>
          </div>
        </section>

        <div className="ne-results-info">
          <span className="ne-count">
            {loading ? 'Searching...' : `${total} notes found`}
            {query && <span style={{ color: C.teal }}> for "{query}"</span>}
          </span>
        </div>

        <div className="ne-grid-container">
          {loading ? (
            Array(8).fill(0).map((_, i) => <NoteSkeleton key={i} />)
          ) : (
            notes.map((note, i) => (
              <NoteCard 
                key={note._id} 
                note={note} 
                index={i} 
                isExplorer={true}
                locked={isLocked(note, i)}
                onLock={() => setShowLock(true)}
                onView={handleViewNote}
              />
            ))
          )}
          
          {!loading && loadingMore && Array(4).fill(0).map((_, i) => <NoteSkeleton key={i} />)}
        </div>

        {!loading && notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
            <Icon name="doc" size={48} />
            <p style={{ marginTop: 16, fontWeight: 700 }}>No results found.</p>
            <p style={{ fontSize: 13 }}>Try adjusting your filters or search terms.</p>
          </div>
        )}

        {hasMore && !loading && (
          <div className="ne-footer">
            <button className="ne-btn-load" onClick={() => fetchNotes(true)} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load More Notes'}
            </button>
          </div>
        )}
      </div>

      {showLock && <LockModal onClose={() => setShowLock(false)} freeUsed={viewedNotes.length} />}
    </div>
  );
}
