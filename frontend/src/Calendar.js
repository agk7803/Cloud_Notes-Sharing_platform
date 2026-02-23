import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaClock, FaClipboardList, FaBook, FaUsers, FaPlus } from 'react-icons/fa';

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const EVENTS = [
    { id: 1, title: 'Cloud Computing Midterm', type: 'exam', time: '10:00 AM', duration: '90 min', date: '2026-02-12' },
    { id: 2, title: 'AI Study Group', type: 'group', time: '2:00 PM', duration: '1h', date: '2026-02-05' },
    { id: 3, title: 'Web Eng Project Due', type: 'deadline', time: '11:59 PM', duration: '', date: '2026-02-14' },
    { id: 4, title: 'Compiler Design Lab', type: 'study', time: '4:00 PM', duration: '2h', date: '2026-02-18' },
    { id: 5, title: 'Data Mining Quiz', type: 'exam', time: '1:00 PM', duration: '45 min', date: '2026-02-25' },
    { id: 6, title: 'Soft Computing Lab', type: 'group', time: '1:00 PM', duration: '2h', date: '2026-03-05' },
];

const AddEventModal = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('study');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            id: Date.now(),
            title,
            type,
            date,
            time,
            duration: '1h' // Default
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Add New Event</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1dc962] outline-none" placeholder="Ex: Math Final" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded-lg outline-none">
                            <option value="study">Study</option>
                            <option value="exam">Exam</option>
                            <option value="deadline">Deadline</option>
                            <option value="group">Group</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                            <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border rounded-lg outline-none" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#1dc962] text-white font-bold rounded-xl hover:bg-green-600 transition-colors">
                        Add Event
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Mock Streak Data (Logic Fix: Use local date strings)
    // In real app, this should only include past dates or today, never future.
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    // Mock: Today and Yesterday
    const STREAK_DAYS = [
        todayStr,
        new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
    ];

    const [events, setEvents] = useState(EVENTS);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddEvent = (newEvent) => {
        setEvents([...events, newEvent]);
    };

    // Calendar Navigation
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // Grid Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun

    const startingEmptySlots = Array.from({ length: firstDayOfMonth }, () => null);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarGrid = [...startingEmptySlots, ...daysArray];

    // Pad end to make full rows
    const remainingSlots = 35 - calendarGrid.length;
    if (remainingSlots > 0) {
        const totalSlots = Math.ceil(calendarGrid.length / 7) * 7;
        const slotsToAdd = totalSlots - calendarGrid.length;
        for (let i = 0; i < slotsToAdd; i++) calendarGrid.push(null);
    }

    // Helper: Normalize date for comparison (strip time)
    const normalizeDate = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    };

    const getEventsForDate = (day) => {
        if (!day) return [];
        // Construct date for this grid cell
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // Fix: Use local formatting to match
        const cellDateStr = cellDate.toLocaleDateString('en-CA');
        return events.filter(e => e.date === cellDateStr);
    };

    const getSelectedEvents = () => {
        const dateStr = selectedDate.toLocaleDateString('en-CA');
        return events.filter(e => e.date === dateStr);
    };

    const isSelected = (day) => {
        if (!day) return false;
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return normalizeDate(cellDate) === normalizeDate(selectedDate);
    };

    // Fix Streak Check
    const isStreakDay = (day) => {
        if (!day) return false;
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const cellDateStr = cellDate.toLocaleDateString('en-CA');

        // Ensure no future fire (though STREAK_DAYS hopefully doesn't have them)
        // Check if cellDate is in future relative to today
        if (cellDate > new Date()) return false;

        return STREAK_DAYS.includes(cellDateStr);
    };

    const handleDateClick = (day) => {
        if (day) {
            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        }
    };

    // Formatting
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const selectedDateStr = selectedDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-6 p-4 overflow-hidden">

            {/* Left Sidebar - Upcoming & Stats */}
            <aside className="w-full lg:w-1/3 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">

                {/* Header / Profile Context */}
                <div className="mb-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">My Calendar</h1>
                            <p className="text-xs text-gray-500">Scheduled events</p>
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#1dc962] transition-all hover:rotate-90">
                            <FaPlus />
                        </button>
                    </div>
                </div>

                {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} onAdd={handleAddEvent} />}

                {/* Selected Day Events */}
                <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-sm transition-all hover:shadow-md flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                        <span>Events</span>
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedDateStr}</span>
                    </h3>

                    <div className="space-y-3">
                        {getSelectedEvents().length > 0 ? (
                            getSelectedEvents().map(ev => (
                                <div key={ev.id} className="flex gap-3 items-start p-3 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer group">
                                    <div className="flex flex-col items-center min-w-[3rem]">
                                        <span className="text-xs font-bold text-gray-500">{ev.time.split(' ')[0]}</span>
                                        <span className="text-[10px] text-gray-400">{ev.time.split(' ')[1]}</span>
                                    </div>
                                    <div className="w-1 h-8 bg-gray-200 rounded-full group-hover:bg-[#1dc962] transition-colors"></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{ev.title}</h4>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            {ev.type === 'exam' ? <FaClipboardList className="text-black" /> : <FaBook className="text-[#1dc962]" />}
                                            {ev.type}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No events for this day.
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Right Main Calendar - Glassmorphism */}
            <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-8 flex flex-col h-full">

                {/* Calendar Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-300">Month View</div>
                    </div>

                    <div className="flex items-center gap-4 cursor-default">
                        <div className="text-right hidden sm:block">
                            <h2 className="text-2xl font-black text-gray-800 min-w-[12rem] text-right">{monthName} {year}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-50 hover:text-[#1dc962] transition-colors"><FaChevronLeft size={10} /></button>
                            <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-50 hover:text-[#1dc962] transition-colors"><FaChevronRight size={10} /></button>
                        </div>
                    </div>
                </header>

                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col">
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 flex-1 border-t border-gray-100 auto-rows-fr">
                        {calendarGrid.map((day, idx) => {
                            const dayEvents = getEventsForDate(day);
                            const selected = isSelected(day);
                            const streak = isStreakDay(day);

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleDateClick(day)}
                                    className={`border-b border-r border-gray-50 p-2 relative transition-all min-h-[80px] 
                                    ${idx % 7 === 6 ? 'border-r-0' : ''} 
                                    ${!day ? 'bg-gray-50/30' : 'hover:bg-white/50 cursor-pointer'}
                                    ${selected ? 'bg-green-50/50 ring-2 ring-inset ring-[#1dc962] z-10' : ''}
                                `}>
                                    {day && (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-sm font-medium block transition-colors ${selected ? 'text-[#1dc962] font-bold' : 'text-gray-700'
                                                    }`}>
                                                    {day}
                                                </span>
                                                {streak && (
                                                    <span className="text-[10px] text-orange-500" title="Streak Active">🔥</span>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                {dayEvents.map((ev, i) => (
                                                    <div key={i} className={`text-[10px] p-1.5 rounded-lg font-bold truncate leading-tight mb-1
                                                        ${ev.type === 'exam' ? 'bg-black/5 text-black' :
                                                            ev.type === 'study' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                    `}>
                                                        {ev.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
