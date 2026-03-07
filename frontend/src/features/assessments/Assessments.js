import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../services/api";
import {
  FaClock, FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp,
  FaBookOpen, FaPlayCircle, FaFileAlt, FaTrophy,
  FaPlus, FaTimes, FaTrash
} from 'react-icons/fa';
import { useUser } from '../../shared/UserContext';

import '../../styles/Assessments.css';


const SUBJECTS = ["Machine Learning", "Compiler Design", "Computer Networks", "Software Engineering", "Cloud Computing", "Web Engineering"];

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

export default function Assessments() {
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [userNotes, setUserNotes] = useState([]);

  const [generatedTests, setGeneratedTests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userResults, setUserResults] = useState([]);

  const [genSubject, setGenSubject] = useState(SUBJECTS[0]);
  const [genType, setGenType] = useState("mcq");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionsCount, setQuestionsCount] = useState(10);
  const [shuffle, setShuffle] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();
  const { user, refreshUser } = useUser();

  // ── All logic unchanged ──
  useEffect(() => {
    if (refreshUser) refreshUser();
    const fetchData = async () => {
      try {
        const [testsRes, resultsRes, lbRes, notesRes] = await Promise.all([
          api.get("/assessments"),
          api.get("/assessments/results/user"),
          api.get("/users/leaderboard").catch(() => ({ data: [] })),
          api.get("/notes").catch(() => ({ data: [] }))
        ]);
        setGeneratedTests(testsRes.data);
        setUserResults(resultsRes.data);
        setLeaderboard(lbRes.data);
        setUserNotes(notesRes.data);
      } catch (err) {
        console.error("Error fetching assessment data:", err);
      }
    };
    fetchData();
  }, []);

  const handleStartTest = (testId) => navigate(`/assessment/${testId}`);
  const handlePrepare = (subject) => navigate('/view', { state: { subject } });
  const toggleExpand = (testId) => setSelectedTestId(prev => prev === testId ? null : testId);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await api.delete(`/assessments/${id}`);
      setGeneratedTests(prev => prev.map(t => t._id === id ? { ...t, removing: true } : t));
      setTimeout(() => setGeneratedTests(prev => prev.filter(t => t._id !== id)), 300);
    } catch (error) {
      console.error("DELETE ERROR:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Failed to delete assessment.";
      alert(msg);
    }
  };

  const handleGenerateTest = async () => {
    if (!selectedFile) { alert("Please upload a file first."); return; }
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("subject", genSubject);
      formData.append("type", genType);
      formData.append("difficulty", difficulty);
      formData.append("questionsCount", questionsCount);
      formData.append("shuffle", shuffle);
      const res = await api.post("/assessments/generate", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setGeneratedTests(prev => [res.data, ...prev]);
      console.log(res.data);
      alert("Test generated successfully!");
      setShowGenerateModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to generate test.");
    } finally {
      setIsGenerating(false);
    }
  };

  const diffChipClass = { easy: 'as-chip--easy', medium: 'as-chip--medium', hard: 'as-chip--hard' };

  return (
    <>
      <div className="as-root">

        {/* mesh background — same as AcademicAI */}
        <div className="as-bg">
          <div className="as-bg__blob-teal" />
          <div className="as-bg__blob-pink" />
          <div className="as-bg__blob-sage" />
          <div className="as-bg__blob-accent" />
        </div>
        <div className="as-grid" />

        <div className="as-wrap">



          {/* page header */}
          <header className="as-header">
            <div className="as-header__left">
              <h1 className="as-page-title">
                Your <span className="as-hl-pink">Assessments</span>
              </h1>
              <p className="as-page-sub">
                Test your knowledge and climb the leaderboard.
              </p>
              <div className="as-badges">
                <span className="as-badge">🔥 Streak: 5</span>
                <span className="as-badge">🏆 Rank: #12</span>
              </div>
            </div>
            <div className="as-header__actions">
              <button className="as-btn-scores" onClick={() => setShowScoreModal(true)}>
                <FaTrophy style={{ color: '#f59e0b' }} /> Scores
              </button>
              <button className="as-btn-gen" onClick={() => setShowGenerateModal(true)}>
                <FaPlus /> Generate Test
              </button>
            </div>
          </header>

          {/* test list */}
          {generatedTests.length === 0 && (
            <div className="as-empty">No assessments found. Generate one to get started!</div>
          )}

          <div className="as-list-grid">
            {generatedTests.map(test => {
              const isExpanded = selectedTestId === test._id;
              return (
                <div
                  key={test._id}
                  className={`as-card${isExpanded ? ' as-card--expanded' : ''}${test.removing ? ' as-card--removing' : ''}`}
                >
                  <div className="as-card__head" onClick={() => toggleExpand(test._id)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="as-card__title">
                        {test.title ? test.title.replace(/^(?:WRITTEN|MCQ)\s*-\s*/i, '') : 'Assessment'}
                      </div>
                      <div className="as-card__info">
                        {test.questions?.length || 0} Questions • {test.duration} min
                      </div>
                      <div className="as-card__status">
                        <span className={`as-chip ${diffChipClass[test.difficulty] || 'as-chip--medium'}`}>
                          {{ easy: '🌿 Easy', medium: '⚡ Medium', hard: '🔥 Hard' }[test.difficulty]}
                        </span>
                        {userResults.some(r => r.assessmentId?._id === test._id) ? (
                          <span className="as-chip as-chip--done"><FaCheck style={{ fontSize: 9 }} /> Completed</span>
                        ) : (
                          <span className="as-chip as-chip--pending">Not Attempted</span>
                        )}
                      </div>
                    </div>
                    <div className="as-card__head-right">
                      <span className="as-chip as-chip--creator">
                        👤 {test.creatorName || "Scholar"}
                      </span>
                      <div className="as-card__toggle">
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="as-card__body">
                      <div className="as-card__body-blobs">
                        <div className="as-card__blob as-card__blob--1" />
                        <div className="as-card__blob as-card__blob--2" />
                        <div className="as-card__blob as-card__blob--3" />
                        <div className="as-card__blob as-card__blob--4" />
                      </div>
                      <div className="as-card__body-inner">
                        <div className="as-notes-label">
                          <FaBookOpen /> <span className="as-hl-sage">Recommended Study Material</span>
                        </div>
                        {userNotes.filter(n => n.subject?.toLowerCase() === test.subject?.toLowerCase()).length > 0 ? (
                          <div className="as-notes-grid">
                            {userNotes
                              .filter(n => n.subject?.toLowerCase() === test.subject?.toLowerCase())
                              .map(note => (
                                <div key={note._id} className="as-note-card">
                                  <div className="as-note-icon"><FaFileAlt /></div>
                                  <span className="as-note-title">{note.title}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="as-no-notes">No notes available for this subject.</p>
                        )}
                        <div className="as-actions">
                          <button className="as-btn-prepare" onClick={() => handlePrepare(test.subject)}>
                            <FaFileAlt /> Prepare with Notes
                          </button>
                          <button className="as-btn-start" onClick={() => handleStartTest(test._id)}>
                            Start Assessment <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                          </button>
                          <button className="as-btn-delete" onClick={() => handleDelete(test._id)} title="Delete Assessment">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ SCORE MODAL ══ */}
        {showScoreModal && (
          <div className="as-modal-bg">
            <div className="as-modal">
              <div className="as-modal__banner" />
              <div className="as-modal__content">
                {/* left */}
                <div className="as-modal__left">
                  <p className="as-modal__left-title">
                    Your <span className="as-hl-pink">Performance</span>
                  </p>
                  <p className="as-modal__left-sub">Track your learning journey and milestones</p>

                  <div className="as-score-hero">
                    <div className="as-score-hero__bg-icon">🏆</div>
                    <div className="as-score-hero__inner">
                      <div>
                        <div className="as-score-hero__label">Total Accumulated <span className="as-hl-teal">Score</span></div>
                        <div className="as-score-hero__pts">
                          <CountUp end={user?.totalScore || 0} /><small>pts</small>
                        </div>
                        <div className="as-score-hero__xp">
                          <div className="as-score-hero__xp-dot" />
                          <span className="as-score-hero__xp-text">+250 XP earned today</span>
                        </div>
                      </div>
                      <div className="as-score-hero__rank">
                        <div className="as-score-hero__rank-icon"><FaTrophy style={{ color: '#fde68a' }} /></div>
                        <div className="as-score-hero__rank-label">Current Rank</div>
                        <div className="as-score-hero__rank-val">#12</div>
                      </div>
                    </div>
                  </div>

                  <div className="as-section-label">Knowledge Mastery</div>
                  {user && user.subjectScores && Object.keys(user.subjectScores).length > 0 ? (
                    Object.entries(user.subjectScores).map(([subject, score]) => (
                      <div key={subject} className="as-mastery-item">
                        <div className="as-mastery-row">
                          <span className="as-mastery-name">{subject}</span>
                          <span className="as-mastery-pts">{score} pts</span>
                        </div>
                        <div className="as-mastery-track">
                          <div className="as-mastery-fill" style={{ width: `${Math.min((score / 500) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="as-mastery-empty">Complete an assessment to see your analytics</div>
                  )}

                  {userResults.length > 0 && (
                    <>
                      <div className="as-section-label">Recent Activity</div>
                      {userResults.slice(0, 5).map(result => (
                        <div key={result._id} className="as-activity-item">
                          <div className="as-activity-left">
                            <div className={`as-activity-pct ${result.percentage >= 80 ? 'as-activity-pct--hi' : result.percentage >= 50 ? 'as-activity-pct--mid' : 'as-activity-pct--lo'}`}>
                              {result.percentage}%
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="as-activity-title">{result.assessmentId?.title || "Deleted Assessment"}</div>
                              <div className="as-activity-date">{new Date(result.completedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <button className="as-activity-review" onClick={() => navigate(`/assessment/review/${result._id}`)}>
                            Review
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {user?.subjectScores && Object.keys(user.subjectScores).length > 0 && (
                    <div className="as-mini-grid">
                      <div className="as-mini-card as-mini-card--teal">
                        <div className="as-mini-card__label">Strongest Category</div>
                        <div className="as-mini-card__val">{Object.entries(user.subjectScores).sort((a, b) => b[1] - a[1])[0][0]}</div>
                      </div>
                      <div className="as-mini-card as-mini-card--pink">
                        <div className="as-mini-card__label">Active Streak</div>
                        <div className="as-mini-card__val">5 Days 🔥</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* right — leaderboard */}
                <div className="as-modal__right">
                  <div className="as-modal__right-bg">🏆</div>
                  <div className="as-lb-header">
                    <div>
                      <div className="as-lb-title">🏆 Hall of <span className="as-hl-pink">Fame</span></div>
                      <div className="as-lb-sub">Top performers this week</div>
                    </div>
                    <button className="as-close-btn" onClick={() => setShowScoreModal(false)}><FaTimes /></button>
                  </div>

                  <div className="as-lb-list">
                    {leaderboard && leaderboard.length > 0 ? (
                      leaderboard.map((lbUser, idx) => {
                        const isMe = lbUser._id === user?._id;
                        return (
                          <div key={lbUser._id} className={`as-lb-item${isMe ? ' as-lb-item--me' : ''}`}>
                            <div className="as-lb-rank">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                            </div>
                            <div className="as-lb-avatar">
                              {lbUser.name?.[0]?.toUpperCase() || lbUser.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="as-lb-name">
                                {lbUser.name || lbUser.email?.split('@')[0]}
                                {isMe && <span className="as-lb-you"> · YOU</span>}
                              </div>
                              <div className="as-lb-meta">{lbUser.streak || 0}d streak &nbsp;·&nbsp; ↑ 2 ranks</div>
                            </div>
                            <div className="as-lb-pts">
                              <div className="as-lb-pts-val">{lbUser.totalScore || 0}</div>
                              <div className="as-lb-pts-label">pts</div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="as-lb-empty">No leaderboard data available yet</div>
                    )}
                  </div>

                  <div className="as-rank-banner">
                    <div className="as-rank-banner__left">
                      <div className="as-rank-banner__badge">#12</div>
                      <div>
                        <div className="as-rank-banner__label">Your Global Rank</div>
                        <div className="as-rank-banner__val">Top 5% Students</div>
                      </div>
                    </div>
                    <div className="as-rank-banner__up"><FaChevronUp /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ GENERATE DRAWER ══ */}
        {showGenerateModal && (
          <div className="as-drawer-bg">
            <div className="as-drawer-backdrop" onClick={() => setShowGenerateModal(false)} />
            <div className="as-drawer-panel">

              <div className="as-drawer-head">
                <div>
                  <div className="as-drawer-title">Generate AI Test</div>
                  <div className="as-drawer-sub">Create an assessment with AI</div>
                </div>
                <button className="as-close-btn" onClick={() => setShowGenerateModal(false)}><FaTimes /></button>
              </div>

              <div className="as-drawer-body">
                <div className="as-drawer-section">
                  <label className="as-drawer-label">Source Material</label>
                  <label className="as-upload-zone">
                    <input
                      type="file" accept=".pdf,.doc,.docx,.ppt,.pptx"
                      style={{ display: 'none' }}
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <div className="as-upload-icon"><FaFileAlt /></div>
                    <div className="as-upload-text">Click to upload or drag & drop</div>
                    <div className="as-upload-hint">PDF, DOCX, or PPTX (Max 20MB)</div>
                  </label>
                  {selectedFile && (
                    <div className="as-file-chip">
                      <div className="as-file-chip__left">
                        <div className="as-file-chip__icon"><FaCheck /></div>
                        <span className="as-file-chip__name">{selectedFile.name}</span>
                      </div>
                      <button className="as-file-chip__remove" onClick={() => setSelectedFile(null)}><FaTimes /></button>
                    </div>
                  )}
                </div>

                <div className="as-drawer-section">
                  <label className="as-drawer-label">Subject Category</label>
                  <select className="as-select" value={genSubject} onChange={e => setGenSubject(e.target.value)}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="as-drawer-section">
                  <label className="as-drawer-label">Assessment Format</label>
                  <div className="as-seg">
                    <button type="button" className={`as-seg-btn${genType === 'mcq' ? ' as-seg-btn--active' : ''}`} onClick={() => setGenType('mcq')}>Multiple Choice</button>
                    <button type="button" className={`as-seg-btn${genType === 'written' ? ' as-seg-btn--active' : ''}`} onClick={() => setGenType('written')}>Written Answer</button>
                  </div>
                </div>

                <div className="as-drawer-section">
                  <div className="as-form-grid">
                    <div>
                      <label className="as-drawer-label">Difficulty</label>
                      <select className="as-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="as-drawer-label">Questions</label>
                      <input type="number" min="1" max="30" className="as-number" value={questionsCount} onChange={e => setQuestionsCount(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="as-drawer-section">
                  <label className="as-checkbox-row">
                    <input type="checkbox" checked={shuffle} onChange={() => setShuffle(!shuffle)} />
                    <span>Shuffle Question Order</span>
                  </label>
                </div>
              </div>

              <div className="as-drawer-foot">
                <button className="as-btn-generate" onClick={handleGenerateTest} disabled={isGenerating}>
                  {isGenerating ? (
                    <><div className="as-spinner" /><span>Generating...</span></>
                  ) : (
                    <><span>Generate Assessment</span><FaPlayCircle /></>
                  )}
                </button>
                <div className="as-drawer-foot-hint">AI-generated tests can take up to 30 seconds to process.</div>
              </div>
            </div>
          </div>
        )}

      </div >
    </>
  );
}