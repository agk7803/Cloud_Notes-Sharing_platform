import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import "../../styles/Calendar.css";

/* ════════════════════════════════════════
   STATIC DATA
════════════════════════════════════════ */
const INITIAL_EVENTS = [];

const TYPES = ['study', 'exam', 'deadline', 'group'];
const TYPE_LABEL = { exam: 'Exam', study: 'Study', group: 'Group', deadline: 'Deadline' };
const TYPE_ICON = { exam: '📋', study: '📖', group: '👥', deadline: '⏰' };
const TYPE_EMOJI = { study: '📖 Study', exam: '📋 Exam', deadline: '⏰ Deadline', group: '👥 Group' };
const TYPE_BG = { exam: '#7ec8c8', study: '#7ec8c8', group: '#7ec8c8', deadline: '#7ec8c8' };
const TYPE_FG = { exam: '#1a1a2e', study: '#1a1a2e', group: '#1a1a2e', deadline: '#1a1a2e' };

const todayStr = new Date().toLocaleDateString('en-CA');
const streakDays = [todayStr, new Date(Date.now() - 86400000).toLocaleDateString('en-CA')];

function Logo({ size = 20 }) {
    return (
        <span className="bs-logo" style={{ fontSize: size }}>
            <span className="bs-logo__bracket">[</span>
            <span className="bs-logo__text">byte</span>
            <span className="bs-logo__dot">.</span>
            <span className="bs-logo__text">scholar</span>
            <span className="bs-logo__bracket">]</span>
        </span>
    );
}

const fmt = (y, m, d) => new Date(y, m, d).toLocaleDateString('en-CA');
const fmt12 = (t) => {
    const [h, min] = t.split(':');
    const hr = +h;
    return `${hr % 12 || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;
};

/* ════════════════════════════════════════
   ACCORDION / SWIPE-TO-DELETE ROW
════════════════════════════════════════ */
function AccRow({ ev, onDelete }) {
    return (
        <div className="acc-row">
            <div className="acc-row__content">
                <div className="acc-bar" />
                <div className="acc-info">
                    <div className="acc-title">{ev.title}</div>
                    <div className="acc-sub">{ev.time}{ev.duration ? ` · ${ev.duration}` : ''}</div>
                </div>
                <button className="acc-inline-del" onClick={() => onDelete(ev.id)} title="Delete Event">
                    🗑
                </button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════
   DETAIL CARD
════════════════════════════════════════ */
function DetailCard({ selectedDate, events, onClear, onDelete, flashRef }) {
    const dayEvts = selectedDate ? events.filter(e => e.date === selectedDate) : [];

    const label = selectedDate
        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', {
            weekday: 'long', month: 'long', day: 'numeric',
        })
        : 'Select a day';



    return (
        <div className="cal-detail-card" ref={flashRef}>
            {/* Header */}
            <div className="cal-detail-card__header">
                <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="cal-detail-card__date">{label}</span>
                    <div className="cal-detail-card__meta">
                        <span className="cal-detail-card__count">
                            {selectedDate
                                ? `${dayEvts.length} event${dayEvts.length !== 1 ? 's' : ''}`
                                : 'Click a date'}
                        </span>

                    </div>
                </div>
                {selectedDate && (
                    <button className="cal-detail-card__close" onClick={onClear}>✕</button>
                )}
            </div>

            {/* Body */}
            <div className="cal-detail-body">
                {!selectedDate && (
                    <div className="cal-empty">
                        <div className="cal-empty__icon">📅</div>
                        <p className="cal-empty__text">Click any date on the calendar<br />to see its events here.</p>
                    </div>
                )}
                {selectedDate && dayEvts.length === 0 && (
                    <div className="cal-empty">
                        <div className="cal-empty__icon">🌿</div>
                        <p className="cal-empty__text">No events on this day.<br />Add one below!</p>
                    </div>
                )}
                {selectedDate && dayEvts.length > 0 && (
                    <>
                        {dayEvts.map(ev => (
                            <AccRow key={ev.id} ev={ev} onDelete={onDelete} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════
   ADD EVENT CARD
════════════════════════════════════════ */
function AddCard({ selectedDate, onAdd }) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('study');
    const [date, setDate] = useState(selectedDate || todayStr);
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('');
    const [errors, setErrors] = useState({});

    // Sync the date field whenever the user clicks a new day on the main calendar
    const prevSelectedRef = useRef(selectedDate);
    if (selectedDate && selectedDate !== prevSelectedRef.current) {
        prevSelectedRef.current = selectedDate;
        setDate(selectedDate);
    }

    const validate = () => {
        const e = {};
        if (!title.trim()) e.title = true;
        if (!date) e.date = true;
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onAdd({ id: Date.now(), title: title.trim(), type, date, time: time ? fmt12(time) : '', duration });
        setTitle('');
        setTime('');
        setDuration('');
        setErrors({});
    };

    return (
        <div className="cal-add-card">
            {/* Header */}
            <div className="cal-add-card__header">
                <span className="cal-add-card__title">+ New Event</span>
                <span className="cal-add-card__sub">
                    {selectedDate ? 'Adding to selected date' : 'Fill in the details below'}
                </span>
            </div>

            <div className="cal-add-form">
                {/* Title */}
                <div className="cal-field">
                    <label className="cal-field__label">Title</label>
                    <input
                        className={`cal-input${errors.title ? ' cal-input--error' : ''}`}
                        type="text"
                        value={title}
                        onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: false })); }}
                        placeholder="e.g. Algorithms Final"
                    />
                </div>

                <div className="cal-field"></div>

                {/* Date + Time (side by side) */}
                <div className="cal-form-row">
                    <div className="cal-field">
                        <label className="cal-field__label">
                            Date
                            {errors.date && (
                                <span style={{ color: '#ff4d6d', fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>*</span>
                            )}
                        </label>
                        <input
                            className={`cal-input${errors.date ? ' cal-input--error' : ''}`}
                            type="date"
                            value={date}
                            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: false })); }}
                        />
                    </div>
                    <div className="cal-field">
                        <label className="cal-field__label">
                            Time
                            {errors.time && (
                                <span style={{ color: '#ff4d6d', fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>*</span>
                            )}
                        </label>
                        <input
                            className={`cal-input${errors.time ? ' cal-input--error' : ''}`}
                            type="time"
                            value={time}
                            onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: false })); }}
                        />
                    </div>
                </div>

                {/* Duration */}
                <div className="cal-field">
                    <label className="cal-field__label">Duration <span>(optional)</span></label>
                    <input
                        className="cal-input"
                        type="text"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="e.g. 2h 30min"
                    />
                </div>

                <button className="cal-submit-btn" onClick={handleSubmit}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Event
                </button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════
   MAIN CALENDAR
════════════════════════════════════════ */
export default function Calendar() {
    const { user } = useOutletContext();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [activeView, setActiveView] = useState('month');
    const [searchQuery, setSearchQuery] = useState('');
    const detailCardRef = useRef(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    /* Build calendar grid */
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const prevDays = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const grid = Array.from({ length: totalCells }, (_, i) => {
        if (i < startOffset) {
            return { day: prevDays - startOffset + i + 1, dateStr: fmt(year, month - 1, prevDays - startOffset + i + 1), other: true };
        }
        if (i >= startOffset + daysInMonth) {
            const d = i - startOffset - daysInMonth + 1;
            return { day: d, dateStr: fmt(year, month + 1, d), other: true };
        }
        const d = i - startOffset + 1;
        return { day: d, dateStr: fmt(year, month, d), other: false };
    });

    /* API Operations */
    const fetchEvents = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.get('/events');
            // Backend returns _id, frontend expects id for existing code compatibility
            const normalized = res.data.map(ev => ({ ...ev, id: ev._id }));
            setEvents(normalized);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    /* Filtered events for search */
    const filteredEvents = searchQuery.trim()
        ? events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : events;

    /* Handlers */
    const handleAddEvent = async (newEv) => {
        try {
            const res = await api.post('/events', newEv);
            const saved = { ...res.data, id: res.data._id };
            setEvents(prev => [...prev, saved]);
            setSelectedDate(saved.date);

            // Auto-navigate to the added event's month
            const [y, m, d] = saved.date.split('-').map(Number);
            setCurrentDate(new Date(y, m - 1, 1));

            if (detailCardRef.current) {
                detailCardRef.current.classList.remove('success-flash');
                void detailCardRef.current.offsetWidth; // force reflow
                detailCardRef.current.classList.add('success-flash');
            }
        } catch (error) {
            console.error("Failed to add event:", error);
            alert("Failed to save event. Please try again.");
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await api.delete(`/events/${id}`);
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error("Failed to delete event:", error);
            alert("Failed to delete event.");
        }
    };

    const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
    const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };
    const goToday = () => { setCurrentDate(new Date()); setSelectedDate(null); };
    const monthLabel = currentDate.toLocaleString('default', { month: 'long' }) + ' ' + year;

    return (
        <div className="cal-app">
            <div className="cal-content">
                {/* ── Left: Main Calendar ── */}
                <div className="cal-pane">
                    <div className="cal-blob cal-blob--pink" />
                    <div className="cal-blob cal-blob--teal" />
                    <div className="cal-blob cal-blob--sage" />
                    <div className="cal-blob cal-blob--accent" />

                    {/* Toolbar */}
                    <div className="cal-toolbar">
                        <span className="cal-toolbar__month">{monthLabel}</span>
                        <div className="cal-nav-group">
                            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
                        </div>
                        <button className="cal-today-btn" onClick={goToday}>Today</button>

                    </div>

                    {/* Weekday headers */}
                    <div className="cal-weekdays">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                            <div key={d} className="cal-weekday">{d}</div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="cal-grid" style={{ gridTemplateRows: `repeat(${totalCells / 7}, 1fr)` }}>
                        {grid.map(({ day, dateStr, other }, idx) => {
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDate;
                            const isStreak = streakDays.includes(dateStr) && new Date(dateStr) <= new Date();
                            const dayEvts = filteredEvents.filter(e => e.date === dateStr);

                            let cls = 'cal-cell';
                            if (other) cls += ' cal-cell--other';
                            if (isToday) cls += ' cal-cell--today';
                            if (isSelected) cls += ' cal-cell--selected';

                            return (
                                <div
                                    key={idx}
                                    className={cls}
                                    onClick={() => !other && setSelectedDate(p => p === dateStr ? null : dateStr)}
                                >
                                    <div className="cal-cell__top">
                                        <span className="cal-cell__num">{day}</span>
                                        {isStreak && <span className="cal-cell__streak">🔥</span>}
                                    </div>
                                    <div className="cal-cell__events">
                                        {dayEvts.slice(0, 3).map((ev, i) => (
                                            <div key={i} className={`cal-chip`}>{ev.title}</div>
                                        ))}
                                        {dayEvts.length > 3 && (
                                            <div className="cal-cell__more">+{dayEvts.length - 3}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                </div>

                {/* ── Right Panel ── */}
                <div className="cal-right-pane">
                    <DetailCard
                        selectedDate={selectedDate}
                        events={filteredEvents}
                        onClear={() => setSelectedDate(null)}
                        onDelete={handleDeleteEvent}
                        flashRef={detailCardRef}
                    />
                    <AddCard
                        selectedDate={selectedDate}
                        onAdd={handleAddEvent}
                    />
                </div>
            </div>
        </div>
    );
}
