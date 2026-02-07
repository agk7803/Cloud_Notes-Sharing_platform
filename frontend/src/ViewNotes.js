import React, { useState } from 'react';
import { FaPlus, FaSearch, FaFilter, FaFilePdf, FaEllipsisV, FaLock, FaGlobe, FaUsers } from 'react-icons/fa';
import UploadModal from './UploadModal';
import { useNotes } from './NoteContext';

export default function ViewNotes() {
  const { notes, addNote, deleteNote } = useNotes();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, private, shared
  const [search, setSearch] = useState('');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || note.subject.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all'
      ? true
      : filter === 'private' ? note.visibility === 'private'
        : note.visibility !== 'private';
    return matchesSearch && matchesFilter;
  });

  const getVisibilityIcon = (vis) => {
    switch (vis) {
      case 'private': return <FaLock className="text-gray-400" />;
      case 'public': return <FaGlobe className="text-green-500" />;
      case 'groups': return <FaUsers className="text-purple-500" />;
      default: return <FaLock />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfa] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <p className="text-gray-500 mt-1">Manage your personal cloud library.</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <FaPlus /> Upload Note
          </button>
        </header>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
            {['All', 'Private', 'Shared'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.toLowerCase()
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
              <FaSearch className="absolute left-3.5 top-3 text-gray-400" />
            </div>
            <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
              <FaFilter />
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map(note => (
              <div key={note.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group flex flex-col h-64">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
                    <FaFilePdf />
                  </div>
                  <button className="text-gray-300 hover:text-gray-600">
                    <FaEllipsisV />
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{note.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-3">{note.subject}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags?.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                  <span>{note.date} • {note.size}</span>
                  <div className="flex items-center gap-1.5" title={`Visibility: ${note.visibility}`}>
                    {getVisibilityIcon(note.visibility)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-3xl">
              <FaFilePdf />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No notes found</h3>
            <p className="text-gray-500 text-sm">Upload a note to get started or adjust your filters.</p>
          </div>
        )}

        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUpload={addNote}
        />
      </div>
    </div>
  );
}