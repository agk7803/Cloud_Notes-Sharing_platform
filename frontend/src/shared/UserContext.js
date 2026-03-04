import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (currentUser) => {
        try {
            const res = await api.get('/users/me');
            setUser({
                ...currentUser,
                ...res.data,
                photoURL: res.data.profilePicture || currentUser.photoURL,
                name: res.data.name || currentUser.displayName
            });
        } catch (error) {
            console.error("UserContext: Failed to fetch mongo user:", error);
            setUser(currentUser);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                fetchUserData(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const refreshUser = () => {
        if (auth.currentUser) {
            fetchUserData(auth.currentUser);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, refreshUser, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
