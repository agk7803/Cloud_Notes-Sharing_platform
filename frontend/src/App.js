import { useState, useEffect } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { addNote, getMyNotes } from "./services/notes";

function App() {
    const [user, setUser] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        auth.onAuthStateChanged(u => {
            setUser(u);
            if (u) loadNotes();
        });
    }, []);

    const loadNotes = async () => {
        const data = await getMyNotes();
        setNotes(data);
    };

    const login = async () => {
        await signInWithPopup(auth, googleProvider);
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setNotes([]);
    };

    const save = async () => {
        await addNote(title, content);
        setTitle("");
        setContent("");
        loadNotes();
    };

    return (
        <div style={{ padding: "40px" }}>
            <h1>STUNOTES</h1>

            {!user ? (
                <button onClick={login}>Login</button>
            ) : (
                <>
                    <p>Welcome, {user.email}</p>
                    <button onClick={logout}>Logout</button>

                    <hr />

                    <input
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <br /><br />

                    <textarea
                        placeholder="Content"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                    <br /><br />

                    <button onClick={save}>Save Note</button>

                    <hr />

                    <h3>My Notes</h3>

                    {notes.map(n => (
                        <div key={n.id}>
                            <h4>{n.title}</h4>
                            <p>{n.content}</p>
                            <hr />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default App;