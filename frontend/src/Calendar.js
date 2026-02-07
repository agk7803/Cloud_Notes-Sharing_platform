import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaClock, FaClipboardList, FaBook, FaUsers, FaPlus } from 'react-icons/fa';

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const EVENTS = [
    { id: 1, title: 'Linear Algebra Midterm', type: 'exam', time: '10:00 AM', duration: '90 min', date: '2026-02-12' },
    { id: 2, title: 'Calculus Study Group', type: 'group', time: '2:00 PM', duration: '1h', date: '2026-02-05' },
    { id: 3, title: 'Biology Lab Report Due', type: 'deadline', time: '11:59 PM', duration: '', date: '2026-02-14' },
    { id: 4, title: 'Personal Study: History', type: 'study', time: '4:00 PM', duration: '2h', date: '2026-02-18' },
    { id: 5, title: 'Physics Quiz', type: 'exam', time: '1:00 PM', duration: '45 min', date: '2026-02-25' },
    { id: 6, title: 'Chemistry Lab', type: 'group', time: '1:00 PM', duration: '2h', date: '2026-03-05' },
];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Start Feb 2026
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 7)); // Mock current date

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

    // Event Filtering
    const getEventsForDate = (day) => {
        if (!day) return [];
        // Create date object for the day in the grid, explicitly handling time zone/offset issues by using year/month/day constructor
        const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12));
        return EVENTS.filter(e => e.date === dateStr);
    };

    const getSelectedEvents = () => {
        const dateStr = formatDate(selectedDate);
        return EVENTS.filter(e => e.date === dateStr);
    };

    const isSelected = (day) => {
        if (!day) return false;
        return selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getFullYear() === currentDate.getFullYear();
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
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-black text-black tracking-tight">My Calendar</h1>
                        <p className="text-sm text-gray-500">Don't miss scheduled events</p>
                    </div>
                    <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors">
                        <FaPlus />
                    </button>
                </div>

                {/* Upcoming Events List (Selected Date) */}
                <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                        <span>Schedule</span>
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
                                    <div className="w-1 h-8 bg-gray-200 rounded-full group-hover:bg-green-400 transition-colors"></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{ev.title}</h4>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            {ev.type === 'exam' ? <FaClipboardList className="text-purple-500" /> : <FaBook className="text-blue-500" />}
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

                {/* Upcoming Events List (General Future) */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 px-1">Upcoming</h3>
                    <div className="space-y-3">
                        {EVENTS.filter(e => new Date(e.date) >= new Date(2026, 1, 1)).slice(0, 3).map((ev) => (
                            <div key={ev.id} className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-green-700 transition-colors">{ev.title}</h4>
                                    <p className="text-xs text-gray-500">{ev.date} • {ev.time}</p>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${ev.type === 'exam' ? 'bg-black' :
                                        ev.type === 'study' ? 'bg-green-500' : 'bg-gray-400'
                                    }`}></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Card (Black & Green Accent) */}
                <div className="mt-auto bg-black text-white p-6 rounded-3xl relative overflow-hidden shadow-lg shadow-gray-300">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-1">Weekly Focus</h3>
                        <p className="text-gray-400 text-xs mb-6">Your study performance</p>

                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-green-400">12h</span>
                            <span className="text-gray-400 text-sm mb-1">/ 15h goal</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: '80%' }}></div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl"></div>
                </div>
            </aside>

            {/* Right Main Calendar - Glassmorphism */}
            <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-8 flex flex-col h-full">

                {/* Calendar Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-300">Month</div>
                        <div className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors cursor-pointer">Week</div>
                        <div className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors cursor-pointer">Day</div>
                    </div>

                    <div className="flex items-center gap-4 cursor-default">
                        <div className="text-right hidden sm:block">
                            <h2 className="text-2xl font-black text-gray-800 min-w-[12rem] text-right">{monthName} {year}</h2>
                            <span className="text-xs text-gray-400 font-bold block text-right">Current View</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"><FaChevronLeft size={10} /></button>
                            <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"><FaChevronRight size={10} /></button>
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

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleDateClick(day)}
                                    className={`border-b border-r border-gray-50 p-2 relative transition-all min-h-[80px] 
                                    ${idx % 7 === 6 ? 'border-r-0' : ''} 
                                    ${!day ? 'bg-gray-50/30' : 'hover:bg-white/50 cursor-pointer'}
                                    ${selected ? 'bg-green-50/50 ring-2 ring-inset ring-green-400 z-10' : ''}
                                `}>
                                    {day && (
                                        <>
                                            <span className={`text-sm font-medium block mb-2 transition-colors ${selected ? 'text-green-600 font-bold' : 'text-gray-700'
                                                }`}>
                                                {day}
                                            </span>

                                            <div className="space-y-1">
                                                {dayEvents.map((ev, i) => (
                                                    <div key={i} className={`text-[10px] p-1.5 rounded-lg font-bold truncate leading-tight mb-1
                                                        ${ev.type === 'exam' ? 'bg-purple-100 text-purple-700' :
                                                            ev.type === 'study' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}
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
