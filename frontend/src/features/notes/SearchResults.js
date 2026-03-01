import React from "react";
import { useLocation } from "react-router-dom";
import { useNotes } from "./NoteContext";

export default function SearchResults() {
  const { notes } = useNotes();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const query = params.get("q")?.toLowerCase() || "";

  const filteredNotes = notes.filter((note) =>
    note.title?.toLowerCase().includes(query)
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h2>

      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-white p-4 rounded-xl border shadow-sm"
            >
              <h4 className="font-bold text-sm">
                {note.title}
              </h4>

              <p className="text-xs text-gray-400">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No matching notes found.
        </p>
      )}
    </div>
  );
}
