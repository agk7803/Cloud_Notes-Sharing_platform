import React, { createContext, useContext, useState } from 'react';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

const MOCK_INITIAL_NOTES = [
    {
        id: 1,
        title: "Introduction to Limits",
        subject: "Mathematics",
        author: "You",
        date: "Feb 08, 2026",
        size: "1.2 MB",
        visibility: "private", // private, public, groups
        sharedGroups: [],
        tags: ["Calculus", "Limits"]
    },
    {
        id: 2,
        title: "Newton's Laws Summary",
        subject: "Physics",
        author: "You",
        date: "Feb 07, 2026",
        size: "3.5 MB",
        visibility: "groups",
        sharedGroups: [2], // Shared with 'Physics GRE Prep' (ID: 2)
        tags: ["Classical Mechanics"]
    },
    {
        id: 3,
        title: "The French Revolution Timeline",
        subject: "History",
        author: "You",
        date: "Feb 05, 2026",
        size: "800 KB",
        visibility: "public",
        sharedGroups: [],
        tags: ["European History"]
    }
];

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState(MOCK_INITIAL_NOTES);

    const addNote = (newNote) => {
        const note = {
            id: Date.now(),
            author: "You",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            size: `${(Math.random() * 5).toFixed(1)} MB`, // Mock size
            ...newNote
        };
        setNotes((prev) => [note, ...prev]);
    };

    const deleteNote = (id) => {
        setNotes((prev) => prev.filter(n => n.id !== id));
    };

    const updateNotePermission = (id, visibility, sharedGroups = []) => {
        setNotes((prev) => prev.map(n =>
            n.id === id ? { ...n, visibility, sharedGroups } : n
        ));
    };

    const getGroupNotes = (groupId) => {
        return notes.filter(n =>
            n.visibility === 'public' ||
            (n.visibility === 'groups' && n.sharedGroups.includes(parseInt(groupId)))
        );
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote, updateNotePermission, getGroupNotes }}>
            {children}
        </NoteContext.Provider>
    );
};
