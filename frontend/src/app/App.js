import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Auth
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';

// Landing / Public
import Landing from '../features/landing/Landing';
import About from '../features/landing/About';
import Contact from '../features/landing/Contact';
import Privacy from '../features/landing/Privacy';
import Terms from '../features/landing/Terms';
import FAQ from '../features/landing/FAQ';

// Shared
import Layout from '../shared/Layout';

// Features
import Dashboard from '../features/dashboard/Dashboard';
import ViewNotes from '../features/notes/ViewNotes';
import { NoteProvider } from '../features/notes/NoteContext';
import SearchResults from '../features/notes/SearchResults';
import Assessments from '../features/assessments/Assessments';
import TestWindow from '../features/assessments/TestWindow';
import TakeAssessment from '../features/assessments/TakeAssessment';
import Calendar from '../features/calendar/Calendar';
import StudyGroups from '../features/groups/StudyGroups';
import GroupPage from '../features/groups/GroupPage';
import Profile from '../features/profile/Profile';
import AcademicAI from '../features/ai/AcademicAI';


import AssessmentReview from '../features/assessments/AssessmentReview';
import { UserProvider } from '../shared/UserContext';


function App() {
    return (
        <UserProvider>
            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<SearchResults />} />


                {/* Routes with Persistent Sidebar + NoteProvider */}
                <Route
                    element={
                        <NoteProvider>
                            <Layout />
                        </NoteProvider>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/view" element={<ViewNotes />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/assessments" element={<Assessments />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/groups" element={<StudyGroups />} />
                    <Route path="/groups/:id" element={<GroupPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/academic-ai" element={<AcademicAI />} />

                </Route>

                {/* Standalone Routes (Focus Mode) */}
                <Route path="/test-window/:testId" element={<TestWindow />} />
                <Route path="/assessment/:id" element={<TakeAssessment />} />
                <Route path="/assessment/review/:resultId" element={<AssessmentReview />} />

            </Routes>
        </UserProvider>
    );
}

export default App;
