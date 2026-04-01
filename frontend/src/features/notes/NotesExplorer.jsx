import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { C } from '../../shared/theme';
import Icon from '../../shared/components/Icon';
import NoteCard from './components/NoteCard';
import NoteSkeleton from './components/NoteSkeleton';
import LockModal from './components/LockModal';
import '../landing/Landing.css'; // Import Landing CSS for background
import './NotesExplorer.css';

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
  const sort = searchParams.get('sort') || 'latest';
  const [page, setPage] = useState(0);

  // Freemium tracking (local session)
  const [viewedNotes, setViewedNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stunotes_viewed')) || []; }
    catch { return []; }
  });
  const FREE_LIMIT = 10;

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
  }, [query, subject, sort, page]);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchNotes(false);
  }, [query, subject, sort, fetchNotes]);

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
    if (note.fileUrl) window.open(note.fileUrl, '_blank');
    const id = note._id || note.id;
    if (viewedNotes.includes(id)) return;
    if (viewedNotes.length >= FREE_LIMIT) {
      setShowLock(true);
      return;
    }
    setViewedNotes(prev => [...prev, id]);
  };

  const handleDownloadNote = (note) => {
    if (note.downloadUrl) window.open(note.downloadUrl, '_blank');
    const id = note._id || note.id;
    if (viewedNotes.includes(id)) return;
    if (viewedNotes.length >= FREE_LIMIT) {
      setShowLock(true);
      return;
    }
    setViewedNotes(prev => [...prev, id]);
  };

  const isLocked = (note, index) => {
    const id = note._id || note.id;
    if (viewedNotes.includes(id)) return false;
    return viewedNotes.length >= FREE_LIMIT || index >= FREE_LIMIT;
  };

  return (
    <div className="ne-root">
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

      <div className="ne-wrap">
        <header className="ne-header">
          <button onClick={() => navigate('/')} className="ne-btn-back">
            <Icon name="search" size={16} /> Back to Home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px',
              padding: '4px 12px', background: 'rgba(126, 200, 200, 0.15)', color: C.teal, borderRadius: 99
            }}>
              ✨ Community Favorite
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
              Join 50k+ students studying smarter
            </span>
          </div>

          <h1 className="ne-title">
            Explore <span style={{
              background: `linear-gradient(135deg, ${C.pink}, ${C.teal})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Notes</span>
          </h1>

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
                onDownload={handleDownloadNote}
              />
            ))
          )}

          {!loading && loadingMore && Array(4).fill(0).map((_, i) => <NoteSkeleton key={i} />)}
        </div>

        {!loading && notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', opacity: 1 }} className="fade-up">
            <div style={{
              width: 100, height: 100, borderRadius: '50%', background: 'rgba(126, 200, 200, 0.1)',
              margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name="doc" size={48} color={C.teal} opacity={0.6} />
            </div>
            <p style={{ marginTop: 16, fontWeight: 900, fontSize: 18, color: '#0f172a' }}>No results found.</p>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 400, margin: '12px auto 24px' }}>
              We couldn't find any notes matching your search. Try adjusting your filters or search terms.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {['Biology', 'Machine Learning', 'Chemistry'].map(term => (
                <button key={term} onClick={() => handleFilterChange('query', term)} className="topic-pill"
                  style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.1)', padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Try "{term}"
                </button>
              ))}
            </div>
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
