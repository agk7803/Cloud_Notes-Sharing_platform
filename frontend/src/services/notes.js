import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";

// Add new note
export const addNote = async (title, content) => {
    const user = auth.currentUser;

    if (!user) throw new Error("Not logged in");

    await addDoc(collection(db, "notes"), {
        title,
        content,
        userId: user.uid,
        createdAt: new Date(),
    });
};

// Get user's notes
export const getMyNotes = async () => {
    const user = auth.currentUser;

    if (!user) return [];

    const q = query(
        collection(db, "notes"),
        where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
};