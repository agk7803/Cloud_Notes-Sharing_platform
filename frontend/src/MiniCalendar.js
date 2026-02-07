import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

export default function MiniCalendar() {
    const navigate = useNavigate();
    // Mocking Feb 2026
    const days = Array.from({ length: 28 }, (_, i) => i + 1);

    // Mock Events
    const events = {
        5: 'study',
        12: 'exam',
        14: 'deadline',
        18: 'study',
        25: 'exam'
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/60 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">February 2026</h3>
                <button
                    onClick={() => navigate('/calendar')}
                    className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                    <FaChevronRight size={12} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <span key={d} className="text-xs font-bold text-gray-400 py-1">{d}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map(day => (
                    <div
                        key={day}
                        onClick={() => navigate('/calendar')}
                        className={`aspect-square rounded-full flex flex-col items-center justify-center text-sm font-medium cursor-pointer transition-all hover:bg-white/50 relative group
                ${day === 7 ? 'bg-purple-600 text-white shadow-md shadow-purple-200 hover:bg-purple-700' : 'text-gray-700'}
                `}
                    >
                        {day}
                        {events[day] && (
                            <div className="absolute bottom-1 w-full flex justify-center">
                                <span className={`w-1.5 h-1.5 rounded-full 
                                    ${events[day] === 'exam' ? 'bg-red-500 box-shadow-md' : events[day] === 'study' ? 'bg-blue-400' : 'bg-orange-400'}
                                `}></span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-4 mt-6 justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Exam
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Study
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span> Task
                </div>
            </div>
        </div>
    );
}
