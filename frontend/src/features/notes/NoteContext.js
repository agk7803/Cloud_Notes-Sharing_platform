import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../services/api';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotes = async (onlyMyNotes = true) => {
        try {
            const url = onlyMyNotes ? '/notes?onlyMyNotes=true' : '/notes';
            const res = await api.get(url);
            setNotes(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notes:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchNotes();   // fetch only after user exists
            } else {
                setNotes([]);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const addNote = async (newNoteData) => {
        try {
            const formData = new FormData();
            formData.append('title', newNoteData.title);
            formData.append('subject', newNoteData.subject);
            formData.append('file', newNoteData.file);
            // authorId and authorName are handled by backend via token
            formData.append('visibility', newNoteData.visibility);

            if (newNoteData.sharedGroups) {
                formData.append('sharedGroups', JSON.stringify(newNoteData.sharedGroups));
            }

            const res = await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Upload Successful!"); // Feedback for user
            setNotes((prev) => [res.data, ...prev]);
        } catch (error) {
            console.error("Error uploading note:", error);
            const msg = error.response?.data?.message || error.message;
            alert(`Upload Failed: ${msg}`);
        }
    };

    const deleteNote = async (id) => {
        try {
            await api.delete(`/notes/${id}`);
            setNotes((prev) => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    const getGroupNotes = (groupId) => {
        return notes.filter(n =>
            n.visibility === 'public_group' ||
            ((n.visibility === 'groups' || n.visibility === 'private_group') && n.sharedGroups.includes(groupId))
        );
    };

    return (
        <NoteContext.Provider value={{ notes, fetchNotes, addNote, deleteNote, getGroupNotes, loading }}>
            {children}
        </NoteContext.Provider>
    );
};
